function createCar(_x, _y, color, aiUpdate, speed) {
    var car = canvas.display.rectangle({
        x: _x,
        y: _y,
        width: 20,
        height: 10,
        fill: color,
        updateCar: aiUpdate,
        maxSpeed: speed,
        idle: true,
        origin: {x: "center", y: "center"},
        drive: function() {
            if(this.idle == false) {
                var speedNow = this.maxSpeed;//rand(this.maxSpeed + 1);
                this.x += speedNow * Math.floor(1000 * Math.cos(-1 * (this.rotation % 360) * Math.PI / 180)) / 1000;
                this.y += speedNow * Math.floor(1000 * Math.sin((this.rotation % 360) * Math.PI / 180)) / 1000;
            }
        }
    });
    car.bind("click tap", function() {console.log(this.rotation);});
    return car;
}

function playerLogic() {
    this.idle = !p.gas;
    if(p.left == true) this.rotate(-5);
    if(p.right == true) this.rotate(5);
    var delta = [this.x, this.y];
    this.drive();
    delta = [this.x - delta[0], this.y - delta[1]];
    this.move(-delta[0], -delta[1]);
    //if left edge free and moving left, or right edge free and moving right
    if((components.world.x < 0 && delta[0] < 0) || (components.world.x > canvas.width - components.world.w && delta[0] > 0)) {
        //if playerX >= w/2 and moving right, or playerX <= W/2 and moving
            components.world.translate(-delta[0], 0);
    }
    if((components.world.y < 0 && delta[1] < 0) || (components.world.y > canvas.height - components.world.h && delta[1] > 0)) {
        //if(this.y > canvas.height/2 - 5 && this.y < canvas.height/2 + 5) {
            components.world.translate(0, -delta[1]);
    }
}
/*### Map ###*/
(function() {
    function World() {
        this.x = 0; this.y = 0;
        this.w = 0; this.h = 0;
        this.a; this.u;
        this.name = "";
        this.checkpoints = [];
        this.setDimensions = function(w, h) {
            this.w = w; this.h = h;
            this.a.width = w; this.a.height = h;
            this.u.width = w; this.u.height = h;
            this.a.tree = QUAD.init({
                x: 0, y: 0, w: w, h: h, maxChildren: 4
            });
            this.u.tree = QUAD.init({
                x: 0, y: 0, w: w, h: h, maxChildren: 4
            });
        };
        this.translate = function(x, y) {
            this.x += x;
            this.y += y;
            this.a.move(x, y);
            this.u.move(x, y);
        };
        this.addRoad = function(e) {
            addToBoth(e, this.a, this.a.tree);
        };
        this.addCP = function(e, above) {
            e.cpIndex = this.checkpoints.length;
            e.aboveGround = above;
            this.checkpoints.push(e);
            addToBoth(e, above? this.a : this.u, above? this.a.tree : this.u.tree);
        };
        this.translate = function(_x, _y) {
            this.x += _x;
            this.y += _y;
            this.a.move(_x, _y);
            this.u.move(_x, _y);
        };
        this.render = function() {
            var p = [];
            var all = this.a.tree.select({x:0,y:0,w:this.a.width,h:this.a.height},false);
            var waypoints = QUAD.init({x: 0, y: 0, w: this.w, h: this.h, maxChildren: 4});
            for(var i = 0; i < all.length; i++) {
                waypoints.insert(MapTools.randomDots(all[i], 5, 20));
            }
            MapTools.triangulate(waypoints);
            this.a.addChild(canvas.display.nodemap({
                x: 0, y: 0, fill: "red", points: waypoints.select({x:0,y:0,w:this.w,h:this.h}, false), edges: true
            }));
        }
    }
    function Waypoint(x, y) {
        this.x = x; this.y = y;
        this.w = 1; this.h = 1;
        this.neighbors = [];
    }
    window.MapTools = {
        parse : function(str) {
            /*
            name,w,h,time
            "road",x,y,lanes,'v'|'h',length
            "cp",x,y
            */
            var l = str.split("\n");
            var world = new World();
            world.a = components.city;
            world.u = components.under;
            var ln = l[0].split(",");
            world.name = ln[0];
            var o_x = canvas.width / 2, o_y = canvas.height / 2;
            world.setDimensions(parseInt(ln[1]) + 2*o_x, parseInt(ln[2]) + 2*o_y);
            for(var i = 1; i < l.length; i++) {
                ln = l[i].split(",");
                if(ln[0] == "road") {
                    var lanes = parseInt(ln[3]);
                    world.addRoad(canvas.display.road({
                        x: parseInt(ln[1]) + o_x,
                        y: parseInt(ln[2]) + o_y,
                        lanes: parseInt(ln[3]),
                        width: ((ln[4] == 'v')? lanes * 20 : parseInt(ln[5])),
                        height: ((ln[4] == 'h')? lanes * 20 : parseInt(ln[5]))
                    }));
                }
                else if(ln[0] == "cp") {
                    world.addCP(createCheckpoint(parseInt(ln[1]) + o_x, parseInt(ln[2])) + o_y, ln[3] == "T");
                }
            }
            return world;
        },
        randomDots: function(rectangle, randomness, gap) {
            var waypoints = [];
            console.log(rectangle.w + ", " + rectangle.h);
            for(var i = 0; i <= rectangle.w / gap; i++) {
                for(var j = 0; j <= rectangle.h / gap; j++) {
                    waypoints.push(new Waypoint(rectangle.x+i*gap+rand(-randomness,randomness), rectangle.y+j*gap+rand(-randomness,randomness)));
                }
            }
            return waypoints;
        },
        triangulate: function(tree) {
            var nearby, radius = 5;
            tree.select({x:tree.root.x, y:tree.root.y, w:tree.root.w, h:tree.root.h}, function(wp) {
                do {
                    nearby = tree.select({
                        x: wp.x - radius,
                        y: wp.y - radius,
                        w: wp.w + 2*radius,
                        h: wp.h + 2*radius
                    }, false);
                    radius += 10;
                } while(nearby.length < 3);
                nearby.splice(nearby.indexOf(wp), 1);
                wp.neighbors[0] = nearby[0];
                wp.neighbors[1] = nearby[1];
                radius = 5;
            });
        }
    };
})();

/*### Terrain ###*/
function createCheckpoint(_x, _y) {
    var cp = canvas.display.ellipse({
        x: _x,
        y: _y,
        fill: 'radial-gradient(center, center, 60% width, #999, #6dd)',
        radius: 25,
        origin: {x: "center", y: "center"},
        controller: false
    });
    return cp;
}