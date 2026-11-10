import json
import unittest
from unittest import mock

import app


class TestRun(unittest.TestCase):

    MAIN = {"name": "main.zeek", "content": "event zeek_init() {}"}

    def setUp(self):
        self.client = app.app.test_client()
        patcher = mock.patch.object(app.backend, "run_code", return_value=("abc123", "out"))
        self.run_code = patcher.start()
        self.addCleanup(patcher.stop)

    def post(self, body):
        return self.client.post("/run", data=json.dumps(body),
                                content_type="application/json")

    def test_valid_requests_are_run(self):
        cases = [
            ({"sources": [self.MAIN], "version": "7.0.0"}, ""),
            ({"sources": [self.MAIN, {"name": "factorial.zeek", "content": ""}],
              "pcap": "http.pcap"}, "http.pcap"),
            ({"sources": [self.MAIN], "pcap": "d41d8cd98f00b204e9800998ecf8427e"},
             "d41d8cd98f00b204e9800998ecf8427e"),
            ({"sources": [self.MAIN], "pcap": None}, None),
        ]
        for body, pcap in cases:
            with self.subTest(body=body):
                self.run_code.reset_mock()
                response = self.post(body)
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.get_json(), {"job": "abc123", "stdout": "out"})
                self.run_code.assert_called_once_with(body["sources"], pcap=pcap,
                                                      version=body.get("version", ""))

    def test_invalid_requests_are_rejected_before_running(self):
        cases = [
            {"sources": [{"name": "../escape.zeek", "content": ""}]},
            {"sources": [self.MAIN, {"name": "/etc/cron.d/x", "content": ""}]},
            {"sources": [{"name": "sub/dir.zeek", "content": ""}]},
            {"sources": [{"name": "main.zeek"}]},
            {"sources": [{"content": ""}]},
            {"sources": ["main.zeek"]},
            {"sources": []},
            {"sources": "main.zeek"},
            {},
            [self.MAIN],
            {"sources": [self.MAIN], "pcap": "../../../etc/shadow"},
            {"sources": [self.MAIN], "pcap": "/etc/shadow"},
            {"sources": [self.MAIN], "pcap": "missing.pcap"},
            {"sources": [self.MAIN], "pcap": "--foo"},
        ]
        for body in cases:
            with self.subTest(body=body):
                response = self.post(body)
                self.assertEqual(response.status_code, 400)
                self.assertIn("error", response.get_json())
                self.assertEqual(response.headers["Access-Control-Allow-Origin"], "*")
        self.run_code.assert_not_called()

    def test_non_json_bodies_are_rejected(self):
        for kwargs in [{"data": "not json", "content_type": "application/json"},
                       {"data": {"sources": "x"}}]:
            with self.subTest(kwargs=kwargs):
                self.assertEqual(self.client.post("/run", **kwargs).status_code, 400)
        self.run_code.assert_not_called()


if __name__ == '__main__':
    unittest.main()
