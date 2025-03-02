class CelestialBody {
    constructor(radius, distance, color, speed, name) {
      this.radius = radius;
      this.distance = distance;
      this.color = color;
      this.speed = speed;
      this.name = name;
      this.angle = Math.random() * Math.PI * 2;
      this.moons = [];
    }
  
    addMoon(radius, distance, color, speed) {
      this.moons.push(new CelestialBody(radius, distance, color, speed, 'moon'));
      return this;
    }
  
    update(speedMultiplier) {
      this.angle += this.speed * speedMultiplier;
      this.moons.forEach(moon => moon.update(speedMultiplier));
    }
  
    draw(ctx, x, y, scale) {
      const posX = x + Math.cos(this.angle) * this.distance * scale;
      const posY = y + Math.sin(this.angle) * this.distance * scale;
  
      // Draw orbit
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.arc(x, y, this.distance * scale, 0, Math.PI * 2);
      ctx.stroke();
  
      // Draw planet
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(posX, posY, this.radius * scale, 0, Math.PI * 2);
      ctx.fill();
  
      // Draw moons
      this.moons.forEach(moon => {
        moon.draw(ctx, posX, posY, scale);
      });
  
      return { x: posX, y: posY };
    }
  }
  
  class SolarSystem {
    constructor() {
      this.canvas = document.getElementById('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.celestialBodies = [];
      this.stars = [];
      this.rotation = { x: 0, y: 0 };
      this.isDragging = false;
      this.lastMousePos = { x: 0, y: 0 };
      this.scale = 1;
      this.speedMultiplier = 1;
  
      this.setupControls();
      this.createStars();
      this.createPlanets();
      this.resize();
      this.animate();
  
      window.addEventListener('resize', () => this.resize());
    }
  
    setupControls() {
      // Mouse controls
      this.canvas.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
      });
  
      window.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        const deltaX = e.clientX - this.lastMousePos.x;
        const deltaY = e.clientY - this.lastMousePos.y;
        
        this.rotation.x += deltaY * 0.005;
        this.rotation.y += deltaX * 0.005;
        
        this.lastMousePos = { x: e.clientX, y: e.clientY };
      });
  
      window.addEventListener('mouseup', () => {
        this.isDragging = false;
      });
  
      // Zoom control
      window.addEventListener('wheel', (e) => {
        this.scale = Math.max(0.5, Math.min(2, this.scale - e.deltaY * 0.001));
        document.getElementById('zoom').value = this.scale;
      });
  
      // UI Controls
      document.getElementById('speed').addEventListener('input', (e) => {
        this.speedMultiplier = parseFloat(e.target.value);
      });
  
      document.getElementById('zoom').addEventListener('input', (e) => {
        this.scale = parseFloat(e.target.value);
      });
    }
  
    createStars() {
      for (let i = 0; i < 1000; i++) {
        this.stars.push({
          x: Math.random() * 2000 - 1000,
          y: Math.random() * 2000 - 1000,
          z: Math.random() * 2000 - 1000,
          size: Math.random() * 2
        });
      }
    }
  
    createPlanets() {
      // Sun
      this.sun = new CelestialBody(30, 0, '#FFD700', 0, 'Sun');
  
      // Planets
      this.celestialBodies = [
        new CelestialBody(10, 80, '#E27B58', 0.02, 'Mercury'),
        new CelestialBody(15, 120, '#C68B59', 0.015, 'Venus')
          .addMoon(3, 20, '#888', 0.04),
        new CelestialBody(16, 170, '#4B6EA8', 0.01, 'Earth')
          .addMoon(4, 25, '#888', 0.03),
        new CelestialBody(14, 220, '#C1440E', 0.008, 'Mars')
          .addMoon(3, 20, '#888', 0.04),
        new CelestialBody(25, 300, '#C88B3A', 0.005, 'Jupiter')
          .addMoon(4, 35, '#888', 0.03)
          .addMoon(3, 45, '#999', 0.02),
        new CelestialBody(22, 380, '#C5AB6E', 0.004, 'Saturn')
          .addMoon(4, 40, '#888', 0.03),
        new CelestialBody(18, 440, '#82B3D1', 0.003, 'Uranus')
          .addMoon(3, 30, '#888', 0.04),
        new CelestialBody(18, 500, '#3E54E8', 0.002, 'Neptune')
          .addMoon(3, 35, '#888', 0.03)
      ];
    }
  
    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  
    drawStars() {
      this.ctx.fillStyle = '#FFF';
      this.stars.forEach(star => {
        // Apply rotation
        let x = star.x;
        let y = star.y * Math.cos(this.rotation.x) - star.z * Math.sin(this.rotation.x);
        let z = star.y * Math.sin(this.rotation.x) + star.z * Math.cos(this.rotation.x);
        
        x = x * Math.cos(this.rotation.y) + z * Math.sin(this.rotation.y);
        z = -x * Math.sin(this.rotation.y) + z * Math.cos(this.rotation.y);
  
        // Project to 2D
        const scale = 1000 / (1000 + z);
        const projectedX = x * scale + this.canvas.width / 2;
        const projectedY = y * scale + this.canvas.height / 2;
  
        if (projectedX >= 0 && projectedX <= this.canvas.width &&
            projectedY >= 0 && projectedY <= this.canvas.height) {
          this.ctx.globalAlpha = Math.min(1, (1000 + z) / 1000);
          this.ctx.fillRect(
            projectedX,
            projectedY,
            star.size * scale,
            star.size * scale
          );
        }
      });
      this.ctx.globalAlpha = 1;
    }
  
    animate() {
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  
      // Draw stars
      this.drawStars();
  
      // Update and draw planets
      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;
  
      // Draw sun
      this.ctx.beginPath();
      this.ctx.fillStyle = this.sun.color;
      this.ctx.arc(centerX, centerY, this.sun.radius * this.scale, 0, Math.PI * 2);
      this.ctx.fill();
  
      // Add sun glow
      const gradient = this.ctx.createRadialGradient(
        centerX, centerY, this.sun.radius * this.scale,
        centerX, centerY, this.sun.radius * this.scale * 2
      );
      gradient.addColorStop(0, 'rgba(255, 215, 0, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, this.sun.radius * this.scale * 2, 0, Math.PI * 2);
      this.ctx.fill();
  
      // Update and draw planets
      this.celestialBodies.forEach(body => {
        body.update(this.speedMultiplier);
        body.draw(this.ctx, centerX, centerY, this.scale);
      });
  
      requestAnimationFrame(() => this.animate());
    }
  }
  
  // Initialize the solar system
  new SolarSystem();