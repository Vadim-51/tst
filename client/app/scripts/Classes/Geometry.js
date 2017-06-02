/* File Created: July 27, 2015 */

////////////
// class for storing y = kx + b equation
// exception: x=5 equation for parallel oy
////////////
function LineRule(pointA, pointB) {

  this.k = (typeof pointA != 'object' || (pointA.x == pointB.x) ? undefined :
  (pointB.y - pointA.y) / (pointB.x - pointA.x)); // angular coefficient
  this.b = (isNaN(this.k) ? undefined : pointA.y - pointA.x * this.k); // offset

  this.x = (isFinite(this.k) || pointA == undefined ? undefined : // тангенс нормальный
    pointA.x); // parallel x=A.x=B.x
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * @params: 2 lines defined by LineRule class
 * @description calculates the point of intersection of params
 y = kx + l; y = qx + p => x = (p - l) / (k - q)
 * return point of intersection
 */
function CalculateIntercection(rule1, rule2) {

  var X, Y;
  if (isNumeric(rule1.x)) { // rule1 parallel oy
    X = rule1.x;
    Y = rule2.k * X + rule2.b;
  }
  else if (isNumeric(rule2.x)) { // rule2 parallel oy
    X = rule2.x;
    Y = rule1.k * X + rule1.b;
  }
  else {
    X = (rule2.b - rule1.b) / (rule1.k - rule2.k);
    Y = rule1.k * X + rule1.b;
  }

  return {x: X, y: Y};
}

function GetCenter(pointA, pointB) {

  var x = (pointA.x + pointB.x) / 2;
  var y = (pointA.y + pointB.y) / 2;

  return {x: x, y: y};
}

var convertToFT = function (length) {

  var convert = length * 0.3937008;
  var FT = convert / 12;
  FT = Math.floor(FT);
  var dif = convert / 12 - FT;
  var INCH = dif / (1 / 12);
  INCH = parseFloat(INCH.toFixed(1));
  if(INCH === 12 ){
    FT+= 1;
    INCH = 0;
  }

  var result = FT + "'" + INCH + '"';

  return result;
};

var angleRadians = function (x1, y1, x2, y2) {

  var angle = Math.atan2(y2 - y1, x2 - x1);

  return angle;
};

var convertRadiansToDegree = function (angle) {

  var angleDegree = Math.abs((angle * 180) / Math.PI);

  return angleDegree;
};

var changeLengthInTable = function (length, selectWall, changedWall) {
  var startPoint, changePoint;
  if ((changedWall.A.x === selectWall.A.x && changedWall.A.y === selectWall.A.y) ||
    (changedWall.A.x === selectWall.B.x && changedWall.A.y === selectWall.B.y)) {
    startPoint = changedWall.B;
    changePoint = changedWall.A;
  }
  else if ((changedWall.B.x === selectWall.A.x && changedWall.B.y === selectWall.A.y) ||
    (changedWall.B.x === selectWall.B.x && changedWall.B.y === selectWall.B.y)) {
    startPoint = changedWall.A;
    changePoint = changedWall.B;
  }
  var angle = angleRadians(startPoint.x, startPoint.y, changePoint.x, changePoint.y);
  var Xproection = length * Math.sin(angle);
  var Yproection = length * Math.sin((Math.PI / 2 - angle));
  var x = startPoint.x + Yproection;
  var y = startPoint.y + Xproection;
//				console.log(x);
//				console.log(y);
  return {x: x, y: y};
};

var CalculateCoordinateVector = function (startX, startY, endX, endY) {
  return {x: (endX - startX), y: (endY - startY)};
};

var getAngleBetweenVectorAndAxisX = function (vector) {
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

var areaForCentroidFloor = function(points) {
  var area=0;
  var pts = points;
  var nPts = pts.length;
  var j=nPts-1;
  var p1; var p2;

  for (var i=0;i<nPts;j=i++) {
    p1=pts[i]; p2=pts[j];
    area+=p1.x*p2.y;
    area-=p1.y*p2.x;
  }
  area/=2;

  return area;
};

var centroidCoordinateFloor = function(points) {
  var pts = points;
  var nPts = pts.length;
  var x=0; var y=0;
  var f;
  var j=nPts-1;
  var p1; var p2;

  for (var i=0;i<nPts;j=i++) {
    p1=pts[i]; p2=pts[j];
    f=p1.x*p2.y-p2.x*p1.y;
    x+=(p1.x+p2.x)*f;
    y+=(p1.y+p2.y)*f;
  }

  f=areaForCentroidFloor(points)*6;

  return {x:x/f, y:y/f};
};
