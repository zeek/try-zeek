import io
import zeekscript

def fmt(txt):
    s = zeekscript.Script(io.StringIO(txt))
    s.parse()
    if s.has_error():
        print("Error!")
        return txt
    buf = io.BytesIO()
    s.format(buf)
    return buf.getvalue().decode()
