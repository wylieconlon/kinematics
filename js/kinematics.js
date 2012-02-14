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
	
	var temp = paper.rect(50, 50, 100, 10);

	var temp2 = paper.rect(50, 50, 100, 10);
	temp2.rotate(-5);
	temp2.attr("x", 100);

	var temp2 = paper.rect(50, 50, 100, 10);
	temp2.rotate(-30, 100, 55);
	temp2.translate(50, 0);
	
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
		
// 		if(joints.length > 0) {
// 			totalRotation = parseFloat(joints[0].data("rotation")) * Math.PI/180;
// 		}
		
		for(var i=1; i<joints.length; i++) {
			var joint = joints[i];
			
			var prevX = joints[i-1].attr("x");
			var prevY = joints[i-1].attr("y");
			console.log("prevY", prevY);
			var prevR = joints[i-1].data("rotation");
			
			var currentR = joints[i].data("rotation");
			
			//console.log("joint "+i, currentR);
			totalRotation += (parseFloat(prevR)) * Math.PI/180;
			
			prevX += jointW * Math.cos(totalRotation);
			prevY += jointW * Math.sin(totalRotation);
// 			prevX += jointW * Math.cos(prevR * Math.PI/180);
// 			prevY += jointW * Math.sin(prevR * Math.PI/180);
			
			console.log(prevX-baseX, prevY-baseY);
			
			joint.rotate(- parseFloat(currentR) * Math.PI/180);
			
			joint.attr("x", prevX);
			joint.attr("y", prevY);

			joint.rotate(parseFloat(currentR) * Math.PI/180);
		}
		
		console.log(totalRotation * 180/Math.PI);
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
	
	function rotateAllFromIndex(index, amount) {
		for(index; index<joints.length; index++) {
			var el = joints[index];
			var rotation = parseFloat(el.data("rotation"));
			
			var x = el.attr("x");
			var y = el.attr("y");
			
			el.rotate(amount/*, x, y + jointH/2*/);
			//el.data("rotation", rotation + amount);
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
			
			rotateAllFromIndex(selected, r);
			
			
			var el = joints[selected];
			var rotation = parseInt(el.data("rotation"));

			var x = el.attr("x");
			var y = el.attr("y");

			//el.rotate(r, x, y + jointH/2);
			el.data("rotation", rotation + r);
// 			
// 			
// 			
// 			if(e.which === 37) {
// 				el.rotate(-5, x, y + jointH/2);
// 				el.data("rotation", rotation-5);
// 			} else if(e.which === 39) {
// 				el.rotate(5, x, y + jointH/2);
// 				el.data("rotation", rotation+5);
// 			}
			
			updatePoses();
		}
	});
});