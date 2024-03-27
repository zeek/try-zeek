import io
import re

import zeekscript


ERROR_REGEX = r'line (\d+), col (\d+)'

def parse_error(error):
    # This is a tuple of... (string, some number, actual error)
    txt = error[2]
    # 'cannot parse line 0, col 0: "function() {"'

    match = re.search(ERROR_REGEX, txt)
    if not match:
        return None

    line = int(match.group(1))
    col = int(match.group(2))

    return {
        'row': line,
        'column': col,
        'type': "error",
        'text': txt,
    }

def fmt(txt):
    s = zeekscript.Script(io.StringIO(txt))
    s.parse()
    if s.has_error():
        return txt, parse_error(s.get_error())
    buf = io.BytesIO()
    s.format(buf)
    return buf.getvalue().decode(), None
