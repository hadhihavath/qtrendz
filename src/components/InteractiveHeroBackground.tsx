import { useEffect, useRef } from "react";

export function InteractiveHeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle definition: product-related shapes drifting gently
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      type: number; // 0: headphone, 1: shopping bag, 2: smart ring, 3: lightbulb, 4: sparkle/star

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Slightly slower drift speed to highlight product shapes
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.radius = 6;
        this.type = Math.floor(Math.random() * 5);
        
        const rand = Math.random();
        if (rand < 0.60) {
          this.color = "rgba(141, 27, 61, 0.48)"; // Burgundy (#8D1B3D)
        } else if (rand < 0.85) {
          this.color = "rgba(230, 194, 41, 0.60)"; // Gold (#E6C229)
        } else {
          this.color = "rgba(141, 27, 61, 0.30)";
        }
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off canvas boundary
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        const x = this.x;
        const y = this.y;

        ctx.save();
        
        if (this.type === 0) {
          // Gadget: Headphones
          // Arch
          ctx.beginPath();
          ctx.arc(x, y - 1, 5, Math.PI, 0);
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 1.6;
          ctx.stroke();
          // Ear pads
          ctx.fillStyle = this.color;
          ctx.fillRect(x - 6.5, y - 2, 2, 4.5);
          ctx.fillRect(x + 4.5, y - 2, 2, 4.5);
        } else if (this.type === 1) {
          // Shopping: Gift/Shopping Bag
          // Handle
          ctx.beginPath();
          ctx.arc(x, y - 1, 2.5, Math.PI, 0);
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          // Bag Box
          ctx.fillStyle = this.color;
          ctx.fillRect(x - 4.5, y - 1, 9, 7.5);
        } else if (this.type === 2) {
          // Tech: Smart Ring
          ctx.beginPath();
          ctx.arc(x, y, 4.5, 0, Math.PI * 2);
          ctx.strokeStyle = this.color;
          ctx.lineWidth = 1.6;
          ctx.stroke();
          // Diamond gemstone
          ctx.beginPath();
          ctx.arc(x + 2.5, y - 2.5, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = "#E6C229"; // Sparkly gold
          ctx.fill();
        } else if (this.type === 3) {
          // Home: Smart Bulb
          ctx.beginPath();
          ctx.arc(x, y - 1.5, 4, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
          // Thread cap
          ctx.fillStyle = this.color;
          ctx.fillRect(x - 1.8, y + 2.5, 3.6, 2.5);
          // Light emission dot
          ctx.beginPath();
          ctx.arc(x, y - 1.5, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
        } else {
          // Trend: Sparkle / Star
          ctx.beginPath();
          ctx.moveTo(x, y - 6);
          ctx.quadraticCurveTo(x, y, x + 6, y);
          ctx.quadraticCurveTo(x, y, x, y + 6);
          ctx.quadraticCurveTo(x, y, x - 6, y);
          ctx.quadraticCurveTo(x, y, x, y - 6);
          ctx.closePath();
          ctx.fillStyle = this.color;
          ctx.fill();
        }

        ctx.restore();
      }
    }

    const particles: Particle[] = [];
    const particleCount = Math.min(100, Math.floor((width * height) / 8000));
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Interactive mouse trackers
    const mouse = {
      x: -9999,
      y: -9999,
      radius: 130, // Distance within which lines snap to mouse
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const heroSection = canvas.closest("section");
    if (heroSection) {
      heroSection.addEventListener("mousemove", handleMouseMove);
      heroSection.addEventListener("mouseleave", handleMouseLeave);
    }

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Draw connections between neighboring particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 95) {
            const alpha = (1 - dist / 95) * 0.30;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(141, 27, 61, ${alpha})`;
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        }

        // Draw gold connection lines from particles to cursor position
        if (mouse.x > -9999) {
          const distToMouse = Math.hypot(p1.x - mouse.x, p1.y - mouse.y);
          if (distToMouse < mouse.radius) {
            const alpha = (1 - distToMouse / mouse.radius) * 0.50;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(230, 194, 41, ${alpha})`;
            ctx.lineWidth = 1.25;
            ctx.stroke();
          }
        }
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Cursor hover lighting halo effect
      if (mouse.x > -9999) {
        const radGrad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          180
        );
        radGrad.addColorStop(0, "rgba(141, 27, 61, 0.14)");
        radGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 180, 0, Math.PI * 2);
        ctx.fill();
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      drawConnections();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (heroSection) {
        heroSection.removeEventListener("mousemove", handleMouseMove);
        heroSection.removeEventListener("mouseleave", handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-10 h-full w-full pointer-events-none opacity-50 transition-opacity"
    />
  );
}
