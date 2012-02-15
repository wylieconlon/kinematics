$(function() {
	var w = 940,
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
			
			j.attr({ fill: "#fff" });

			j.data("index", i);
			j.data("rotation", 0);
			
			j.click(handleJointClick);
			j.drag(handleDrag);
			
			joints.push(j);
		}
		
		updatePosesForward();
	}
	initJoints(5);
	
	/* Forward kinematics
	=========================================================================*/
	
	function updatePosesForward() {
		var totalRotation = 0;
		
		for(var i=1; i<joints.length; i++) {
			var joint = joints[i];
			
			var prevX = joints[i-1].attr("x");
			var prevY = joints[i-1].attr("y");
			var prevR = joints[i-1].data("rotation");
			
			var currentR = joints[i].data("rotation");
			
			totalRotation += parseFloat(prevR) * Math.PI/180;
			
			prevX += (jointW) * Math.cos(totalRotation);
			prevY += (jointW) * Math.sin(totalRotation);
			
			joint.attr("x", prevX);
			joint.attr("y", prevY);
			
			var jointRotation = totalRotation * 180/Math.PI + currentR;
			
			joint.transform("");
			
			joint.rotate(jointRotation, prevX, prevY + 5);
		}
	}
	
	function handleJointClick(e) {
		var index    = this.data("index");
		var rotation = this.data("rotation");
		
		function selectOnly(index) {
			for(var i=0; i<joints.length; i++) {
				if(i === index) {
					joints[i].attr("fill", "#000");
				} else {
					joints[i].attr("fill", "#fff");
				}
			}
		}
		
		
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
                offsetLeft += node.offsetLeft;
            }
        }
        if(offsetTop == undefined) {
            offsetTop = 0;
            for(var node=$("#main svg")[0]; node; node = node.offsetParent) {
                offsetTop += node.offsetTop;
            }
        }
        
        var x = e.pageX - offsetLeft;
        var y = e.pageY - offsetTop;
    
        return { x: x, y: y };
    }
    
    function makeJacobian() {
    	var jacobian_array = [];
		
    	for(var i=0; i<joints.length; i++) {
    		var el = joints[i];
    		
    		var x = el.attr("x");
    		var y = el.attr("y");
    		var r = el.data("rotation") * Math.PI/180;
    		
			var v_sub_j = $V([x, y, 1]).toUnitVector();
			
			var s_sub_i = $V([jointW * Math.cos(r),
							  jointW * Math.sin(r),
							  0]);
			
			/*var s_sub_i = $V([x + jointW * Math.cos(r),
							  y + jointW * Math.sin(r),
							  1]);
			*/
			
			//var p_sub_j = $V([el.attr("x"), el.attr("y")]);
			
			//console.log(v_sub_j.inspect(), s_sub_i.inspect());
			
			var entry = v_sub_j.cross(s_sub_i);
			
			jacobian_array.push([entry.e(1), entry.e(2)]);
		}
		
		return $M(jacobian_array);
    }
    
    function makeErrorVector(tx, ty) {
    	var error_array = [];
		
		for(var i=0; i<joints.length; i++) {
			error_array.push([0, 0]);
		}
    	    		
		var el = joints[joints.length-1];
		
		var x = el.attr("x");
		var y = el.attr("y");
		var r = el.data("rotation") * Math.PI/180;
		
		error_array[joints.length-1] = [tx-x, ty-y];
		
		console.log(error_array);
		
		return $M(error_array);
	}
    
    function handleDrag(dx, dy, x, y, e) {
		var index    = this.data("index");
		var rotation = this.data("rotation");
		var rads = rotation * Math.PI/180;
		
		var c = getCursorPosition(e);
		
		//paper.circle(c.x, c.y, 10);
		
		//console.log("Joint "+index, e, getCursorPosition(e));
		
		var endX = this.attr("x") + jointW * Math.cos(rads);
		var endY = this.attr("y") + jointW * Math.sin(rads) + jointH/2;

		//paper.rect(endX, endY, 5, 5);
		
		var jacobian = makeJacobian();
		var errors = makeErrorVector(c.x, c.y);
		
		console.log(jacobian.inspect());
		console.log(errors.inspect());
		
		//var alpha = errors.dot(jacobian.x(jacobian.transpose().multiply(errors.transpose())));
		
		var dtheta = jacobian.transpose().x(errors);
		
		console.log(dtheta.inspect());
	}
});