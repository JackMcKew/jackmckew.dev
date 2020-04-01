var canvas = document.getElementById("mycanvas");
var ctx = canvas.getContext("2d");
var data = [];
var point_count = 100;
for (var i = 0; i < point_count; i++) {
  var obj = {
    radius: 5,
    angle: Math.random() * 360
  };
  obj.speed = 2;
  if (i == 0) {
    obj.colour = "red";
  } else {
    obj.colour = "blue";
  }
  obj.pos = [
    Math.random() * canvas.width - obj.radius,
    Math.random() * canvas.height - obj.radius
  ];
  data.push(obj);
}

function DrawMe() {
  ctx.clearRect(0, 0, 400, 300);

  for (var i = 0; i < data.length; i++) {
    var ball = data[i];
    if (ball.pos[0] > canvas.width - ball.radius || ball.pos[0] < ball.radius)
      ball.angle += 180;
    if (ball.pos[1] > canvas.height - ball.radius || ball.pos[1] < ball.radius)
      ball.angle += 180;

    ball.pos[0] += Math.cos(ball.angle) * ball.speed;
    ball.pos[1] += Math.sin(ball.angle) * ball.speed;

    ctx.beginPath();
    ctx.fillStyle = ball.colour;
    ctx.arc(ball.pos[0], ball.pos[1], ball.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
  }
}
setInterval(DrawMe, 10);
