document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('animation-container');

    const getNavbarHeight = () => {
        return parseInt(getComputedStyle(document.documentElement)
            .getPropertyValue('--navbar-height'));
    };

    const staticBg = document.createElement('div');
    staticBg.className = 'static-background';
    container.appendChild(staticBg);

    const textContainer = document.createElement('div');
    textContainer.className = 'centered-text';
    textContainer.innerHTML = `
        <h1>Hello, I am David</h1>
        <p>I am a developer and data analyst</p>
    `;
    container.appendChild(textContainer);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    scrollIndicator.innerHTML = '↓ Scroll to explore';
    container.appendChild(scrollIndicator);
    container.appendChild(canvas);

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight - getNavbarHeight();

    const particles = [];
    const particleCount = 150;
    let mouseX = width / 2;
    let mouseY = height / 2;
    let mouseRadius = 100;
    let isMouseDown = false;

    class Shape {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = height + 100;
            this.size = Math.random() * 80 + 40; // Increased size: 40-120
            this.speedY = -(Math.random() * 0.5 + 0.2); // Slower upward speed
            this.speedX = Math.random() * 1 - 0.5; // Gentler horizontal movement
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.01;
            this.opacity = Math.random() * 0.3 + 0.2; // Increased minimum opacity
            this.type = Math.random() > 0.5 ? 'circle' : 'square';
            this.hue = Math.random() * 60 - 30; // Add slight color variation
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.rotation += this.rotationSpeed;

            // Reset if shape goes off screen
            if (this.y < -this.size) {
                this.reset();
            }

            // Bounce off walls
            if (this.x < -this.size || this.x > width + this.size) {
                this.speedX *= -1;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            // Create gradient for more visible edges
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size / 2);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity + 0.1})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, ${this.opacity})`);

            if (this.type === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity + 0.2})`;
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity + 0.2})`;
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    // Create array of shapes
    const shapes = [];
    const numberOfShapes = 20;
    for (let i = 0; i < numberOfShapes; i++) {
        shapes.push(new Shape());
    }

    // Modify the animate function to include shapes
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw and update shapes first (so they appear behind particles)
        shapes.forEach(shape => {
            shape.update();
            shape.draw();
        });

        // Draw and update particles
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        // Draw connections
        drawConnections();

        requestAnimationFrame(animate);
    }

    class Particle {
        constructor() {
            this.reset();
            // Random starting position
            this.x = Math.random() * width;
            this.y = Math.random() * height;
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 3 + 1;
            this.baseSize = this.size;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * 2 - 1;
            this.baseSpeedX = this.speedX;
            this.baseSpeedY = this.speedY;
            this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`;
            this.angle = Math.random() * Math.PI * 2;
        }

        update() {
            // Mouse interaction
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouseRadius) {
                if (isMouseDown) {
                    // Push particles away from mouse when clicked
                    const force = (mouseRadius - distance) / mouseRadius;
                    this.speedX -= (dx / distance) * force * 0.5;
                    this.speedY -= (dy / distance) * force * 0.5;
                } else {
                    // Attract particles to mouse when hovering
                    const force = (mouseRadius - distance) / mouseRadius;
                    this.speedX += (dx / distance) * force * 0.2;
                    this.speedY += (dy / distance) * force * 0.2;

                    // Increase size when near mouse
                    this.size = this.baseSize * (1 + force);
                }
            } else {
                // Return to normal size and speed when away from mouse
                this.size = this.baseSize;
                this.speedX = this.speedX * 0.98 + this.baseSpeedX * 0.02;
                this.speedY = this.speedY * 0.98 + this.baseSpeedY * 0.02;
            }

            // Update position
            this.x += this.speedX;
            this.y += this.speedY;

            // Boundary check
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function drawConnections() {
        particles.forEach((particle, i) => {
            for (let j = i + 1; j < particles.length; j++) {
                const other = particles[j];
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - distance / 100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.stroke();
                }
            }
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // First draw shapes
        shapes.forEach(shape => {
            shape.update();
            shape.draw();
        });

        // Then draw particles and connections
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        drawConnections();

        requestAnimationFrame(animate);
    }

    // Mouse event handlers
    container.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    container.addEventListener('mousedown', () => {
        isMouseDown = true;
        mouseRadius = 150; // Increase radius when mouse is down
    });

    container.addEventListener('mouseup', () => {
        isMouseDown = false;
        mouseRadius = 100; // Return to normal radius
    });

    container.addEventListener('mouseleave', () => {
        mouseX = width / 2;
        mouseY = height / 2;
        isMouseDown = false;
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight - getNavbarHeight();

        particles.forEach(particle => particle.reset());
        shapes.forEach(shape => shape.reset());
    });

    // Start animation
    animate();
});