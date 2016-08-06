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