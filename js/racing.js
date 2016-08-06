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
        move: function() {
            if(this.idle == false) {
                var speedNow = rand(this.maxSpeed + 1);
                this.x += speedNow * Math.cos(-1 * (this.rotation % 360) * Math.PI / 180);
                this.y += speedNow * Math.cos(-1 * (this.rotation % 360) * Math.PI / 180);
            }
        }
    });
    return car;
}