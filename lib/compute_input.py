## compute_input.py

import random
import matplotlib.pyplot as plt, mpld3
import sys, json, numpy as np

#Read data from stdin
def read_in():
    lines = sys.stdin.readlines()
    #Since our input would only be having one line, parse our JSON data from that
    return json.loads(lines[0])

def main():
    #get our data as an array from read_in()
    coords = read_in()

    x = list()
    y = list()
    z = list()

    i = 0
    while i < len(coords):
        x.append(coords[i]['coords']['x'])
        y.append(coords[i]['coords']['y'])
        z.append(coords[i]['coords']['z'])
        i += 1

    mynegy = [-coord for coord in y]

    im = plt.imread("./public/assets/miramar.png")
    fig, ax = plt.subplots()
    ax.imshow(im, extent=[0, 820000, -820000, 0], alpha=1, zorder=1)
    # ax.scatter(x, mynegy, c=z, alpha=1, zorder=2)
    ax.plot(x, mynegy, c='b', alpha=1, zorder=3)
    axes = plt.gca()
    axes.set_xlim([-200000, 1000000])
    axes.set_ylim([-1000000, 200000])
    print (json.dumps(mpld3.fig_to_dict(fig)))

#start process
if __name__ == '__main__':
    main()
