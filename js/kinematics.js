$(function() {
	var w = 600,
		h = 600,
		baseX = w/2,
		baseY = h/2,
		jointW = 80,
		jointH = 10,
		offsetLeft,
		offsetTop;
	
	var paper = Raphael("main", w, h);
	
	var joints = [];
	var selected = null;
	
	var mousedown = false;
	
	function initJoints(n) {
		if(joints.length > 0) {
			for(var i=0; i<joints.length; i++) {
				joints[i].remove();
			}
			joints=[];
			selected = null;
		}
		
		if(n > 3) {
			jointW = Math.floor((baseY-10) / n);
		}
		
		for(var i=0; i<n; i++) {
			var j = paper.rect(
				baseX,
				baseY - jointH/2,
				jointW,
				jointH,
				jointH/2
			);
			
			j.attr({
				fill: "#9cf",
				stroke: "#38f",
				cursor: "pointer"
			});

			j.data("index", i);
			j.data("rotation", 0);
			
			j.click(handleJointClick);
			
			joints.push(j);
		}
		
		updatePosesForward();
	}
	initJoints(5);
	
	/* Forward kinematics
	=========================================================================*/
	
	function updatePosesForward() {
		var totalRotation = 0;
		
		for(var i=0; i<joints.length; i++) {
			var joint = joints[i];
			
			if(i>0) {
				var prevX = joints[i-1].attr("x"),
					prevY = joints[i-1].attr("y");
			} else {
				var prevX = baseX - jointW,
					prevY = baseY;
			}
			
			prevX += jointW * Math.cos(totalRotation);
			prevY += jointW * Math.sin(totalRotation);
			
			joint.transform("");
			joint.attr({
				x: prevX,
				y: prevY
			});

			totalRotation += joints[i].data("rotation") * Math.PI/180;
			
			joint.rotate(totalRotation * 180/Math.PI, prevX, prevY + jointH/2);
		}
	}

	function selectOnly(index) {
		for(var i=0; i<joints.length; i++) {
			if(i === index) {
				joints[i].attr("fill", "#38f");
			} else {
				joints[i].attr("fill", "#9cf");
			}
		}
	}
	
	function handleJointClick(e) {
		var index	= this.data("index");
		var rotation = this.data("rotation");
		
		if(selected !== index) {
			// make new selection
			
			selected = index;			
			selectOnly(index);
		}
	}
	
	$(document).keydown(function(e) {
		if(e.which === 37 || e.which === 39) {
			if(typeof selected !== "undefined") {
				var r;
				if(e.which === 37) {
					// LEFT ARROW
					r = -5;
				} else if (e.which === 39) {
					// RIGHT ARROW
					r = 5;
				}
				
				var el = joints[selected];
				var rotation = parseFloat(el.data("rotation"));
	
				var x = el.attr("x");
				var y = el.attr("y");
	
				el.rotate(r, x, y + jointH/2);
				el.data("rotation", rotation + r);
	
				updatePosesForward();
			}
		} else if(e.which === 38 || e.which === 40) {
			if(e.which === 38) {
				// UP ARROW
				
				if(joints.length < 10) {
					initJoints(joints.length+1);
				}
			} else if(e.which === 40) {
				// DOWN ARROW

				if(joints.length > 1) {
					initJoints(joints.length-1);
				}
			}
		}
	});

	/* Inverse kinematics
	=========================================================================*/
	
	var getCursorPosition = function(e) {
		if(offsetLeft == undefined) {
			offsetLeft = 0;
			for(var node=$("#main svg")[0]; node; node = node.offsetParent) {
				offsetLeft += $(node).offset().left;
			}
		}
		if(offsetTop == undefined) {
			offsetTop = 0;
			for(var node=$("#main svg")[0]; node; node = node.offsetParent) {
				offsetTop += $(node).offset().top;
			}
		}
		
		var x = e.pageX - offsetLeft;
		var y = e.pageY - offsetTop;
	
		return { x: x, y: y };
	}
	
	function makeJacobian(tx/*, ty*/) {
		var dx = [],
			dy = [],
			jacobian = [];
		
		// get position info about end effector (last joint)
		var totalR = 0;
		for(var i=0; i<joints.length; i++) {
			totalR += joints[i].data("rotation") * Math.PI/180;
		}
		var endEl = joints[joints.length-1];
			endX  = endEl.attr("x") + jointW * Math.cos(totalR),
			endY  = endEl.attr("y") + jointW * Math.sin(totalR) + jointH/2;
		
		for(var i=0; i<joints.length; i++) {
			var el  = joints[i],
				elX = el.attr("x"),
				elY = el.attr("y"),
				r   = el.data("rotation") * Math.PI/180;
			
			var rotationAxis  = $V([0, 0, 1]),
				jointPosition = $V([endX - elX,
							 		endY - elY,
							  		0]);
			
			var entry = rotationAxis.cross(jointPosition);
			
			dx[i] = entry.e(1);
			dy[i] = entry.e(2);
		}
		
		jacobian.push(dx);
		jacobian.push(dy);
		
		return $M(jacobian);
	}
	
	// binding toggle functions to document gives smoother results
	$(document).mousedown(function() {
		mousedown = true;
	});
	$(document).mouseup(function() {
		mousedown = false;
	});
	$("#main").mousedown(updatePosesInverse);
	$("#main").mousemove(function(evt) {
		if(mousedown) {
			// user is dragging mouse through stage
			updatePosesInverse(evt);
		}
	});
	
	function updatePosesInverse(evt) {
		var c = getCursorPosition(evt),
			x = c.x,
			y = c.y;
		
		// get position info about end effector (last joint)
		var totalR = 0;
		for(var i=0; i<joints.length; i++) {
			totalR += joints[i].data("rotation") * Math.PI/180;
		}
		
		var el   = joints[joints.length-1];
			endX = el.attr("x") + jointW * Math.cos(totalR),
			endY = el.attr("y") + jointW * Math.sin(totalR) + jointH/2;
		
		// calculate jacobian and error vector
		var jacobian = makeJacobian(x, y),
			e        = $V([endX - x, endY - y]);
		
		// clamping function on error vector
		if(Math.sqrt(Math.pow(endX - x, 2) +
					 Math.pow(endY - y, 2)) > jointW/2) {
			e = e.toUnitVector().x(jointW/2);
		}
		
		// use jacobian and error vector to calculate change in angles
		var jje   = jacobian.x(jacobian.transpose().x(e)),
			alpha = e.dot(jje) / jje.dot(jje),
			d     = jacobian.transpose().x(e).x(alpha);
		
		for(var i=0; i<joints.length; i++) {
			var r = joints[i].data("rotation");
			
			joints[i].data("rotation", r - (d.e(i+1) * 180/Math.PI));
		}
		
		selectOnly();
		updatePosesForward();
	}
});