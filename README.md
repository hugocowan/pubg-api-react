# A MERN Stack application using Python to calculate graphical data.

### This is a statistics website for showing per-user gameplay history for the game Player Unknown's Battlegrounds (PUBG).

The app shows every match from your current season. Details on the matches include who your team-mates were; how long you were in-game; where you placed in the match; how many you killed and who killed you; and finally, a graphical representation of your journey through the map.

Aside from battling through three different API calls, with a 10 requests/minute cap on the first, my favourite part of this project is the node/python integration.

Using a child process, node spawns a python instance, passed coordinate data to it, and then receives graph information in object-form, ready to be processed in the frontend. This not only parallelises the graph calculation thanks to the child process, but also combines the complex data-management Python allows with the flexibility of JavaScript. A great combination that I am very happy to have learnt to use.
