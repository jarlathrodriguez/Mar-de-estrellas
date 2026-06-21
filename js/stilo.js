const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

let forming = false;
let redMode = false;
let colorProgress = 0;

//Estrellas aumentar o disminuir
const STAR_COUNT =
window.innerWidth < 400 ? 400 :
window.innerWidth < 600 ? 600 :
1500;

let stars = [];

//palabras
let words = [
  "HOLA ❤️",
  "TE QUIERO",
  "MI NIÑA",
  "PRECIOSA",
  "GRACIAS",
  "POR EXISTIR",
  "ESPERO",
  "QUE TE GUSTE",
  "ESTA CANCION",
  "Y QUE TENGAS",
  "UN HERMOSO",
  "DIA",
  "❤️"
];

let wordIndex = 0;

let mouse = {x:-1000,y:-1000};

document.addEventListener("mousemove",e=>{
  mouse.x=e.clientX;
  mouse.y=e.clientY;
});

document.addEventListener("touchmove",e=>{

  const touch = e.touches[0];
  mouse.x = touch.clientX;
  mouse.y = touch.clientY;

});


class Star{
  constructor(){
    this.reset();
    this.tx=this.x;
    this.ty=this.y;
  }

  reset(){
    this.x=Math.random()*canvas.width;
    this.y=Math.random()*canvas.height;
    this.radius=Math.random()*1.5+0.3;
    this.speed=Math.random()*1.5+0.8;
    this.alpha=Math.random();
    this.wave=Math.random()*Math.PI*2;
    this.vx=0;
    this.vy=0;
  }

  update(){
    this.y-= this.speed;
    this.wave+=0.02;
    this.x+=Math.sin(this.wave)*0.5;

    if(forming){
      this.vx+=(this.tx-this.x)*0.03;
      this.vy+=(this.ty-this.y)*0.03;
    }

    let dx=this.x-mouse.x;
    let dy=this.y-mouse.y;
    let dist=Math.sqrt(dx*dx+dy*dy);

    if(dist<80){
      this.vx+=dx*0.02;
      this.vy+=dy*0.02;
    }

    this.x+=this.vx;
    this.y+=this.vy;

    this.vx*=0.9;
    this.vy*=0.9;

    if(redMode && colorProgress<1) colorProgress+=0.02;
    if(!redMode && colorProgress>0) colorProgress-=0.02;

    this.alpha=0.8+Math.sin(this.wave)*0.2; //brillo

    if(this.y<0){
      this.y=canvas.height;
      this.x=Math.random()*canvas.width;
    }
  }

  draw(){
    ctx.beginPath();
    ctx.shadowBlur=40;//brillo

    let r=255;
    let g=255-(205*colorProgress);
    let b=255-(205*colorProgress);

    ctx.shadowColor=`rgb(${r},${g},${b})`;
    ctx.fillStyle=`rgba(${r},${g},${b},${this.alpha})`;

    ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
    ctx.fill();
  }
}

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    createStars();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function createStars(){
  stars=[];
  for(let i=0;i<STAR_COUNT;i++){
    stars.push(new Star());
  }
}

//texto
function getTextPoints(text){
  let off=document.createElement("canvas");
  off.width = window.innerWidth;
  off.height = window.innerHeight;
  let octx = off.getContext("2d");

  let fontSize;
  if (window.innerWidth < 400) fontSize = 35;
  else if (window.innerWidth < 768) fontSize = 50;
  else if (window.innerWidth < 1200) fontSize = 90;
  else fontSize = Math.min(window.innerWidth * 0.12, 120);

  octx.fillStyle = "white";
  octx.font = "400 " + fontSize + "px Arial";
  octx.textAlign = "center";
  octx.fillText(text, window.innerWidth / 2, window.innerHeight / 2);

  let data=octx.getImageData(0,0,off.width,off.height).data;
  let points=[];

  for(let y=0;y<off.height;y+=4){
    for(let x=0;x<off.width;x+=4){
      if(data[(y*off.width+x)*4+3]>150){
        points.push({x,y});
      }
    }
  }
  return points;
}

function formWord(text){
  let points=getTextPoints(text);
  stars.forEach((star,i)=>{
    let p=points[i%points.length];
    star.tx=p.x;
    star.ty=p.y;
  });
}
//corazon
function formHeart(){
  let points = [];
  let scale = window.innerWidth < 400 ? 6 : window.innerWidth < 600 ? 8 : 15;
  let centerX = window.innerWidth / 2;
  let centerY = window.innerHeight / 2;

  for (let t = 0; t < Math.PI*2; t += 0.02) {
    let x = 16 * Math.pow(Math.sin(t),3);
    let y = -(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t));
    points.push({x:centerX+x*scale, y:centerY+y*scale});
  }

  stars.forEach((star,i)=>{
    let p=points[i%points.length];
    star.tx=p.x;
    star.ty=p.y;
  });
}

function showWords(){
  if(wordIndex<words.length){
    formWord(words[wordIndex]);
    wordIndex++;
    setTimeout(showWords,5000); //tiempo de las palabras 
    
  }else{
    formHeart();
    setTimeout(()=>{
      forming=false;
      redMode=false;
    },4000);
  }
}

document.getElementById("startBtn").onclick=()=>{
  forming=true;
  redMode=true;
  wordIndex=0;

  document.getElementById("startBtn").style.display="none";
  document.getElementById("music").play();

  showWords();
};

function animate(){
  ctx.fillStyle="rgba(0,0,0,0.3)";
  ctx.clearRect(0,0,canvas.width,canvas.height);

  stars.forEach(star=>{
    star.update();
    star.draw();
  });

  requestAnimationFrame(animate);
}

createStars();
animate();