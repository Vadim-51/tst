/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function variableCustomRoom() {

	this.degree90 = false; // angle line = 90 degree
	this.degree180 = false; // angle line = 0 or 180 degree
	this.intersectedX = false;
	this.intersectedY = false;
	this.particlePosition; // get point coordinate if intersected
	this.templatePoints = []; // array with points

}
var CustomRoomVariable = new variableCustomRoom();

var resetCustomRoomVariable = function () {

	CustomRoomVariable.templatePoints = [];
	CustomRoomVariable.intersectedX = false;
	CustomRoomVariable.intersectedY = false;
	CustomRoomVariable.degree90 = false;
	CustomRoomVariable.degree180 = false;
	CustomRoomVariable.particlePosition = null;

};

var deleteParallelLine = function (children) {

	for (var i = 0; i < children.length; i++) {
		var item = children[i];
		if (item.description && (item.description === "parallel")) {
			children.splice(i--, 1);
		}
	}

};

var drawParallelLine = function (x, y, scaleAxis) {

//	deleteParallelLine(Scene2d.scene.children);

	var geomt = new THREE.Geometry();
	var x2 = scaleAxis === "X" ? -x : x;
	var y2 = scaleAxis === "Y" ? -y : y;
	geomt.vertices.push(new THREE.Vector3(x, y, 5),
					new THREE.Vector3(x2, y2, 5));
	var material = new THREE.LineBasicMaterial({color: 0x5edb0f, linewidth: 1, opacity: 0.5});
	var line = new THREE.Line(geomt, material);
	line.description = "parallel";

	if (scaleAxis === "X")
		line.scale.x = 100;
	else if (scaleAxis === "Y")
		line.scale.y = 100;

	line.geometry.verticesNeedUpdate = true;

	return line;

};

var createCustomWallMesh = function (startPoint, endPoint) {

	var geomt = new THREE.Geometry();
	geomt.vertices.push(new THREE.Vector3(startPoint.x, startPoint.y, 10),
					new THREE.Vector3(endPoint.x, endPoint.y, 10));
	geomt.computeLineDistances();
	var material = new THREE.LineBasicMaterial({color: 0x000000, linewidth: 5});
	var line = new THREE.Line(geomt, material);
	line.description = "dashLine";

	return line;
};

var intersectedPoint = function (CustomRoomVariable, coordinateMouse) {

	CustomRoomVariable.intersectedX = false;
	CustomRoomVariable.intersectedY = false;
	var pointX, pointY;

	if (CustomRoomVariable.templatePoints.length) {
		CustomRoomVariable.templatePoints.forEach(function (item) {
			if (Math.abs(item.x - coordinateMouse.x) < 12) {
				CustomRoomVariable.intersectedX = true;
				return pointX = item.x;
			}
			else if (Math.abs(item.y - coordinateMouse.y) < 12) {
				CustomRoomVariable.intersectedY = true;
				return pointY = item.y;
			}
		});
	}
	return {x: pointX, y: pointY};

};
