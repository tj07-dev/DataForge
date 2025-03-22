/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const NeuralParticles: React.FC<{ color: string }> = ({
  color,
}: {
  color: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const particleCount = 50;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      connections: Particle[];
    }

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 2 - 1,
      size: Math.random() * 3 + 1,
      connections: [],
    });

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (
          particle.x + particle.size > canvas.width ||
          particle.x - particle.size < 0
        ) {
          particle.vx *= -1;
        }
        if (
          particle.y + particle.size > canvas.height ||
          particle.y - particle.size < 0
        ) {
          particle.vy *= -1;
        }

        particles.forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle =
              theme === 'dark'
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(0, 0, 0, 0.2)';
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        background: theme === 'dark' ? 'black' : 'white',
        left: 0,
        zIndex: -1,
        width: '100vw',
        height: '100vh',
      }}
    />
  );
};

export default NeuralParticles;
