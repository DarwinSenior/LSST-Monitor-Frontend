# LSST-Monitor-Frontend


This the concept proof directory for LSST Hardware Diagnostic Monitor mode. Currently the directory only contains the frontend code for the proof of concepts.

The code is for experiment, thus, could be quick and dirty.

The code is deployed on [this host site](http://lsst.cs.illinois.edu). Currently with only static files, so served on a simple HTTP server.

For the demon purpose, the following command are availabe within the command window at the left bottom corner.

1. `show_boundary`
2. `hide_boundary`
3. `create_box`
4. `delete_box`
5. `hide_box`
6. `show_box`
7. `clear_box`
7. `viewer`
8. `chart`
9. `chart2`
10. `read_mouse`
11. `blink`

And for further detail, please type `help`. 

-----

## extension

Current design is surround [firefly](https://github.com/lsst/firefly), and it plans to use [d3](http://d3js.org/), and [nvd3](http://nvd3.org/) for drawing and dom manipulation. The command tool box is based on [jquery terminal](http://terminal.jcubic.pl/). 


----

## log

+ __2015 11 06__ added the blink function and viewer has support for different images
