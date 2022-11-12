#!/usr/bin/env python3
# encoding=utf8  
import sys  

import os
import glob
import json
import markdown


HELP_FILE = "readme.markdown"
MULTI_VALUE_FIELDS = ['pcaps']

def main_first_sort_key(f):
    if f['name'] == 'main.zeek':
        return (0, '')
    else:
        return (1, f['name'])

def redirect_example_links(source):
    return source.replace("http://try.zeek.org/example/", "#/trybro?example=")

def clean_path(path):
    if path.startswith("./"):
        path = path[2:]
    if path == '.':
        path = ''
    return path

def fix_path(path):
    return clean_path(path).replace("/", "-")

def pack(example):
    sources = []
    for fn in os.listdir(example):
        if fn == HELP_FILE: continue
        full = os.path.join(example, fn)
        with open(full) as f:
            sources.append({
                "name": fn,
                "content": f.read(),
            })

    sources.sort(key=main_first_sort_key)

    packed_example = {
        'sources': sources,
        'path': fix_path(example),
        'parent': clean_path(os.path.dirname(example))
    }

    full_help_filename = os.path.join(example, HELP_FILE)
    if os.path.exists(full_help_filename):
        md = markdown.Markdown(extensions = ['markdown.extensions.meta', 'markdown.extensions.tables'])
        with open(full_help_filename) as f:
            source = f.read()
        source = redirect_example_links(source)
        html = md.convert(source)
        #HACK, FIXME: We are having issues with | chars inside tables
        #The python parser doesn't seem to support \|, at least not inside code blocks
        #This hack lets ``&#124;`` be rendered as a | in a code block.
        html = html.replace("&amp;#124;", "&#124;")
        packed_example['html'] = html
        for k, vs in md.Meta.items():
            if k not in MULTI_VALUE_FIELDS:
                packed_example[k] = vs[0]
            else:
                packed_example[k] = vs

    return packed_example

def read_index(fn):
    with open(fn) as f:
        return f.read().split()

def pack_recursive(e):

    directory_children = os.listdir(e)
    if 'index' in directory_children:
        index = read_index(os.path.join(e, "index"))
        children = { f: pack_recursive(os.path.join(e, f)) for f in index }
        example = { "path": fix_path(e), "index": index, "children": children, "child_count": len(children)}
    else:
        example = pack(e)

    return example

    add_next(examples)

def flatten(examples, flat=None):
    if flat is None:
        flat = []
    if 'index' in examples:
        for i in examples['index']:
            flatten(examples['children'][i], flat)
    else:
        flat.append(examples)

    return flat

def add_next_and_prev(flattened):
    prev = None
    for f in flattened:
        f['prev'] = prev
        prev = {'path': f['path'], 'title': f['title']}

    next = None
    for f in reversed(flattened):
        f['next'] = next
        next = {'path': f['path'], 'title': f['title']}


def main():
    examples = pack_recursive(".")
    flat = flatten(examples)

    add_next_and_prev(flat)

    with open("examples.json", 'w') as f:
        json.dump(flat, f)

if __name__ == "__main__":
    main()
