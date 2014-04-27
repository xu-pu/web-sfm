__author__ = 'sheep'

import sys


def bundler_convertor():
    num_cameras, num_points = [int(num) for num in sys.stdin.readline().split()]
    for i in range(num_cameras):
        pass
    for i in range(num_points):
        pass

def mvs_convertor():
    pass


def sift_convertor():
    pass

if __name__ == '__main__':
    if sys.argv[0] == 'sift':
        sift_convertor()
    elif sys.argv[0] == 'mvs':
        mvs_convertor()
    elif sys.argv[0] == 'bundler':
        bundler_convertor()