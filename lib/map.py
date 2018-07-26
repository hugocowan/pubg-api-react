import random
import numpy as np
import matplotlib.pyplot as plt


def main():

    coords =

    x = list()
    y = list()
    z = list()

    i = 0
    while i < len(coords):
        x.append(coords[i]['coords']['x'])
        y.append(coords[i]['coords']['y'])
        z.append(coords[i]['coords']['z'])
        i += 1

    mynegy = [-x for x in y]

    print(x)
    print(y)
    print(mynegy)
    print(z)

    im = plt.imread("miramar.png")
    fig, ax = plt.subplots()
    ax.imshow(im, extent=[0, 820000, -820000, 0], alpha=1, zorder=1)
    ax.scatter(x, mynegy, c=z, alpha=1, zorder=2)
    ax.plot(x, mynegy, c='b', alpha=1, zorder=3)
    axes = plt.gca()
    axes.set_xlim([-200000, 1000000])
    axes.set_ylim([-1000000, 200000])
    plt.show()


if __name__ == '__main__':
    main()
