$(function() {
	var w = 940,
		h = 600,
		baseX = w/2,
		baseY = h/2,
		jointW = 80,
		jointH = 10;
	
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
			
			j.click(handleClick);
			
			joints.push(j);
		}
		
		updatePoses();
	}
	initJoints(5);
	
	function updatePoses() {
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
	
	function handleClick(e) {
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
		
		
		if(selected === index) {
			// already selected, deselect
			
			selected = null;
			
			joints[selected].attr("fill", "#fff");
		} else {
			// make selected
			
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
	
				updatePoses();
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
});