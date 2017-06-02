'use strict';

/* File Created: July 9, 2015 */

function Apartment() {
    //		this.Scene = params.scene;

    this.objects = [];

    this.wallCollection = []; // key = wall-i, value = A, B points, width etc

    this.joinsCollection = []; // many-to-many collection = wall1.B, wall2.A

    this.countCorner = 0;

    var self = this;

    this.addObject = function (obj, wallName) {
        obj.userData.wall = wallName;
        if (self.objects.indexOf(obj) === -1)
            self.objects.push(obj);
    };

    this.removeObject = function (obj) {
        var index = self.objects.indexOf(obj);
        if (index !== -1)
            self.objects.splice(index, 1);
    };

    // getters funcs
    this.GetWallByName = function (name) {

        var result;
        self.wallCollection.forEach(function (item) {
            if (item.name === name) {
                result = item;
                return;
            }
        });

        return result;
    };

    // return wall object by mesh
    this.GetWallByMesh = function (mesh) {

        var result;
        self.wallCollection.forEach(function (item) {
            if (item.mesh.id === mesh.id) {
                result = item;
                return;
            }
        });

        return result;
    };

    // return wall object that joins to A-end of target wall
    this.LeftNeigbour = function (name) {

        var leftName;

        self.joinsCollection.forEach(function (item) {

            if (item.w1 == name && item.pointW1 == 'A')
                leftName = item.w2;
            else if (item.w2 == name && item.pointW2 == 'A')
                leftName = item.w1;

            if (typeof leftName == 'string')
                return;
        });

        return self.GetWallByName(leftName);
    };

    // return wall object that joins to A-end of target wall
    this.RightNeigbour = function (name) {

        var rightName;

        self.joinsCollection.forEach(function (item) {

            if (item.w1 == name && item.pointW1 == 'B')
                rightName = item.w2;
            else if (item.w2 == name && item.pointW2 == 'B')
                rightName = item.w1;

            if (typeof rightName == 'string')
                return;
        });

        return self.GetWallByName(rightName);
    };

    this.TopArray = function () {

        var tops = [];
        self.wallCollection.forEach(function (item) {
            tops.push(item.A);
        });

        return tops;
    }
}

Apartment.apart = null;

function Wall(wName, ax, ay, bx, by, depth) {

    this.name = wName;
    this.A = { x: ax, y: ay };
    this.B = { x: bx, y: by };

    this.height = 304;
    this.depth = depth || 15; // custom or default
    this.length = null;// inside example 50
    this.width = null; // outside example 55
    this.touchPoint = null;
    this.info = {// information object
        line: null, // geometry info line
        textWallName: null, // geometry wall name
        textWallLength: null, // geometry wall name
        outsideCenter: null,
        lineAngle: null
    };
    // if innerAngleLarge180 = 0,then final wall.width after adding panels = wall.width - 8",
    // if innerAngleLarge180 = 1,then final wall.width after adding panels = wall.width - 4",
    // if innerAngleLarge180 = 2,then final wall.width after adding panels = wall.width
    this.innerAngleLess180 = 2;
}

function Join(name1, name2) {

    this.w1 = name1;
    this.w2 = name2;

    this.pointW1 = 'B';
    this.pointW2 = 'A';

    this.touch = null; // touch point between w1 and w2
}

/**
 * @params: sequential array of points {x, y}
 * @description fills walls & joins arrays of apart from set of sorted points
 */
function ApartmentBuilder(points) {

    var apart = new Apartment();

    // if 2 points then refuse of walls
    if (points.length < 3) {
        console.log('Not enouth points');
        return apart;
    }

    // create walls + joins from points
    for (var i = 1; i <= points.length; i++) {

        var prevP = points[i - 1];
        var currentP = (i == points.length ?
						points[0] : // last wall, last point = point[0]
						points[i]);

        var prevName = 'Wall ' + (i == 1 ?
						points.length : //for first wall
						i - 1);
        var currentName = 'Wall ' + i;
        var depth = points[i-1].depth || null;

        var wall = new Wall(currentName, prevP.x, prevP.y, currentP.x, currentP.y, depth);
        apart.wallCollection.push(wall);

        // join of current wall with previous one
        var join = new Join(prevName, currentName);
        apart.joinsCollection.push(join);
    }

    return apart;
}
;
