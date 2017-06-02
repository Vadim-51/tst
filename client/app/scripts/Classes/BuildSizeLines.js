/* File Created: July 27, 2015 */
function BuildSizeLines(apartment) {

    var offset = 22; // length between wall and it's size line

    // find where to place outside lines on left | on right

    // build 1st wall midperpendicular
    var start = apartment.wallCollection[0];
    var left =  apartment.LeftNeigbour(start.name);
    var right =  apartment.RightNeigbour(start.name);
    var left_vertex = GetActualGeometryVertex(left.mesh,left.mesh.geometry.vertices[0]);
    var right_vertex = GetActualGeometryVertex(right.mesh,right.mesh.geometry.vertices[5]);

    var firstRule = new LineRule(left_vertex, right_vertex);
    var startCenter = GetCenter(left_vertex, right_vertex);

    var midperpRule = BuildPerpendicular(firstRule, startCenter);

    // take 1 point on midperp line
    var topX, topY;
    if (isNumeric(midperpRule.k))
    {
        topX = startCenter.x + offset;
        topY = midperpRule.k * topX + midperpRule.b;

        // adjustment for huge values
        if (Math.abs(topY - startCenter.y) > 30) {
            topY = startCenter.y + offset;
        }
    }
    else
    {
        topX = midperpRule.x;
        topY = startCenter.y + offset;
    }


    var tops = apartment.TopArray();

//    var topLog = "";
//    tops.forEach(function(item) {
//        topLog += "(" + item.x.toFixed(1) + ";" + item.y.toFixed(1) + ")";
//    });


    var isInside = IsPointInsidePolygon(tops, topX, topY);
    var isLeft = IsPointOnLeft(start, {x: topX, y: topY});

    var outerSide = isInside ^ isLeft ? "left" : "right";

   // console.log(isInside + " " + isLeft + " " + outerSide, topLog);

    apartment.wallCollection.forEach(function (item) {

        AddSizePoints(item, offset, 'right');
    });
}

function AddSizePoints(vector, offset, side) {
  var left_vertex, right_vertex;
  if(Apartment.apart !== null) {
    var left = Apartment.apart.LeftNeigbour(vector.name);
    var right = Apartment.apart.RightNeigbour(vector.name);
    left_vertex = GetActualGeometryVertex(left.mesh, left.mesh.geometry.vertices[0]);
    right_vertex = GetActualGeometryVertex(right.mesh, right.mesh.geometry.vertices[5]);
  }
  else{
    left_vertex = vector.A;
    right_vertex = vector.B;
  }
    // default side
    if (side === undefined)
        side = 'left';

    // build perpend to 1 of the side's end
    var vectorRule = new LineRule(left_vertex, right_vertex);
    var perpend = BuildPerpendicular(vectorRule, left_vertex);

    var length = 50; // can be any value

    // take 2 direction points
    var p1 = {}, p2 = {};

    if (isNumeric(perpend.k)) {
        p1.x = left_vertex.x + length;
        p1.y = perpend.k * p1.x + perpend.b;

        p2.x = left_vertex.x - length;
        p2.y = perpend.k * p2.x + perpend.b;
    }
    else {
        p1.x = p2.x = perpend.x;
        p1.y = left_vertex.y - length;
        p2.y = left_vertex.y + length;
    }

    if (IsPointOnLeft(vector, p1) ^ (side == "right")) {
        AddSize(vector, p1, offset);
    }
    else {
        AddSize(vector, p2, offset);
    }
}

// line rule and some point on it where to build
function BuildPerpendicular(line, point) {

    var rule = new LineRule();

    if (line.k === 0) // line = parallel ox
    {
        rule.x = point.x;
    }
    else if (isFinite(line.x)) // line = parallel oy
    {
        rule.k = 0;
        rule.b = point.y;
    }
    else
    {
        rule.k = -(1 / line.k);
        rule.b = (1 / line.k) * point.x + point.y;
    }
    return rule;
}

