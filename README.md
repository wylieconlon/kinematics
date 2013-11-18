About
-----

An exercise in implementing a forward and inverse kinematics simulation in Javascript. Uses the [Raphael](http://raphaeljs.com/) SVG framework and [Sylvester](http://sylvester.jcoglan.com/) Matrix library.

Usage
-----

This script can be demoed at [kinematics.wylie.su](http://kinematics.wylie.su). Alternatively, to run it locally, you may use Python's built in `SimpleHTTPServer` module like so:

`python -m SimpleHTTPServer 8000`

and visit [localhost:8000](http://localhost:8000)

### Forward kinematics:

Click on a joint, then use the left and right arrow keys to rotate.

Up and down arrow keys add/subtract joints.

### Inverse kinematics:

Click and drag anywhere on the board to orient the joints. Implemented using clamped Jacobian transpose method.

License
-------

All code is MIT licensed unless otherwise noted.
