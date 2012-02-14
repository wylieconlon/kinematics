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
	}
	initJoints(3);
	
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
	updatePoses();
	
	function handleClick(e) {
		var index    = this.data("index");
		var rotation = this.data("rotation");
		
		if(selected === index) {
			// already selected, deselect
			
			selected = null;

			this.attr({ fill: "#000" });
		} else {
			// make selected
			
			selected = index;

			this.attr({ fill: "#000" });
		}
	}
	
	$(document).keydown(function(e) {
		if(typeof selected !== "undefined") {
			var r;
			if(e.which === 37) {
				r = -5;
			} else if (e.which === 39) {
				r = 5;
			} else {
				return;
			}
			
			var el = joints[selected];
			var rotation = parseFloat(el.data("rotation"));

			var x = el.attr("x");
			var y = el.attr("y");

			el.rotate(r, x, y + jointH/2);
			el.data("rotation", rotation + r);

			updatePoses();
		}
	});
});