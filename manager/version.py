"""
Zeek version helper.

All available Zeek versions are stored within the zeek:versions set
in Redis. This script polls the Docker Hub API once in a while and
fetches all new tags using docker-py.
"""
import argparse
import logging
import packaging.version
import re
import time
import typing

import docker
import requests

from common import get_redis

logger = logging.getLogger(__name__)

NAMESPACE = "zeek"
REPO = "zeek"
TAGS_URL = f"https://hub.docker.com/v2/namespaces/{NAMESPACE}/repositories/{REPO}/tags"

REDIS_VERSION_KEY = "zeek:versions"


def is_acceptable_zeek_version(version: str):
    """
    For now, just the three digit version tags, avoiding the 6.0, lts
    and amd64 / arm64 architecture ones.
    """
    return re.match(r"^[0-9]+\.[0-9]+\.[0-9]+$", version) is not None


def zeek_versions_from_redis() -> typing.Tuple[str, list[str]]:
    """
    Return versions found in Redis as tuple (default, all).
    """
    redis = get_redis()
    versions = sorted(redis.smembers(REDIS_VERSION_KEY), key=packaging.version.parse)
    default = versions[-1] if len(versions) > 0 else None
    if versions == "master" and len(versions) > 1:
        return versions[-2]

    return default, versions


def pull_new_tags():
    """
    Fetch all tags from Docker Hub and pull those we do no know about yet.

    https://docs.docker.com/docker-hub/api/latest/#tag/repositories/paths/%7E1v2%7E1namespaces%7E1%7Bnamespace%7D%7E1repositories%7E1%7Brepository%7D%7E1tags/get
    """
    # We only fetch the first page to avoid unnecessarily using up space.
    max_page = 1

    session = requests.Session()
    redis = get_redis()
    docker_client = docker.Client()

    _, known_versions = zeek_versions_from_redis()
    logger.info("known_versions: %s", known_versions)

    for page in range(1, max_page + 1):
        logger.debug("Fetching tags, page %s", page)
        response = session.get(TAGS_URL, params={"page": page}, timeout=30)

        if response.status_code == 404:
            logger.debug("No more pages")
            break

        response.raise_for_status()

        for result in response.json()["results"]:
            version = result["name"]

            if not is_acceptable_zeek_version(version):
                logger.debug("Ignoring image tag %r", version)
                continue

            if version in known_versions:
                logger.debug("Ignoring known image tag %r", version)
                continue

            logger.info("Pulling new image %s", version)
            docker_client.pull(f"{NAMESPACE}/{REPO}", tag=version)

            redis.sadd(REDIS_VERSION_KEY, version)


def sync_docker_versions_to_redis():
    """
    List locally available container images and store their tags in Redis.
    """
    redis = get_redis()
    docker_client = docker.Client()

    images = docker_client.images(name="zeek/zeek")
    tags = []
    for i in images:
        tags.extend(i["RepoTags"])

    versions = [t.replace("zeek/zeek:", "") for t in tags if "_" not in t]
    versions = [v for v in versions if is_acceptable_zeek_version(v)]

    if versions:
        redis.sadd(REDIS_VERSION_KEY, *versions)

    # Now, also fetch all versions from Redis and remove those
    # not available to Docker anymore.
    _, redis_versions = zeek_versions_from_redis()
    for rv in redis_versions:
        if rv not in versions:
            logger.info("Deleting %r from Redis", rv)
            redis.srem(REDIS_VERSION_KEY, rv)


def main():
    """
    Entry point.
    """
    parser = argparse.ArgumentParser()
    parser.add_argument("-i", "--interval", type=int, default=67 * 60)
    parser.add_argument("-l", "--log-level", type=str, default="info")
    args = parser.parse_args()

    logging.basicConfig(level=getattr(logging, args.log_level.upper()))
    while True:
        sync_docker_versions_to_redis()
        pull_new_tags()
        try:
            time.sleep(args.interval)
        except KeyboardInterrupt:
            logger.info("Interrupt")
            break


if __name__ == "__main__":
    main()
