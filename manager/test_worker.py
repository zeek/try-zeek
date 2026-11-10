import os
import tempfile
import unittest
from unittest import mock

import worker
import common

HERE = os.path.dirname(os.path.abspath(__file__))


class WorkerTestCase(unittest.TestCase):
    """
    Runs worker._run_code_docker with Docker and Redis mocked out. The work
    directory sits inside a scratch parent directory, so tests can check that
    nothing is written outside of it.
    """

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.parent = self.tmp.name
        self.work_dir = os.path.join(self.parent, "work")
        os.mkdir(self.work_dir)

        # _run_code_docker copies ./runbro, relative to the manager directory.
        cwd = os.getcwd()
        os.chdir(HERE)
        self.addCleanup(os.chdir, cwd)

        patcher = mock.patch.object(worker, "zeek_versions_from_redis",
                                    return_value=("7.0.0", ["7.0.0"]))
        patcher.start()
        self.addCleanup(patcher.stop)

        patcher = mock.patch.object(worker.docker, "from_env")
        self.docker = patcher.start().return_value
        self.addCleanup(patcher.stop)

    def tearDown(self):
        self.tmp.cleanup()

    def run_code(self, sources, pcap=None):
        return worker._run_code_docker(sources, pcap=pcap, version="7.0.0",
                                       work_dir=self.work_dir)

    def parent_entries(self):
        return sorted(os.listdir(self.parent))


class TestSourceNames(WorkerTestCase):

    def test_plain_names_are_written_to_the_work_dir(self):
        self.run_code([{"name": "main.zeek", "content": "event zeek_init() {}"},
                       {"name": "factorial.zeek", "content": "# f"}])
        with open(os.path.join(self.work_dir, "main.zeek")) as f:
            self.assertEqual(f.read(), "event zeek_init() {}\n")
        self.assertTrue(os.path.exists(os.path.join(self.work_dir, "factorial.zeek")))
        self.docker.api.start.assert_called_once()

    def test_unsafe_names_are_rejected_before_anything_is_written(self):
        outside = os.path.join(self.parent, "outside.zeek")
        for name in ["../outside.zeek", outside, "sub/dir.zeek", "..", ""]:
            with self.subTest(name=name):
                sources = [{"name": "main.zeek", "content": "# ok"},
                           {"name": name, "content": "# evil"}]
                with self.assertRaises(ValueError):
                    self.run_code(sources)
                self.assertEqual(self.parent_entries(), ["work"])
                self.assertEqual(os.listdir(self.work_dir), [])
                self.docker.api.create_container.assert_not_called()


class TestPcaps(WorkerTestCase):

    SOURCES = [{"name": "main.zeek", "content": "# ok"}]
    CHECKSUM = "d41d8cd98f00b204e9800998ecf8427e"

    def setUp(self):
        super().setUp()
        pcap_dir = os.path.join(self.parent, "pcaps")
        os.mkdir(pcap_dir)
        with open(os.path.join(pcap_dir, "http.pcap"), "wb") as f:
            f.write(b"bundled pcap")
        with open(os.path.join(self.parent, "secret"), "wb") as f:
            f.write(b"secret")
        patcher = mock.patch.object(worker, "PCAP_DIR", pcap_dir)
        patcher.start()
        self.addCleanup(patcher.stop)

    def pcap_contents(self):
        with open(os.path.join(self.work_dir, "file.pcap"), "rb") as f:
            return f.read()

    def test_the_real_pcap_dir_has_the_bundled_pcaps(self):
        self.assertTrue(os.path.isfile(os.path.join(common.PCAP_DIR, "http.pcap")))

    def test_bundled_pcap_is_copied(self):
        self.run_code(self.SOURCES, pcap="http.pcap")
        self.assertEqual(self.pcap_contents(), b"bundled pcap")

    def test_uploaded_pcap_is_read_from_redis(self):
        with mock.patch.object(worker, "get_pcap_with_retry", return_value=b"uploaded") as get:
            self.run_code(self.SOURCES, pcap=self.CHECKSUM)
        get.assert_called_once_with(self.CHECKSUM)
        self.assertEqual(self.pcap_contents(), b"uploaded")

    def test_unsafe_pcaps_are_rejected(self):
        for pcap in ["../secret", os.path.join(self.parent, "secret"),
                     "missing.pcap", "deadbeef", "--foo"]:
            with self.subTest(pcap=pcap):
                with self.assertRaises(ValueError):
                    self.run_code(self.SOURCES, pcap=pcap)
                self.assertEqual(os.listdir(self.work_dir), [])
                self.docker.api.create_container.assert_not_called()


class TestOutputLogs(WorkerTestCase):

    SOURCES = [{"name": "main.zeek", "content": "# ok"}]

    def run_with_output(self, make_output):
        """Run a job whose container leaves behind what make_output creates."""
        self.docker.api.start.side_effect = lambda container: make_output(self.work_dir)
        return self.run_code(self.SOURCES)

    def test_logs_are_returned(self):
        def make_output(d):
            for name, txt in [("conn.log", "conn"), ("stdout.log", ""),
                              ("empty.log", " \n"), ("notes.txt", "not a log")]:
                with open(os.path.join(d, name), "w") as f:
                    f.write(txt)
        files = self.run_with_output(make_output)
        self.assertEqual(files, {"conn.log": "conn", "stdout.log": ""})

    def test_symlinked_logs_are_not_followed(self):
        secret = os.path.join(self.parent, "secret")
        with open(secret, "w") as f:
            f.write("secret")

        def make_output(d):
            with open(os.path.join(d, "conn.log"), "w") as f:
                f.write("conn")
            os.symlink(secret, os.path.join(d, "leak.log"))
            os.symlink("../secret", os.path.join(d, "stdout.log"))
        files = self.run_with_output(make_output)
        self.assertEqual(files, {"conn.log": "conn"})

    def test_non_regular_logs_are_skipped(self):
        def make_output(d):
            os.mkfifo(os.path.join(d, "fifo.log"))
            os.mkdir(os.path.join(d, "dir.log"))
        self.assertEqual(self.run_with_output(make_output), {})


if __name__ == '__main__':
    unittest.main()
