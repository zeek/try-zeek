def reader(f, max_rows=None):
    line = ''
    headers = {}
    it = iter(f)
    while not line.startswith("#types"):
        line = next(it).rstrip()
        k,v = line[1:].split(None, 1)
        headers[k] = v

    sep = headers['separator'].encode().decode("unicode_escape")

    for k,v in headers.items():
        if sep in v or k in ('fields', 'types'):
            headers[k] = v.split(sep)

    headers['separator'] = sep
    fields = headers['fields']
    types = headers['types']
    set_sep = headers['set_separator']

    rows = []
    for row in it:
        if row.startswith("#close"):
            break
        parts = row.rstrip().split(sep)
        rows.append(parts)

    if max_rows and len(rows) > max_rows:
        mid = max_rows // 2
        rows = rows[:mid] + rows[-mid:]

    return {
        "header": fields,
        "types": types,
        "rows": rows,
    }
