class Particle {
    constructor(canvas, radius = 4, color = '#4facfe') {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.radius = radius;
        this.color = color;
        this.mass = radius;
    }

    update(a = 0) {
        this.x += this.vx;
        this.y += this.vy;

        // Wall collisions
        if (this.x - this.radius < 0) {
            this.vx = Math.abs(this.vx);
            this.x = this.radius;
        } else if (this.x + this.radius > this.canvas.width) {
            this.vx = -Math.abs(this.vx);
            this.x = this.canvas.width - this.radius;
        }

        if (this.y - this.radius < 0) {
            this.vy = Math.abs(this.vy);
            this.y = this.radius;
        } else if (this.y + this.radius > this.canvas.height) {
            this.vy = -Math.abs(this.vy);
            this.y = this.canvas.height - this.radius;
        }
    }

    resolveCollision(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = this.radius + other.radius;

        if (distance < minDistance) {
            // Position correction to prevent sticking
            const overlap = minDistance - distance;
            const nx = dx / distance;
            const ny = dy / distance;
            
            this.x -= nx * overlap / 2;
            this.y -= ny * overlap / 2;
            other.x += nx * overlap / 2;
            other.y += ny * overlap / 2;

            // Normal velocity
            const v1n = this.vx * nx + this.vy * ny;
            const v2n = other.vx * nx + other.vy * ny;

            // Swap normal velocities (elastic collision with equal mass assumed for simplicity)
            const v1n_new = v2n;
            const v2n_new = v1n;

            // Update velocities
            this.vx += (v1n_new - v1n) * nx;
            this.vy += (v1n_new - v1n) * ny;
            other.vx += (v2n_new - v2n) * nx;
            other.vy += (v2n_new - v2n) * ny;
        }
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.closePath();
    }
}

// 2. Volume Correction Sim
function initVolumeSim() {
    const canvas = document.getElementById('volume-canvas');
    const slider = document.getElementById('b-slider');
    if (!canvas || !slider) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let particles = Array.from({ length: 20 }, () => new Particle(canvas, parseInt(slider.value), '#4facfe'));

    slider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        particles.forEach(p => p.radius = val);
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                particles[i].resolveCollision(particles[j]);
            }
            particles[i].update();
            particles[i].draw();
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// 3. Pressure Correction Sim (Attraction)
function initPressureSim() {
    const canvas = document.getElementById('pressure-canvas');
    const slider = document.getElementById('a-slider');
    if (!canvas || !slider) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let particles = Array.from({ length: 15 }, () => new Particle(canvas, 6, '#ff4d6d'));

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const attraction = parseFloat(slider.value) / 1000;

        particles.forEach((p, i) => {
            particles.forEach((other, j) => {
                if (i === j) return;
                const dx = other.x - p.x;
                const dy = other.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    // Draw attraction lines
                    ctx.strokeStyle = `rgba(255, 77, 109, ${1 - dist / 100})`;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.stroke();

                    // Apply slight force
                    p.vx += (dx / dist) * attraction;
                    p.vy += (dy / dist) * attraction;
                }
            });

            // Wall interaction visual
            if (p.x < 30 || p.x > canvas.width - 30 || p.y < 30 || p.y > canvas.height - 30) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius + 5, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.stroke();
            }

            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}


// 5. Hero Background
function initHeroParticles() {
    const canvas = document.createElement('canvas');
    const container = document.getElementById('hero-particles');
    if (!container) return;
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const particles = Array.from({ length: 50 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
    }));

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(79, 172, 254, ${p.opacity})`;
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// 6. Scroll Reveal
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section .container').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'all 1s ease-out';
        observer.observe(el);
    });

    // Custom CSS for revealed state
    const style = document.createElement('style');
    style.innerHTML = '.visible { opacity: 1 !important; transform: translateY(0) !important; }';
    document.head.appendChild(style);
}

// Init everything
window.addEventListener('load', () => {
    initHeroParticles();
    initVolumeSim();
    initPressureSim();
    initScrollReveal();

    // Smooth scroll for nav links
    document.querySelectorAll('#main-nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            window.scrollTo({
                top: target.offsetTop - 70,
                behavior: 'smooth'
            });
        });
    });
});
