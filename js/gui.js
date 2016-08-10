var components = {
    home : {},
    edit : {}
};

var cloneables;

function createGenerics() {
    cloneables = {
        button : {
            body : canvas.display.rectangle({
                x : 0,
                y : 0,
                width : canvas.width / 5,
                height : canvas.height / 10,
                origin : {x: "center", y: "top"},
                fill : "#EBA938"
            }),
            text : canvas.display.text({
                x : 0,
                y : 0,
                origin : {x: "center", y: "center"},
                font: "20px sans-serif",
                text : "",
                fill : "#ffffff"
            })
        },
        text : {
            title : canvas.display.text({
                x : canvas.width / 2,
                y : canvas.height / 10,
                origin : {x : "center", y : "top"},
                font : "bold 30px sans-serif",
                text : "Text",
                fill: "#000000"
            })
        }
    };
    canvas.display.register("road", {
        shapeType: "rectangular",
        lanes: 0
    }, function(ctx) {
        var origin = this.getOrigin();
        var x = this.abs_x - origin.x, y = this.abs_y - origin.x, xStart, yStart, xEnd, yEnd;
        if(this.width > this.height) {xStart = x; xEnd = x + this.width; yStart = y + this.height/2; yEnd = yStart;}
        else {xStart = x + this.width/2; xEnd = xStart; yStart = y; yEnd = y + this.height;}
        ctx.beginPath();
        ctx.fillStyle = "rgb(180,180,180)";
        ctx.fillRect(x, y, this.width, this.height);
        if(this.lanes > 1) {
            ctx.strokeStyle = "#fff";
            ctx.setLineDash([16, 16]);
            ctx.lineWidth = 5;
            ctx.moveTo(xStart, yStart);
            ctx.lineTo(xEnd, yEnd);
            ctx.stroke();
        }
        ctx.closePath();
    });
    canvas.display.register("nodemap", {
        shapeType: "rectangular",
        points: [],
        edges: false
    }, function(ctx) {
        var origin = this.getOrigin();
        var x = this.abs_x - origin.x, y = this.abs_y - origin.y;
        ctx.beginPath();
        ctx.fillStyle = this.fill;
        ctx.strokeStyle = "black";
        for(var i = 0; i < this.points.length; i++) {
            ctx.fillRect(x + this.points[i].x, y + this.points[i].y, 1, 1);
            if(4 < 5) {
                ctx.moveTo(this.points[i].x, this.points[i].y);
                ctx.lineTo(this.points[i].neighbors[0].x, this.points[i].neighbors[0].y);
                ctx.moveTo(this.points[i].x, this.points[i].y);
                ctx.lineTo(this.points[i].neighbors[1].x, this.points[i].neighbors[1].y);
            }
        }
        ctx.stroke();
        ctx.closePath();
    });
}