function IsPointInsidePolygon(joinCoord, x, y) {

    var N = joinCoord.length;

    var p = joinCoord;  // aliases

    for (var n = 0; n < joinCoord.length; n++) {

        var flag = 0;       // locals
        var i1, i2;

        // cicle for last join
        i1 = n < N - 1 ? n + 1 : 0;
        while (flag === 0) {

            // devide polygon into circles
            i2 = i1 + 1;
            if (i2 >= N)
                i2 = 0;

            if (i2 == (n < N - 1 ? n + 1 : 0))
                break;

            // square of polygon sector
            var S = Math.abs(p[i1].x * (p[i2].y - p[n].y) +
                             p[i2].x * (p[n].y - p[i1].y) +
                             p[n].x * (p[i1].y - p[i2].y));

            // squares of triangle = target point + polygone side
            var S1 = Math.abs(p[i1].x * (p[i2].y - y) +
                              p[i2].x * (y - p[i1].y) +
                              x * (p[i1].y - p[i2].y));

            var S2 = Math.abs(p[n].x * (p[i2].y - y) +
                              p[i2].x * (y - p[n].y) +
                              x * (p[n].y - p[i2].y));

            var S3 = Math.abs(p[i1].x * (p[n].y - y) +
                              p[n].x * (y - p[i1].y) +
                              x * (p[i1].y - p[n].y));

            // округлить для дробных чисел
            //if (S == S1 + S2 + S3) {
            if (Math.abs(S - (S1 + S2 + S3)) < 5) {
                flag = 1;
                break;
            }

            i1++;
            if (i1 >= N)
                i1 = 0;
        }

        if (flag == 1)
            break;
    }

    return flag;
}

function IsPointOnLeft(vector, point) {

    var d = (point.x - vector.A.x) * (vector.B.y - vector.A.y) - (point.y - vector.A.y) * (vector.B.x - vector.A.x);
    return d < 0;
}

function AddSize(section, directionPoint, offset) {
  var left_vertex, right_vertex;
  if(Apartment.apart !== null) {
    var left = Apartment.apart.LeftNeigbour(section.name);
    var right = Apartment.apart.RightNeigbour(section.name);
    left_vertex = GetActualGeometryVertex(left.mesh, left.mesh.geometry.vertices[0]);
    right_vertex = GetActualGeometryVertex(right.mesh, right.mesh.geometry.vertices[5]);
  }
  else{
    left_vertex = section.A;
    right_vertex = section.B;
  }

    // direction point is on perpendicular to section.A point
    var lengthToPoint = wallLength(left_vertex.x, left_vertex.y, directionPoint.x, directionPoint.y);

    var x1 = left_vertex.x + offset * (directionPoint.x - left_vertex.x) / lengthToPoint;
    var y1 = left_vertex.y + offset * (directionPoint.y - left_vertex.y) / lengthToPoint;

    var wallRule = new LineRule(left_vertex, right_vertex);
    var wallParallel = new LineRule();

    if (isFinite(wallRule.x)) {
        wallParallel.x = x1;
    }
    else {
        wallParallel.k = wallRule.k;
        wallParallel.b = y1 - x1 * wallRule.k;
    }

    // 2nd size point = intersection of wall parallel & perpend to 2nd point
    var perp2 = BuildPerpendicular(wallRule, right_vertex);
    var point2 = CalculateIntercection(wallParallel, perp2);

    section.sizePointA = {x: x1, y: y1};
    section.sizePointB = {x: point2.x, y: point2.y};
}

function InsideCenter(section) {

    var wallRule = new LineRule(section.A, section.B);
    var wallCenter = GetCenter(section.A, section.B);
    var wallPerpend = BuildPerpendicular(wallRule, wallCenter);

    var outsideRule = new LineRule(section.sizePointA, section.sizePointB);

    var insideRule = new LineRule();

    if (isFinite(wallRule.x)) {
        insideRule.x = 2 * wallRule.x - outsideRule.x;
    }
    else {
        var insideB = -(wallRule.b - outsideRule.b);

        insideRule.k = wallRule.k;
        insideRule.b = 2 * wallRule.b - outsideRule.b//insideB;
    }
    return CalculateIntercection(insideRule, wallPerpend);
}

function GetActualGeometryVertex (mesh, vertices){
  var vertex = new THREE.Vector3();
  mesh.updateMatrixWorld();
  vertex.copy(vertices);
  vertex.applyMatrix4(mesh.matrixWorld);
  return vertex;
}
