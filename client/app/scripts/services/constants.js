;(function () {

    var render = new THREE.WebGLRenderer({ antialias: true });

    var constants = {
        UNDO_STACK_LIMIT: 5,
        wallPanelLength: 58.42,
        plugAutoplaceAt: 243.84,
        lightSwitchPanelMinLength: 30.48,
        wallPanelItemHeight: 10.16,
        wallPanelItemLength: 7.62,
        windowFloorOffset : 150,
        windowOffsetFromRoof: 5.08,
        wallHeight: 304,
        wallWidth: 15,
        wallCabinetDefaultHeight: 213.36,
        PanelType: {
            BLANK: 0,
            PLUG: 1,
            SWITCH: 2,
            GHOST : 3
        },
        CabinetType : {
            TOOL_STORAGE: 4,
            WALL: 5,
            HIGH_CAPACITY: 6
        },
        TableType : {
            ADJUSTABLE: 7,
            CORNER: 8
        },
        wallUnitLength:{
            FT: true,
            M:false
        },
        RoomObject : {
            Window: function() {},
            Door: function() {},
            Cabinet: function() {},
            Table: function() {},
            WallPanel: function() {}
        },
        ItemOption : {
            MIRROW: 0,
            ROTATE: 1,
            DOOR_FLIP_X: 2,
            DOOR_FLIP_Y : 3
        },
        ObjectType: {
            CABINET : 2,
            TABLE: 3,
            WALL_PANEL : 4
        },
        HighlightState: {
            DEFAULT: 0x000000,
            SELECTED: 0xFFFF00,
            ERROR: 0xff0000
        },
        maxAnisotropy: render.getMaxAnisotropy(),
        SizeUnit: {
            CM: 0,
            FT: 1,
            INCH: 2,
            FT_INCH: 3
        }
    };

    constants.lightSwitchFloorOffset = 124.46 + (constants.wallPanelItemHeight / 2);
    constants.plugFloorOffset = 43.18 + (constants.wallPanelItemHeight / 2);
   

    angular.module('vigilantApp').constant('constants', constants);
})();