function createScenes() {
    var w = canvas.width;
    var h = canvas.height;
    createGenerics();
    canvas.scenes.create("play", function() {
        components.under = canvas.display.rectangle({
            x: 0,
            y: 0,
            width: w,
            height: h,
            fill: "#D4A190"
        });
        components.under.tree = QUAD.init({
            x: 0, y: 0, w: w, h: h, maxChildren: 4
        });
        this.add(components.under);
        components.city = canvas.display.rectangle({
            x: 0,
            y: 0,
            width: w,
            height: h,
            fill: "#A1D490"
        });
        components.city.tree = QUAD.init({
            x: 0, y: 0, w: w, h: h, maxChildren: 4
        });
        this.add(components.city);
        components.world = MapTools.parse("Policebox,"+2*w+","+2*h+",day\nroad,0,"+h/3+",2,h,"+w+"\nroad,50,"+h/3+",2,v,"+h);
        components.player = createCar(w/2, h/2, '#2a2', playerLogic, 5);
        this.add(components.player);
        components.world.render();
    });
    canvas.scenes.create("pause", function() {
        this.add(canvas.display.rectangle({
            x: w/4, y: h/8, width: w/2, height: 3*h/4, fill: "#fff"
        }));
        this.objects[0].addChild(createTitle("PAUSED", w/4, h/4));
        this.objects[0].addChild(createButton("Resume", w/4, h/2, pause));
    });
    canvas.bind("keyup", function(evt) {
        var key = fromKeyCode(evt.which, evt.shiftKey);
        if(key == keyBind.pause) {pause();}
        if(keyBind.fwd.indexOf(key) != -1) p.gas = false;
        if(keyBind.turnL.indexOf(key) != -1) p.left = false;
        if(keyBind.turnR.indexOf(key) != -1) p.right = false;
    });
    canvas.bind("keydown", function(evt) {
        var key = fromKeyCode(evt.which, evt.shiftKey);
        if(keyBind.fwd.indexOf(key) != -1) p.gas = true;
        if(keyBind.turnL.indexOf(key) != -1) p.left = true;
        if(keyBind.turnR.indexOf(key) != -1) p.right = true;
    });
    /*canvas.scenes.create("example", function() {
        components.play = {};
        components.play.tree = QUAD.init({
            x: 5,
            y: h / 8,
            w: 6 * BRICK_WIDTH,
            h: 9 * BRICK_HEIGHT,
            maxChildren: 4
        });
        components.play.area = canvas.display.rectangle({
            x: 5,
            y: h / 8,
            width: w - 10,
            height: (3 * h / 4),
            fill: "white",
            stroke: "5px black"
        });
        this.add(components.play.area);
        components.play.template = "Score: _SCORE\nRecord: _RECORD";
        components.play.score = canvas.display.text({
            x: BRICK_WIDTH,
            y: h / 16,
            origin: {x: "left", y: "center"},
            fill: "black",
            text: components.play.template.replace("_SCORE", 0).replace("_RECORD", 0),
            font: "20px sans-serif",
            lineHeight: "25px"
        });
        this.add(components.play.score);
        components.debug = canvas.display.text({
            x: 200,
            y: h - (h / 16),
            fill: "black",
            text: "",
            font: "20px sans-serif"
        });
        this.add(components.debug);
        components.play.effects = [canvas.display.sprite({
            x: BRICK_WIDTH * 3,
            y: h / 16,
            image: "effects.png",
            generate: true,
            width: 64,
            height: 64,
            direction: "x",
            frame: 2,
            opacity: 0,
            origin: {x: "left", y: "center"}
        })];
        this.add(components.play.effects[0]);
        for(var i = 1; i < 4; i++) {
            components.play.effects[i] = components.play.effects[0].clone({
                x: (BRICK_WIDTH * 3) + (i * 64),
                frame: i + 2
            });
            this.add(components.play.effects[i]);
        }
        this.add(createButton(canvas.display.sprite({
                frames: [{
                    x: 0,
                    y: 64,
                    w: 64,
                    h: 64
                }],
                image: "effects.png",
                frame: 1,
                opacity: 1
            }), 33, 0, function() {
                if(components.play.menu.x == 0)
                    components.play.menu.animate({x: -components.play.menu.width}, {duration: "short"});
                else
                    components.play.menu.animate({x: 0}, {duration: "short"});
            }, {
                width: 64,
                height: 64,
                fill: ["#56B6D6", "#62CCF0", "#4A9AB5"]
            })
        );
        //"radial-gradient(center, center, 50% width, #D4A3AC, #C4D4A5, #A3D4CB, #B3A3D4)"
        components.play.menu = canvas.display.rectangle({x: -w, y: h / 8, width: w, height: 3 * h / 4, fill: "linear-gradient(45deg, rgb(255,200,200), rgb(230,100,100), rgb(100,150,255), rgb(150,255,100), rgb(255,165,0))"});
        components.play.menu.addChild(createButton("How to Play", w/2, 2*BRICK_HEIGHT, function() {
            canvas.scenes.load("help/1", true);
        }, {width: 2 * BRICK_WIDTH, height: BRICK_HEIGHT, fill: ["#56B6D6", "#62CCF0", "#4A9AB5"]}));
        components.play.menu.addChild(createButton("Credits", w/2, 4*BRICK_HEIGHT, function() {
            canvas.scenes.load("credits", true);
        }, {width: 2 * BRICK_WIDTH, height: BRICK_HEIGHT, fill: ["#56B6D6", "#62CCF0", "#4A9AB5"]}));
        components.play.menu.addChild(createButton("Sounds: on", w/2, 6*BRICK_HEIGHT, function() {
            f.SOUND = !f.SOUND;
            this.children[0].text = "Sounds: " + (f.SOUND? "on" : "off");
        }, {width: 2 * BRICK_WIDTH, height: BRICK_HEIGHT, fill: ["#56B6D6", "#62CCF0", "#4A9AB5"]}));
        this.add(components.play.menu);
        newGame();
    });
    canvas.bind("keyup", function(evt) {
        if(fromKeyCode(evt.which, evt.shiftKey) == 'r') {
            cycle();
        }
    });
    canvas.scenes.create("game-over", function() {
        this.add(createTitle("Game Over", w / 2, h / 8));
        components.finalScore = canvas.display.text({
            x: w / 2,
            y: h / 4,
            text: "Score: _S\nRecord: _R",
            fill: "black",
            font: "24px sans-serif",
            align: "left",
            origin: {x: "center", y: "top"},
            lineHeight: 2
        });
        this.add(components.finalScore);
        this.add(createButton("Play Again", w / 2, 3 * h / 5, function() {
            newGame(); 
            canvas.scenes.load("play", true);
            canvas.redraw();
        }, {
            width: 2 * BRICK_WIDTH,
            fill: ["#56B6D6", "#62CCF0", "#4A9AB5"]
        }));
    });
    canvas.scenes.create("help/1", function () {
        this.add(createTitle("Instructions", w/2, h/16));
    });*/
}

