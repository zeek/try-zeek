import os
import tempfile
import unittest

from common import is_plain_filename, is_pcap_checksum, is_valid_pcap


class TestIsPlainFilename(unittest.TestCase):

    def test_plain_names(self):
        for name in ["main.zeek", "factorial.zeek", "intel-1.dat", "new-1.zeek",
                     "with space.zeek", "..hidden", "a..b"]:
            with self.subTest(name=name):
                self.assertTrue(is_plain_filename(name))

    def test_rejected_names(self):
        for name in ["", ".", "..", "../escape.zeek", "/etc/cron.d/x",
                     "sub/dir.zeek", "..\\escape.zeek", "nul\0.zeek",
                     None, 1, ["main.zeek"]]:
            with self.subTest(name=name):
                self.assertFalse(is_plain_filename(name))


class TestIsPcapChecksum(unittest.TestCase):

    def test_checksums(self):
        self.assertTrue(is_pcap_checksum("d41d8cd98f00b204e9800998ecf8427e"))
        for pcap in ["D41D8CD98F00B204E9800998ECF8427E", "deadbeef",
                     "d41d8cd98f00b204e9800998ecf8427e0", "../d41d8cd98f00b204e9800998ecf8427e",
                     "http.pcap", None]:
            with self.subTest(pcap=pcap):
                self.assertFalse(is_pcap_checksum(pcap))


class TestIsValidPcap(unittest.TestCase):

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.pcap_dir = os.path.join(self.tmp.name, "pcaps")
        os.mkdir(self.pcap_dir)
        open(os.path.join(self.pcap_dir, "http.pcap"), "wb").close()
        open(os.path.join(self.tmp.name, "secret"), "wb").close()

    def tearDown(self):
        self.tmp.cleanup()

    def test_valid(self):
        for pcap in [None, "", "http.pcap", "d41d8cd98f00b204e9800998ecf8427e"]:
            with self.subTest(pcap=pcap):
                self.assertTrue(is_valid_pcap(pcap, self.pcap_dir))

    def test_invalid(self):
        for pcap in ["missing.pcap", "../secret", "../../../etc/shadow",
                     "/etc/shadow", "--foo", 5]:
            with self.subTest(pcap=pcap):
                self.assertFalse(is_valid_pcap(pcap, self.pcap_dir))


if __name__ == '__main__':
    unittest.main()
