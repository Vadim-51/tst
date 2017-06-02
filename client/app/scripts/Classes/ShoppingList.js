/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function ShoppingList() {
  this.countWall = null;
  this.roomLinearLength = null; //default unit m
  this.floorArea = null; //default unit m2
  this.wallArea = null; //default unit m2

  this.panels = [
    {qty: null, name: 'Plain Panel', price: 59.99, unit: 'ea.', upc: '626539700305'}, //Blank index = 0
    {qty: null, name: 'Wall Plug Panel', price: 71.99, unit: 'ea.', upc: '626539700312'}, //WallPlug index = 1
    {qty: null, name: 'Light Switch Panel', price: 71.99, unit: 'ea.', upc: '626539700329'}, //LightSwitch index = 2
    {qty: null, name: 'Corner Panel (adj)', price: 53.99, unit: 'ea.', upc: '626539700336'} // Corner index = 3
  ];

  this.supplies = [
    {qty: 0, name: 'Patch Pro Seam Filler Quart ', price: 16.99, unit: 'ea.', upc: '626539700343'}, // SeamFillerQuart index = 0
    {qty: 0, name: 'Patch Pro Seam Filler Gallon', price: 67.99, unit: 'ea.', upc: '626539700343'}, // SeamFillerGallon index = 1
    {qty: null, name: 'DRIcore 5” Screws (50 pack)', price: 9.99, unit: 'pack', upc: '626539700374'}  // Screws index = 2
  ];

  this.subfloor = {
    Panels: {qty: null, name: 'Sub Floor Panels', price: 6.48, unit: 'ea.', upc: '626539700015'},
    PanelsRPlus: {qty: null, name: 'Sub Floor Panels R+', price: 7.50, unit: 'ea.', upc: '626539700091'},
    LevelingKit: {qty: null, name: 'Leveling Kit', price: 5.99, unit: 'ea.', upc: '626539700107'}
  };
  this.generalSupplies = {
    Lumbert: {qty: null, name: 'Dimensional Lumber - 2” x 2” (linear ft.)', price: 0.31, unit: '/ft'},
    Screws: {qty: null, name: '3” Standard Construction Screws', price: 0.09, unit: 'ea.'},
    PLPremium: {qty: null, name: 'PL Premium - 10 oz Tube (ea.)', price: 5.28, unit: 'ea.'}
  };
}
ShoppingList.list = null;

function CreateShoppingList(roomStateManager, constants) {

    //console.log("apart=", apart);
    var points = roomStateManager.getPoints();
    var height = constants.wallHeight / 100;
  var list = new ShoppingList();
  list.countWall = points.length;
      //apart.wallCollection.length;
  list.roomLinearLength = getRoomLinearLength(points); // return in metrs
  list.wallArea = getWallArea(list.roomLinearLength, height);// return in metrs square
  list.floorArea = getFloorArea(points); // return in metrs square

  //var newLengthRoom = RoomLengthWithoutDoors(apart, apart.objects);
  //var ofWallPanels = parseFloat(convertMToFT(newLengthRoom)) / 1.8;
  //ofWallPanels = Math.ceil(ofWallPanels + ofWallPanels*0.1);
  var ofWallPanels = Math.ceil(parseFloat(convertMToFT(list.roomLinearLength)) / 1.8);
  console.log('count panels = ', ofWallPanels);

  list.panels[0].qty = ofWallPanels - list.panels[1].qty - list.panels[2].qty;
  list.panels[3].qty = 0;//apart.countCorner;

  var Aonly = Math.ceil(convertMToFT(list.roomLinearLength)/20);
  list.supplies[1].qty = Math.floor(Aonly / 4);
  //var mod = (convertMToFT(list.roomLinearLength) - 80*Math.floor(convertMToFT(list.roomLinearLength)/80));
  list.supplies[0].qty = Aonly-list.supplies[1].qty*4;

  list.supplies[2].qty = Math.ceil(ofWallPanels * 2 / 50);


  list.subfloor.Panels.qty = list.subfloor.PanelsRPlus.qty = Math.ceil(convertM2ToFT2(list.floorArea) / 3.3);
  list.subfloor.LevelingKit.qty = Math.ceil(list.subfloor.Panels.qty / 60);

  //General Supplies
  list.generalSupplies.Lumbert.qty = convertMToFT(list.roomLinearLength) * 2;
  list.generalSupplies.Screws.qty = (list.panels[0].qty + list.panels[1].qty) * 2;
  list.generalSupplies.PLPremium.qty = Math.ceil(list.panels[3].qty / 2);

  console.log("list = ", list);
  return list;

}

function getRoomLinearLength(points) {
    var linearLength = 0;
    for (var i = 0; i < points.length; i++) {
        var a = points[i];
        var b = points[(i + 1) % points.length];
        var len = b.clone().sub(a).length();
        linearLength += len;
  }
  return linearLength / 100;
}

function getFloorArea(points) {
    var X = [],
         Y = [],
         i = 0,
         point,
        numPoints = points.length,
        area;

    for (; i < numPoints; i++) {
        point = points[i];
        X.push(point.x);
        Y.push(point.y);
    }

    area = polygonArea(X, Y, numPoints);
    area = area * 0.0001; // convert cm2 to m2

    return area;
}

