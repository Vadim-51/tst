var displayLineInfo = function (wall) {
	var A = new THREE.Vector2();
	var B = new THREE.Vector2();
	A = wall.sizePointA;
	B = wall.sizePointB;

  var left_vertex, right_vertex;
  if(Apartment.apart !== null) {
    var left = Apartment.apart.LeftNeigbour(wall.name);
    var right = Apartment.apart.RightNeigbour(wall.name);
    left_vertex = GetActualGeometryVertex(left.mesh, left.mesh.geometry.vertices[0]);
    right_vertex = GetActualGeometryVertex(right.mesh, right.mesh.geometry.vertices[5]);
  }
  else{
    left_vertex = wall.A;
    right_vertex = wall.B;
  }

	var meshX = (A.x + B.x) / 2;
	var meshY = (A.y + B.y) / 2;
	var center = new THREE.Vector2(meshX, meshY);
	var angle = Math.atan2(B.y - A.y, B.x - A.x);
	var geomt = new THREE.Geometry();

	geomt.vertices.push(new THREE.Vector3(left_vertex.x, left_vertex.y, 300),
					new THREE.Vector3(A.x, A.y, 300),
					new THREE.Vector3(B.x, B.y, 300),
					new THREE.Vector3(right_vertex.x, right_vertex.y, 300));

	// material
	var material = new THREE.LineBasicMaterial({color: 0x5d5c58, linewidth: 1.2});
	var line = new THREE.Line(geomt, material);
	line.position.z = 10;
	line.visible = false;
	line.description = "infoLine";
	wall.info.line = line;
	wall.info.outsideCenter = center;
	wall.info.v = angle;

	return line;
};

var displayWallName = function (wall) {
//	var spritey = makeTextSprite(wall.name, wall.info.angleLine, {fontsize: 27, fontface: "Arial"});
	var canvas = document.createElement('canvas');
	canvas.width = 300;
	canvas.height = 150;
	var context = canvas.getContext('2d');
	context.save();
	context.font = "27px Arial";
	context.textAlign = 'center';

	// get size data (height depends only on font size)
	var metrics = context.measureText(wall.name);
	var textWidth = metrics.width;
	var tx = canvas.width / 2;
	var ty = canvas.height / 2;
	context.translate(tx, ty);
	context.rotate(wall.lineAngle);
	context.translate(-tx, -ty);
	context.fillStyle = "rgba(0, 0, 0, 1.0)";

	context.fillText(wall.name, canvas.width / 2, canvas.height / 2 + 15);
	context.restore();

	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas);
	texture.needsUpdate = true;

	var spriteMaterial = new THREE.SpriteMaterial({
		map: texture,
		transparent: true,
		useScreenCoordinates: false});
	var sprite = new THREE.Sprite(spriteMaterial);
	sprite.visible = false;

	sprite.scale.set(200, 120, 1);
	var position = InsideCenter(wall);
	sprite.position.set(position.x, position.y, 300);
	sprite.description = "infoName";
	wall.info.textWallName = sprite;
	return sprite;
};

var displayWallLength = function (wall, length, unit) {
  //var unit_length = 'FT';
  var local_length;
  if(unit !== undefined && unit.M){
    local_length = wall.width !== null ? wall.width : length;
  }
  else {
    local_length = wall.width !== null ? convertToFT(wall.width) : convertToFT(length);
  }
	var result = makeTextSprite(local_length, wall.info.angleLine, {fontsize: 18, fontface: "Arial"});
  // canvas contents will be used for a texture
  var texture = new THREE.Texture(result.canvas);
  texture.needsUpdate = true;

  var spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true
  });

  var sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(200, 120, 1);
  var position = new THREE.Vector3(); position.copy(wall.info.outsideCenter);
  if(wall.info.v < 0){
    //console.log('metrics.width = ', result.width);
    if( wall.info.v >= -2.5) {
      position.x -= result.width / 2;
    }
    if(wall.info.v >= -0.8)
      position.y -= 18;
  }
  else{
    if( wall.info.v <= 2.5) {
      position.x += result.width / 2;
      position.y -= 18;
    }
  }
  sprite.position.set(position.x, position.y, 300);
  sprite.description = "infoLength";
  sprite.visible = false;
	wall.info.textWallLength = sprite;
	return sprite;
};
var UpdateTextureForWallLength = function(wall, unit){
  var local_length;
  if(unit !== undefined && unit.M){
    local_length = wall.width !== null ? wall.width : length;
  }
  else {
    local_length = wall.width !== null ? convertToFT(wall.width) : convertToFT(length);
  }
  var result = makeTextSprite(local_length, wall.info.angleLine, {fontsize: 18, fontface: "Arial"});
  // canvas contents will be used for a texture
  var texture = new THREE.Texture(result.canvas);
  texture.needsUpdate = true;
  wall.info.textWallLength.material.map = texture;
  wall.info.textWallLength.material.needsUpdate = true;
};

var makeTextSprite = function (message, angle, parameters) {
	if (parameters === undefined)
		parameters = {};

	var fontface = parameters.hasOwnProperty("fontface") ?
					parameters["fontface"] : "Arial";

	var fontsize = parameters.hasOwnProperty("fontsize") ?
					parameters["fontsize"] : 24;

	var canvas = document.createElement('canvas');
	canvas.width = 256;
	canvas.height = 128;
	var context = canvas.getContext('2d');
	context.save();
	context.font = "Bold " + fontsize + "px " + fontface;
	context.textAlign = 'center';

	// get size data (height depends only on font size)
	var metrics = context.measureText(message);
	var textWidth = metrics.width;
	var tx = canvas.width / 2;
	var ty = canvas.height / 2;
	context.translate(tx, ty);
	context.rotate(2 * Math.PI);
	context.translate(-tx, -ty);
	context.fillStyle = "rgba(93, 92, 88, 1.0)";

	context.fillText(message, canvas.width / 2 , canvas.height / 2 );
	context.restore();

	return {canvas:canvas, width:textWidth};
};


var visibleAllInfo = function () {
	Apartment.apart.wallCollection.forEach(function (item) {
		item.info.line.visible = true;
		item.info.textWallLength.visible = true;
		//item.info.textWallName.visible = true;
	});
};
var invisibleAllInfo = function () {
	Apartment.apart.wallCollection.forEach(function (item) {
		item.info.line.visible = false;
		item.info.textWallLength.visible = false;
		//item.info.textWallName.visible = false;
	});
};
var visibleInfoForIntersectedWall = function (wall) {
	wall.info.line.visible = true;
	wall.info.textWallLength.visible = true;
	//wall.info.textWallName.visible = true;
};
var invisibleInfoForIntersectedWall = function (wall) {
	wall.info.line.visible = false;
	wall.info.textWallLength.visible = false;
	//wall.info.textWallName.visible = false;
};
