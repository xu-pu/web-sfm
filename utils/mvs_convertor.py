#!/bin/env python

import json
import sys
import os


def convert(source, target):
    with open(source, 'r') as f:
        result = [[float(num) for num in line.split()[0:3]] for line in f.readlines()]
    with open(target, 'a') as f:
        f.write(json.dumps(result))

if __name__ == '__main__':
    pmvs_path = sys.argv[1]
    pmvs_name = os.path.basename(pmvs_path)
    source = os.path.abspath(pmvs_path)
    target = os.path.join(os.path.dirname(source), pmvs_name+'.json')
    convert(source, target)