#!/bin/env python
import os

import sys
import json


def read_camera(f):
    focal, k1, k2 = [float(num) for num in f.readline().split()]
    rotation = [[float(num) for num in f.readline().split()] for line in range(3)]
    t = [float(num) for num in f.readline().split()]
    return {
        'focal': focal,
        'k1': k1,
        'k2': k2,
        'R': rotation,
        't': t
    }


def read_point(f):
    point = [float(num) for num in f.readline().split()]
    r, g, b = [int(num) for num in f.readline().split()]
    view_list = []
    line = f.readline().split()
    count = int(line[0])
    for view in range(count):
        offset = 1+4*view
        view_list.append({
            'view': int(line[offset]),
            'feature': int(line[offset+1]),
            'x': float(line[offset+2]),
            'y': float(line[offset+3]),
        })
    return {
        'point': point,
        'color': {'R': r, 'G': g, 'B': b},
        'views': view_list
    }


def read_bundler(f):
    cams, points = [int(num) for num in f.readline().split()]
    result = {}
    result['cameras'] = [read_camera(f) for cam in range(cams)]
    result['points'] = [read_point(f) for point in range(points)]
    return result


if __name__ == '__main__':
    with open(sys.argv[1], 'r') as fin:
        with open(os.path.join(os.getcwd(), 'bundler.json'), 'a') as fout:
            fin.readline()
            fout.write(json.dumps(read_bundler(fin)))