function polygonArea(X, Y, numPoints) {
  var area = 0;         // Accumulates area in the loop
  var j = numPoints - 1;  // The last vertex is the 'previous' one to the first

  for (var i = 0; i < numPoints; i++) {
//		console.log("iteretion area=", (X[j] + X[i]) * (Y[j] - Y[i]));
    area += (X[j] + X[i]) * (Y[j] - Y[i]);
    j = i;  //j is previous vertex to i
  }
  return Math.abs(area / 2);
}

function getWallArea(P, H, apart) {
  var wallArea = P * H;

// considering objects on walls
//	for (var i = 0; i < apart.wallCollection.length; i++) {
//		var item = apart.wallCollection[i];
//		if (apart.objects[item.name]) {
//			apart.objects[item.name].forEach(function (child) {
//				console.log(child);
//				wallArea -= (child.userData.entity.length/100) * (child.userData.entity.height/100);
//			});
//		}
//	}
  return parseFloat(wallArea.toFixed(2));
}

function convertM2ToFT2(v) {
  var res = parseFloat((v * 10.764).toFixed(2));
  var d = res.toString().split(".")[1];
  if((parseFloat('0.'+d)) < 0.1){
    res = res.toString().split(".")[0]+'.00'
  }
  return res;
}
function convertMToFT(v) {
  //return parseFloat((v * 3.28083).toFixed(2));
  var res = parseFloat((v * 3.28083).toFixed(2));
  var d = res.toString().split(".")[1];
  if((parseFloat('0.'+d)) < 0.1){
    res = res.toString().split(".")[0]+'.00'
  }
  return res;
}
var segmetTypes = {
  BLANK: 0,
  PLUG: 1,
  SWITCH: 2
};
function getCountPanel(wallArray, segments) {
  var plug = 0, lightswitch = 0;
  for (var i = 0; i < wallArray.length; i++) {
    var wallSegments = segments[i];
    for (var j = 0; j < wallSegments.length; j++) {
      var segment = wallSegments[j];
      if (segment === segmetTypes.PLUG)
        plug += 1;
      else if (segment === segmetTypes.SWITCH)
        lightswitch += 1;
    }
  }
  return {plug: plug, switch: lightswitch};
};

function getVertexPolygon(wallArray) {
  var vertexInputOutgoingVector = [];
  var length = wallArray.length;

  for (var i = 0; i < length; i++) {
    var item = wallArray[i];
    var vertex = item.A;
    var inputVector = (i == 0 ? wallArray[length - 1] : wallArray[i - 1]);
    var outgoingVector = item;

    var coordinatesInput = CalculateCoordinateVector(inputVector.A.x, inputVector.A.y, inputVector.B.x, inputVector.B.y);
    var coordinatesOutgoing = CalculateCoordinateVector(outgoingVector.A.x, outgoingVector.A.y, outgoingVector.B.x, outgoingVector.B.y);
    vertexInputOutgoingVector.push({
      vertex: vertex,
      inputVector: coordinatesInput,
      outgoingVector: coordinatesOutgoing,
      inputVectorName:inputVector.name,
      outgoingVectorName:outgoingVector.name
    });
  }

  return vertexInputOutgoingVector;
}

function CalculateCoordinateVector(startX, startY, endX, endY) {
    return { x: (endX - startX), y: (endY - startY) };
};

function getAngleBetweenVectorAndAxisX (vector) {
    //vector include coordinate (x;y)
    var cos, angle;
    cos = vector.x / (Math.sqrt(vector.x * vector.x + vector.y * vector.y));
    if (Math.abs(cos) < 1.0e-30)
        angle = Math.PI / 2;
    else {
        angle = Math.atan(Math.sqrt(1 - cos * cos) / cos);
    }
    if (vector.x < 0) {
        if (vector.y >= 0)
            angle = Math.PI + angle;
        else
            angle = -Math.PI - angle;
    }
    else if (vector.y < 0) {
        angle = -angle;
    }
    return angle * 180 / Math.PI; // return angle degree
};

function calculateAngleInVertex(vertexArray) {
  var length = vertexArray.length;

  for (var i = 0; i < length; i++) {
    var item = vertexArray[i];
    //console.log('iteration ', i);
    var angle1 = getAngleBetweenVectorAndAxisX(item.inputVector); //angle between input Vector and axis X
    //console.log('angel between input Vector ', item.input_name, ' and OX = ', angle1);
    var angle2 = getAngleBetweenVectorAndAxisX(item.outgoingVector); //angle between outgoing Vector and axis X
    //console.log('angel between outgoing Vector ', item.out_name, ' and OX = ', angle2);
    var angle = 180 - angle1 + angle2;
    if (angle > 360)
      angle = angle - 360;
    else if (angle < 0)
      angle = 360 + angle;
    //console.log('angel between vector = ', angle);
    item.angle = angle;
  }

  var checkInnerCorner = checkInnerCornerOfPolygon(vertexArray);
  if (!checkInnerCorner) {
    for (var i = 0; i < length; i++) {
      var item = vertexArray[i];
      item.angle = 360 - item.angle;
      //console.log('result angel = ', item.angle);
    }
  }
  return vertexArray;

}
function checkInnerCornerOfPolygon(vertexArray) {
  var length = vertexArray.length;
  var bool;
  var S1 = 0; // sum inner angle
  var S2 = 0; // sum exterior angle

  for (var i = 0; i < length; i++) {
    var item = vertexArray[i];
    S1 += item.angle;
    S2 += 360 - item.angle;
  }

  if (S1 < S2) {
    console.log("corner inner");
    bool = true;
  }
  else {
    console.log("corner exterior");
    bool = false;
  }

  return bool;

}
