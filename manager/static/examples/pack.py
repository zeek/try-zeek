#!/usr/bin/env python
# encoding=utf8  
import sys  

reload(sys)  
sys.setdefaultencoding('utf8')

import os
import glob
import json
import markdown


HELP_FILE = "readme.markdown"
MULTI_VALUE_FIELDS = ['pcaps']

def main_first_sort_key(f):
    if f['name'] == 'main.bro':
        return (0, '')
    else:
        return (1, f['name'])

def redirect_example_links(source):
    return source.replace("http://try.bro.org/example/", "#/trybro?example=")

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
        'path': example,
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

def name_to_title(name):
    """>>> name_to_title("foo-bar")
        Foo Bar
    """
    return name.replace("-", " ").title()

def pack_recursive(e):

    directory_children = os.listdir(e)
    print "example:", e, "children:", directory_children
    if 'index' in directory_children:
        index = read_index(os.path.join(e, "index"))
        children = { f: pack_recursive(os.path.join(e, f)) for f in index }
    else:
        index = ["0"]
        children = { "0": pack(e) }

    example = { "path": e, "name": name_to_title(e), "index": index, "children": children, "child_count": len(children)}
    return example

def main():
    examples = pack_recursive(".")

    with open("examples.json", 'w') as f:
        json.dump(examples, f)

if __name__ == "__main__":
    main()
