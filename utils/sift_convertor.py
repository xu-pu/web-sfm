#!/bin/env python

import os
import json
import subprocess

from os.path import join

SIFT_PATH = '/usr/local/bin/sift'
IMAGE_DIR = os.getcwd()
ROOT_DIR = os.path.dirname(IMAGE_DIR)
KEY_DIR = join(ROOT_DIR, 'sift')
JSON_DIR = join(ROOT_DIR, 'sift.json')


def sift_convertor(name):
    result = {}
    with open(join(KEY_DIR, name+'.key'), 'r') as f:
        result['amount'], result['width'] = [int(num) for num in f.readline().split()]
        result['features'] = []
        for i in range(result['amount']):
            row, col, scale, direction = [float(num) for num in f.readline().split()]
            feature = []
            for line in range(7):
                feature.extend([int(num) for num in f.readline().split()])
            result['features'].append({
                'row': row,
                'col': col,
                'scale': scale,
                'direction': direction,
                'vector': feature
            })
    return result


def generate_all():
    if not os.path.exists(KEY_DIR):
        os.mkdir(KEY_DIR)
    if not os.path.exists(JSON_DIR):
        os.mkdir(JSON_DIR)
    for root, dirs, files in os.walk(IMAGE_DIR):
        for file in files:
            name = file.split('.')[-2]
            subprocess.call(['mogrify', '-format', 'pgm', file])
            subprocess.call(SIFT_PATH + ' <'+join(IMAGE_DIR, name+'.pgm') + ' >'+join(KEY_DIR, name+'.key'), shell=True)
            sift = sift_convertor(name)
            with open(join(JSON_DIR, name+'.json'), 'a') as f:
                f.write(json.dumps(sift))


def convert_all():
    if not os.path.exists(KEY_DIR):
        os.mkdir(KEY_DIR)
    if not os.path.exists(JSON_DIR):
        os.mkdir(JSON_DIR)
    for root, dirs, files in os.walk(IMAGE_DIR):
        for file in files:
            name = file.split('.')[-2]
            sift = sift_convertor(name)
            with open(join(JSON_DIR, name+'.json'), 'a') as f:
                f.write(json.dumps(sift))

def test_all():
    for root, dirs, files in os.walk(JSON_DIR):
        for fi in files:
            with open(join(JSON_DIR, fi), 'r') as f:
                json.loads(f.read())
    

if __name__ == '__main__':
    test_all()
#    convert_all()
#    generate_all()
