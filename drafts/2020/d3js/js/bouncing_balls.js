var width = window.innerWidth, height = window.innerHeight;

var variables = {
    radius: 15,
    distance: 10
}

var extents = {
    radius: [3, 50],
    distance: [0, 40]
}

var min = 2, max = 100;

$("#sliders input").each(function(slider_index, slider){
    var this_var = $(this).attr("data-variable");
    var extent = extents[this_var];
    $(this).attr("value", variables[this_var]).attr("min", extent[0]).attr("max", extent[1]);
}).on("change input", function(){
    variables[$(this).attr("data-variable")] = $(this).val();
});

var data = [];

var point_count = 20;

var svg = d3.select("#canvas").append("svg").attr("width", width).attr("height", height);

for (var i = 0; i < point_count; i++){
    data.push({
        id: jz.str.randomString(),
        x: jz.num.randBetween(0, width),
        y: jz.num.randBetween(0, height),
        slope: jz.num.randBetween(1, 20) / 10,
        x_dir: [-1, 1][jz.num.randBetween(0, 1)],
        y_dir: [-1, 1][jz.num.randBetween(0, 1)]
    });
}

redraw(data);

d3.interval(function(){ redraw(update(data)); }, 30)

function redraw(data){
    var circle = svg.selectAll("circle")
            .data(data, function(d){ return d.id; })
        
    circle
            .attr("r", variables.radius)
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; });

    circle.enter().append("circle")
            .attr("r", variables.radius)
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; });			
}

function update(data){
    data.forEach(function(d){
        return calcPointB(d, variables.distance, d.slope);
    });
    return data;
}

// given a point, p, and a distance, d, and a slope, m, return x and y
// formula from http://www.geeksforgeeks.org/find-points-at-a-given-distance-on-a-line-of-given-slope/
function calcPointB(p, d, m){

    p.x_dir = getDir(p.x, p.x_dir, width);

    p.y_dir = getDir(p.y, p.y_dir, height);

    function getDir(coord, dir, dimension){
        return  Math.floor(coord) <= variables.radius ? 1 :
                        Math.ceil(coord) >= dimension - variables.radius ? -1 :
                        dir;
    }
    
    p.x = p.x + (d * Math.sqrt(1 / (1 + Math.pow(m, 2))) * p.x_dir);
    p.y = p.y + (m * d * Math.sqrt(1 / (1 + Math.pow(m, 2))) * p.y_dir);

    return p;
