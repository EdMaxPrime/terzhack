var canvas;
var tree;
var keyBind;

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
    keyBind = {pause:' '};
    createScenes();
    canvas.scenes.load("play", true);
    canvas.setLoop(update);
    canvas.timeline.start();
}

function update(ctx) {
    if(canvas.scenes.current == "") {
        //update logic
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