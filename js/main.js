var canvas;
var tree;
var keyBind;
var p = {gas: false, left: false, right: false};

oCanvas.domReady(function() {
    canvas = oCanvas.create({
        canvas : "#canvas",
        background : "#ffffff",
        clearEachFrame : true,
        fps : 30
    });
    canvas.width = 600;
    canvas.height = 400;
    init();
});

function init() {
    tree = QUAD.init({
        x: 0,
        y: 0,
        w: 600,
        h: 400
    });
    keyBind = {pause:' ', fwd: ['w','W'], turnR: ['d','D'], turnL: ['a','A']};
    createScenes();
    canvas.scenes.load("play", true);
    canvas.setLoop(update);
    canvas.timeline.start();
}

function update(ctx) {
    if(canvas.scenes.current == "play") {
        //update logic
        components.player.updateCar();
    }
}

function pause() {
    if(canvas.scenes.current == "pause")
        canvas.scenes.load("play", true);
    else 
        canvas.scenes.load("pause", false);
}

/*
Where n is a number
rand(true)   returns 1 or -1
rand(false)  returns true or false
rand(n)      returns a random integer from [0,n)
rand(n1, n2) returns a random integer from [n1,n2)
*/
function rand(min, max) {
    if(arguments[0] == true) {
        return rand(0, 2) == 0? 1 : -1;
    }
    if(arguments[0] == false) {
        return (rand(0, 2) == 0);
    }
    if(arguments.length == 1) {max = min; min = 0;}
    return min + parseInt(Math.random() * (max - min));
}

function subArray(array, start, end) {
    var r = [];
    for(var i = start; i < end; i++) {
        r.push(array[i]);
    }
    return r;
}

/*
Given an array of data and an array of things to
look for, returns the first occurence of an item
in haystack from needle, or -1 if not found.
*/
function findFirst(haystack, needle) {
    var lowest = haystack.length;
    var n;
    for(var i = 0; i < needle.length; i++) {
        n = haystack.indexOf(needle[i]);
        if(n < lowest && n != -1) lowest = n;
    }
    return (lowest == haystack.length)? -1 : lowest;
}

/*
Loops through each element in the array. If
callback is a function, it will be passed the
index and element. If callback is an array,
every event element should be a string and
the odd ones should be properties of each element.
*/
function foreach(array, callback, instance) {
    if(typeof callback == "function") {
        for(var i = 0; i < array.length; i++) {
            callback.call(instance, i, array[i]);
        }
    }
    else if(callback == "print") {
        foreach(array, function(index, elem) {
            console.log(elem);
        });
    }
    else {
        foreach(array, function(index, elem) {
            var str = callback[0];
            for(var i = 1; i < callback.length; i++) {
                if(i % 2 == 0) str += callback[i].replace("#I#", '' + index);
                else str += elem[callback[i]];
            }
        });
    }
}