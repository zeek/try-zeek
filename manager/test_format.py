import unittest
from format import fmt

class TestFormat(unittest.TestCase):

    def test_cases(self):
        cases = [
            ('event zeek_init(){}', None),
            ('event zeek_init(){', {'row': 0, 'column': 18, 'type': 'error', 'text': 'missing grammar node "}" on line 0, col 18'}),
            ('function foo(){}', None),
            ('function foo({}', {'row': 0, 'column': 13, 'type': 'error', 'text': 'missing grammar node ")" on line 0, col 13'}),
        ]
        for case, expected in cases:
            with self.subTest(txt=case):
                _, error = fmt(case)
                self.assertEqual(error, expected)

if __name__ == '__main__':
    unittest.main()
