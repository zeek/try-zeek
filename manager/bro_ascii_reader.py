def reader(f):
    line = ''
    headers = {}
    it = iter(f)
    while not line.startswith("#types"):
        line = next(it).rstrip()
        k,v = line[1:].split(None, 1)
        headers[k] = v

    sep = headers['separator'].decode("string-escape")

    for k,v in headers.items():
        if sep in v:
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

    return {
        "header": fields,
        "types": types,
        "rows": rows,
    }
