/* File Created: July 10, 2015 */
/**
 * @params: apart, name of wall that 'moves', targetPoint where to move
 * @description calculates the coordinates of wall endpoints (and 2 joined to it)
 */
//var disableSelect = false;
function SlideWall(apartment, wallName, targetPoint) {

    // find wall by name and wall's old equation
    var movedWall = apartment.GetWallByName(wallName);

    if (typeof movedWall != 'object')
        return;

    var oldWallRule = new LineRule(movedWall.A, movedWall.B);

    // parallel lines have the same angular coeff but different offset
    // find this new offcet by oldWallRule & targetPoint
    // b = y - kx

    var newWallRule = new LineRule();
    if (isFinite(oldWallRule.x)) {
        newWallRule.x = targetPoint.x;
    }
    else {
        var offset = targetPoint.y - targetPoint.x * oldWallRule.k;

        newWallRule.k = oldWallRule.k;
        newWallRule.b = offset;
    }

    // find new ends of this wall = intersection with joined
    // left one
    var leftWall = apartment.LeftNeigbour(wallName);
    var backup1;

    if (typeof leftWall === 'object') {

        var leftRule = new LineRule(leftWall.A, leftWall.B);
        var endCoord1 = CalculateIntercection(leftRule, newWallRule);

        backup1 = leftWall.B;

        // apply new val to appart
        leftWall.B = endCoord1;
        movedWall.A = endCoord1;
    }

    // right one
    var rightWall = apartment.RightNeigbour(wallName);
    var backup2;
    if (typeof rightWall === 'object') {

        var rightRule = new LineRule(rightWall.A, rightWall.B);
        var endCoord2 = CalculateIntercection(rightRule, newWallRule);

        backup2 = rightWall.A;

        // apply new val to appart
        rightWall.A = endCoord2;
        movedWall.B = endCoord2;
    }

    // check if new room is correct and rollback if not
    if (!CheckRoomGeometry(apartment)) {

        leftWall.B = backup1;
        movedWall.A = backup1;

        rightWall.A = backup2;
        movedWall.B = backup2;

        return false;
    }

    if (isStumbledUponTheObject(apartment)) {

        var first = getJoinLastValidPosition(apartment, leftWall.name, 'w1'),
            second = getJoinLastValidPosition(apartment, rightWall.name, 'w2');

        backup1 = {
            x: first.x,
            y: first.y
        };

        backup2 = {
            x: second.x,
            y: second.y
        };

        leftWall.B = backup1;
        movedWall.A = backup1;

        rightWall.A = backup2;
        movedWall.B = backup2;

        return false;
    }


    return true;
}

function isStumbledUponTheObject(apartment) {
    var points = apartment.joinsCollection,
        objects = apartment.objects,
        direction = new THREE.Vector3(0, 0, -1),
        i = 0,
        point,
        ray,
        node;
    for (; i < points.length; i++) {
        node = points[i];
        point = node.touch.position;
        ray = new THREE.Raycaster(point, direction);
        if (ray.intersectObjects(objects).length > 0)
            return true;
        else
            node.lastValidPosition = point.clone();
    }
    return false;
}

function getJoinLastValidPosition(apartment, wallName, wallNumber) {
    var joins = apartment.joinsCollection,
        i = 0,
        join;
    for (; i < joins.length; i++) {
        join = joins[i];
        if (join[wallNumber] === wallName)
            return join.lastValidPosition;
    }
    return null;
}


function SlideTouchPoint(apartment, point, targetCoordinates) {

    // find join
    var join = apartment.joinsCollection.filter(function (item) {
        return item.touch.currentWallName === point.currentWallName;
    });

    var CustomRoomVariable = {};

    CustomRoomVariable.templatePoints = [];

    for (var k = 0; k < apartment.wallCollection.length; k++) {
        var wall = apartment.wallCollection[k];
        if (point.currentWallName == wall.touchPoint.currentWallName)
            continue;
        else
            CustomRoomVariable.templatePoints.push(wall.A);
    }
    var coordinates = intersectedPoint(CustomRoomVariable, targetCoordinates);
    //					console.log(CustomRoomVariable);
    //					console.log("intersected point = ", coordinates);

    if (join.length == 1) {
        var currentWall = apartment.GetWallByName(join[0].w2);
        var preventWall = apartment.GetWallByName(join[0].w1);

        var backup = { x: currentWall.A.x, y: currentWall.A.y };

        if (CustomRoomVariable.intersectedX && CustomRoomVariable.intersectedY) {
            currentWall.A.x = coordinates.x;
            currentWall.A.y = coordinates.y;
            preventWall.B.x = coordinates.x;
            preventWall.B.y = coordinates.y;
            CustomRoomVariable.particlePosition = coordinates;
        }
        else if (CustomRoomVariable.intersectedX) {
            currentWall.A.x = coordinates.x;
            currentWall.A.y = targetCoordinates.y;
            preventWall.B.x = coordinates.x;
            preventWall.B.y = targetCoordinates.y;
            CustomRoomVariable.particlePosition = coordinates;
        }
        else if (CustomRoomVariable.intersectedY) {
            currentWall.A.x = targetCoordinates.x;
            currentWall.A.y = coordinates.y;
            preventWall.B.x = targetCoordinates.x;
            preventWall.B.y = coordinates.y;
            CustomRoomVariable.particlePosition = coordinates;
        }
        else {

            // update then if rollback if not correct
            currentWall.A = targetCoordinates;
            preventWall.B = targetCoordinates;
        }

        if (!CheckRoomGeometry(apartment)) {
            CustomRoomVariable.intersectedX = CustomRoomVariable.intersectedY = false;
            currentWall.A = backup;
            preventWall.B = backup;
            return false;
        }

        if (isStumbledUponTheObject(apartment)) {

            var position = getJoinLastValidPosition(apartment, currentWall.name, 'w2');

            backup = {
                x: position.x,
                y: position.y
            };

            currentWall.A = backup;
            preventWall.B = backup;
            return false;
        }
    }

    return CustomRoomVariable;
}

