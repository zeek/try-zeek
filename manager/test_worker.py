import os
import tempfile
import unittest
from unittest import mock

import worker

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


if __name__ == '__main__':
    unittest.main()
