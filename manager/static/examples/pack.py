#!/usr/bin/env python
import os
import glob
import json

def main_first_sort_key(f):
    if f['name'] == 'main.bro':
        return (0, '')
    else:
        return (1, f['name'])

def pack(example):
    sources = []
    for fn in os.listdir(example):
        full = os.path.join(example, fn)
        with open(full) as f:
            sources.append({
                "name": fn,
                "content": f.read(),
            })

    sources.sort(key=main_first_sort_key)
    return sources

def main():
    examples = []
    for x in glob.glob("*/main.bro"):
        example = os.path.dirname(x)
        jsfile = example + ".json"
        examples.append(example)
        with open(jsfile, 'w') as f:
            json.dump(pack(example), f)

    with open("examples.json", 'w') as f:
        json.dump(examples, f)

if __name__ == "__main__":
    main()
