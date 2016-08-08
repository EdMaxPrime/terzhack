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
                var speedNow = rand(this.maxSpeed + 1);
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
    components.city.move(-delta[0], -delta[1]);
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
            world.setDimensions(ln[1], ln[2]);
            for(var i = 1; i < l.length; i++) {
                ln = l[i].split(",");
                if(ln[0] == "road") {
                    var lanes = parseInt(ln[3]);
                    world.addRoad(canvas.display.road({
                        x: parseInt(ln[1]),
                        y: parseInt(ln[2]),
                        lanes: parseInt(ln[3]),
                        width: ((ln[4] == 'v')? lanes * 20 : parseInt(ln[5])),
                        height: ((ln[4] == 'h')? lanes * 20 : parseInt(ln[5]))
                    }));
                }
                else if(ln[0] == "cp") {
                    world.addCP(createCheckpoint(parseInt(ln[1]), parseInt(ln[2])), ln[3] == "T");
                }
            }
            return world;
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