function createButton(_text, _x, _y, callback, options) {
    options = options || {};
    options.width = options.width || cloneables.button.body.width;
    options.height = options.height || cloneables.button.body.height;
    options.fill = options.fill || [cloneables.button.body.fill, "#F0B859", "#CC9433"];
    var button = cloneables.button.body.clone({
        x : _x,
        y : _y,
        width : options.width,
        height : options.height,
        fill : options.fill[0]
    });
    var label;
    if(typeof _text == "string") {
        label = cloneables.button.text.clone({
            text : _text,
            x : 0,
            y : button.height / 2
        });
    } else {
        label = _text;
        label.x = -button.width / 2;
        label.y = 0;
        label.origin = {x: "left", y: "center"};
    }
    button.bind("click tap", callback);
    button.bind("mouseenter touchenter", function() {
        this.fill = options.fill[1];
        canvas.redraw();
    });
    button.bind("mousedown touchstart", function() {
        this.fill = options.fill[2];
        canvas.redraw();
    });
    button.bind("mouseleave touchleave mouseup touchend", function() {
        this.fill = options.fill[0];
        canvas.redraw();
    });
    button.addChild(label);
    return button;
}

function createTitle(_text, _x, _y, options) {
    options = options || {};
    options.fill = options.fill || "#000000";
    options.origin = options.origin || {x: "center", y: "top"};
    options.font = options.font || "bold 30px sans-serif";
    return cloneables.text.title.clone({
        x : _x,
        y : _y,
        text : _text,
        font : options.font,
        origin : options.origin,
        fill : options.fill
    });
}

function addToBoth(obj, scene, tree) {
    if(Array.isArray(obj) == true) {
        for(var j = 0; j < obj.length; j++) {
            addToBoth(obj[j], scene, tree);
        }
    } else {
        var i;
        if(scene.hasOwnProperty("shapeType")) {scene.addChild(obj); i = scene.children.length - 1;}
        else {scene.add(obj); i = scene.objects.length - 1;}
        if(obj.shapeType == "radial") {
            tree.insert({
                x: obj.abs_x - obj.radius_x, 
                y: obj.abs_y - obj.radius_y, 
                w: 2 * obj.radius_x, 
                h: 2 * obj.radius_y, 
                model: obj, 
                index: i
            });
        }
        else {
            tree.insert({
                x: obj.abs_x,
                y: obj.abs_y,
                w: obj.width,
                h: obj.height,
                model: obj,
                index: i
            });
        }
    }
}