// returns true if geometry is correct
function CheckRoomGeometry(apartment) {

    var roomCorrect = true;

    // constants
    var minAngle = 10, minLength = 20;

    // alias
    var ws = apartment.wallCollection;

    for (var i = 0; i < ws.length; i++) {

        var currentWall = ws[i];

        // min wall length
        var length = wallLength(currentWall.A.x, currentWall.A.y, currentWall.B.x, currentWall.B.y);
        if (length <= minLength) {
            roomCorrect = false;
            break;
        }

        for (var k = 1; k < ws.length; k++) {

            if (k == i)     // skip same room check
                continue;

            if (Math.abs(k - i) == 1 || (i == 0 && k == ws.length - 1))   // check angle between neigbours
            {
                var angle = AngleBetweenWalls(currentWall, ws[k]);
                if (isNaN(angle) || angle > minAngle)
                    continue;
            }
            else    // not neigbours = check intersection
            {
                var intersect = IfVectorsIntersect(currentWall, ws[k]);

                var onTop = OneOnAnother(currentWall, ws[k]);

                if (!onTop && !intersect)
                    continue;
            }

            // otherwise
            roomCorrect = false;
            break;
        }

        if (!roomCorrect)
            break;
    }

    return roomCorrect;
}

function IfVectorsIntersect(vector1, vector2) {
    var ax1 = vector1.A.x;
    var ay1 = vector1.A.y;
    var ax2 = vector1.B.x;
    var ay2 = vector1.B.y;

    var bx1 = vector2.A.x;
    var by1 = vector2.A.y;
    var bx2 = vector2.B.x;
    var by2 = vector2.B.y;

    // if there's intersection 
    var v1 = (bx2 - bx1) * (ay1 - by1) - (by2 - by1) * (ax1 - bx1);
    var v2 = (bx2 - bx1) * (ay2 - by1) - (by2 - by1) * (ax2 - bx1);
    var v3 = (ax2 - ax1) * (by1 - ay1) - (ay2 - ay1) * (bx1 - ax1);
    var v4 = (ax2 - ax1) * (by2 - ay1) - (ay2 - ay1) * (bx2 - ax1);

    var intersect = (v1 * v2 < 0) && (v3 * v4 < 0);
    return intersect;
}

function AngleBetweenWalls(wall1, wall2) {

    // create vectors coming from join to other walls points
    var vectorA = {}, vectorB = {};

    // find point of walls join 
    if (wall1.B.x == wall2.A.x && wall1.B.y == wall2.A.y) {
        vectorA.start = wall1.B;
        vectorA.end = wall1.A;

        vectorB.start = wall2.A;
        vectorB.end = wall2.B;

    }
    else if (wall1.A.x == wall2.B.x && wall1.A.y == wall2.B.y) {
        vectorA.start = wall1.A;
        vectorA.end = wall1.B;

        vectorB.start = wall2.B;
        vectorB.end = wall2.A;
    }
    else {
        return "walls don't intersect";
    }

    // from vector's point find vector's coordinates
    // A(xA;yA), B(xB;yB), AB−→={xB−xA;yB−yA}
    vectorA.x = vectorA.end.x - vectorA.start.x;
    vectorA.y = vectorA.end.y - vectorA.start.y;

    vectorB.x = vectorB.end.x - vectorB.start.x;
    vectorB.y = vectorB.end.y - vectorB.start.y;

    // get vector's length
    vectorA.Length = wallLength(vectorA.start.x, vectorA.start.y, vectorA.end.x, vectorA.end.y);
    vectorB.Length = wallLength(vectorB.start.x, vectorB.start.y, vectorB.end.x, vectorB.end.y);

    // cos α = 	a·b / (|a|·|b|)
    //a · b = ax · bx + ay · by - скалярное произведение
    var cosA = (vectorA.x * vectorB.x + vectorA.y * vectorB.y) / (vectorA.Length * vectorB.Length);

    return Math.acos(cosA) * 180 / Math.PI;
}

// check if section2 ends belong to section1
function OneOnAnother(section1, section2) {

    if (IsPointOnSection(section1, section2.A))
        return true;

    if (IsPointOnSection(section1, section2.B))
        return true;

    return false;
}

function IsPointOnSection(section, point) {

    // if point on line?
    var line = new LineRule(section.A, section.B);

    var onLine = false;
    if (isFinite(line.x)) {
        onLine = (point.x === line.x);
    }
    else {
        // kx + b = y
        onLine = (Math.abs(line.k * point.x + line.b - point.y).toFixed(2) < 0.2);
    }

    // if point between ends?
    if (onLine) {
        var lowX, highX, lowY, highY;
        if (section.A.x < section.B.x) {
            lowX = section.A.x;
            highX = section.B.x;
        }
        else {
            lowX = section.B.x;
            highX = section.A.x;
        }
        if (section.A.y < section.B.y) {
            lowY = section.A.y;
            highY = section.B.y;
        }
        else {
            lowY = section.B.y;
            highY = section.A.y;
        }
        return (lowX <= point.x) && (point.x <= highX)
						&& (lowY <= point.y) && (point.y <= highY);
    }

    return false;
}