window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d", {
    willReadFrequently:true
  });
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  class Particle {
    constructor(effect, x, y, color) {
      this.effect = effect
      this.color = color
      this.x = Math.random() * this.effect.canvasWidth
      this.y = this.effect.canvasHeight
      this.originX = x
      this.originY = y
      this.size = this.effect.gap 
      this.dx = 0
      this.dy = 0
      this.vx = 0
      this.vy = 0
      this.force = 0
      this.distance = 0
      // this.friction = Math.random() * 0.6 + 0.15
      // this.ease = Math.random() * 0.1 + 0.005
      this.friction = 0.5
      this.ease = 0.1
    }
    draw() {
      this.dx = this.effect.mouse.x - this.x
      this.dy = this.effect.mouse.y - this.y
      this.distance = this.dx * this.dx + this.dy * this.dy
      this.force = -this.effect.mouse.radius / this.distance

      if (this.distance < this.effect.mouse.radius) {
        this.angle = Math.atan2(this.dy, this.dx)
        this.vx += this.force * Math.cos(this.angle)
        this.vy += this.force * Math.sin(this.angle)
      }

      this.effect.context.fillStyle = this.color
      this.effect.context.fillRect(this.x, this.y, this.size, this.size)
    }
    update() {
      this.vx *= this.friction
      this.vy *= this.friction
      this.x += this.vx + (this.originX - this.x) * this.ease 
      this.y += this.vy + (this.originY - this.y) * this.ease
    }
  }

  class Effect {
    constructor(context, canvasWidth, canvasHeight) {
      this.context = context;
      this.canvasWidth = canvasWidth;
      this.canvasHeight = canvasHeight;
      this.textX = this.canvasWidth / 2;
      this.textY = this.canvasHeight / 2;
      this.fontSize = 100;
      this.offset = 10
      this.maxTextWidth = this.canvasWidth * 0.8;
      this.lineHeight = this.fontSize * 0.9;
      this.textInput = document.getElementById("textInput");
      this.textInput.addEventListener("keyup", (e) => {
        if (e.key !== " ") {
          this.context.clearRect(0,0,this.canvasWidth, this.canvasHeight)
          this.wrapText(this.textInput.value);
        }
      });

      this.particles = [] 
      this.gap = 3
      this.mouse = {
        radius:20000,
        x:0,
        y:0
      }
      window.addEventListener('mousemove', (e) =>{
        this.mouse.x = e.x
        this.mouse.y = e.y
      })
    }
    wrapText(text) {
      const gradient = ctx.createLinearGradient(
        0,
        0,
        this.canvasWidth,
        this.canvasHeight
      );
      gradient.addColorStop(0.3, "red");
      gradient.addColorStop(0.5, "fuchsia");
      gradient.addColorStop(0.7, "purple");
      this.context.fillStyle = gradient;
      this.context.font = `${this.fontSize}px Helvetica`;
      this.context.textAlign = "center";
      this.context.textBaseline = "middle";
      this.context.strokeStyle = "white";
      this.context.lineWidth = 3;

      let linesArray = [];
      let words = text.split(" ");
      let lineCounter = 0;
      let line = "";
      for (let i = 0; i < words.length; i++) {
        let testLine = line + words[i] + " ";
        if (this.context.measureText(testLine).width > this.maxTextWidth) {
          line = words[i] + " ";
          lineCounter++;
        } else {
          line = testLine;
        }
        linesArray[lineCounter] = line;
      }
      let textHeight = this.lineHeight * lineCounter;
      this.textY = this.canvasHeight / 2 - textHeight / 2;
      linesArray.forEach((line, i) => {
        this.context.fillText(
          line,
          this.textX,
          this.textY + this.lineHeight * i
        );
        this.context.strokeText(
          line,
          this.textX+this.offset,
          this.textY + this.lineHeight * i
        );
      });
      this.convertToParticles()
    }
    convertToParticles() {
      this.particles = []
      const pixels = this.context.getImageData(0,0,this.canvasWidth, this.canvasHeight).data
      this.context.clearRect(0,0, this.canvasWidth, this.canvasHeight)
      for (let y = 0 ; y< this.canvasHeight; y+=this.gap){
        for (let x = 0; x< this.canvasWidth;x+=this.gap){
          const index = (y * this.canvasWidth + x) * 4
          const alpha = pixels[index + 3]
          if (alpha > 0) {
            const red = pixels[index]
            const green = pixels[index+1]
            const blue = pixels[index+2]
            const color = `rgb(${red}, ${green}, ${blue})`
            this.particles.push(new Particle(this, x, y, color))
          }
        }
      }
    }
    render() {
      this.particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })
    }

    resize(width, height) {
      this.canvasWidth = width;
      this.canvasHeight = height;

      this.textX = this.canvasWidth / 2;
      this.textY = this.canvasHeight / 2;

      this.maxTextWidth = this.canvasWidth * 0.8;
    }
  }

  const effect = new Effect(ctx, canvas.width, canvas.height);
  effect.wrapText(effect.textInput.placeholder);
  function animate() {
    ctx.clearRect(0,0, canvas.width, canvas.height)
    effect.render()

    requestAnimationFrame(animate)
  }

  animate()

  window.addEventListener('resize' , function(e) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    effect.resize(canvas.width, canvas.height)
    effect.wrapText(effect.textInput.placeholder);
  })
});
