"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  z: number; // Parallax depth layer
  size: number;
  color: string;
  speedY: number;
  speedX: number;
  angle: number;
  rotationSpeed: number;
  type: "circle" | "star" | "sprinkle" | "heart";
}

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const aura1Ref = useRef<HTMLDivElement>(null);
  const aura2Ref = useRef<HTMLDivElement>(null);
  const aura3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const particleCount = isMobile ? 22 : 46;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Target vs Current coordinates for smooth fluid lerping (Linear Interpolation)
    let targetMouseX = 0.5;
    let targetMouseY = 0.3;
    let currentMouseX = 0.5;
    let currentMouseY = 0.3;

    let targetScrollY = typeof window !== "undefined" ? window.scrollY : 0;
    let currentScrollY = targetScrollY;
    let lastScroll = targetScrollY;

    // Passive listeners - ZERO React re-renders!
    const onMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX / width;
      targetMouseY = e.clientY / height;
    };

    const onScroll = () => {
      targetScrollY = window.scrollY;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    // Dessert pastel stardust palette
    const colors = [
      "rgba(255, 94, 142, 0.5)",   // Strawberry pink
      "rgba(56, 189, 248, 0.5)",   // Ethereal baby blue
      "rgba(244, 114, 182, 0.45)", // Soft pink rose
      "rgba(125, 211, 252, 0.45)", // Sky blue
      "rgba(251, 207, 232, 0.5)",  // Marshmallow light
      "rgba(254, 240, 138, 0.5)",  // Golden sugar pearl
    ];

    const types: ("circle" | "star" | "sprinkle" | "heart")[] = ["circle", "star", "sprinkle", "heart"];
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height * 1.5,
        z: Math.random() * 1.6 + 0.4, // Depth layer
        size: Math.random() * 3.5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: (Math.random() - 0.5) * 0.35,
        speedX: (Math.random() - 0.5) * 0.35,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        type: types[Math.floor(Math.random() * types.length)],
      });
    }

    // High performance 60FPS RAF Engine
    const render = () => {
      // 1. Smooth fluid lerping (damping factor = 0.06 for silky liquid motion)
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;
      currentScrollY += (targetScrollY - currentScrollY) * 0.07;

      const rawScrollDelta = currentScrollY - lastScroll;
      // Clamp delta to prevent sudden jumping/tearing on fast mobile flick-scroll
      const clampedDelta = Math.max(-16, Math.min(16, rawScrollDelta));
      lastScroll = currentScrollY;

      // 2. Direct DOM transform updates (No CSS transition fight, no React re-render lag)
      if (aura1Ref.current) {
        const xOffset = (currentMouseX - 0.5) * 36;
        const yOffset = -currentScrollY * 0.16;
        aura1Ref.current.style.transform = `translate3d(${xOffset.toFixed(1)}px, ${yOffset.toFixed(1)}px, 0)`;
      }
      if (aura2Ref.current) {
        const xOffset = -(currentMouseX - 0.5) * 42;
        const yOffset = -currentScrollY * 0.24;
        aura2Ref.current.style.transform = `translate3d(${xOffset.toFixed(1)}px, ${yOffset.toFixed(1)}px, 0)`;
      }
      if (aura3Ref.current) {
        const xOffset = (currentMouseY - 0.5) * 24;
        const yOffset = -currentScrollY * 0.12;
        aura3Ref.current.style.transform = `translate3d(${xOffset.toFixed(1)}px, ${yOffset.toFixed(1)}px, 0)`;
      }

      // 3. Clear and draw stardust particles
      ctx.clearRect(0, 0, width, height);

      const pointerPixelX = currentMouseX * width;
      const pointerPixelY = currentMouseY * height;
      const maxInteractionDist = 120;

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];

        // Natural floating + smooth clamped scroll parallax
        p.x += p.speedX;
        p.y += p.speedY - clampedDelta * p.z * 0.12;
        p.angle += p.rotationSpeed;

        // Soft screen wrapping
        if (p.x < -30) p.x = width + 30;
        if (p.x > width + 30) p.x = -30;
        if (p.y < -40) p.y = height + 40;
        if (p.y > height + 40) p.y = -40;

        // Gentle interactive mouse deflection
        const dx = pointerPixelX - p.x;
        const dy = pointerPixelY - p.y;
        const distSq = dx * dx + dy * dy;

        let renderX = p.x;
        let renderY = p.y;

        if (distSq < maxInteractionDist * maxInteractionDist && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / maxInteractionDist) * 16 * p.z;
          renderX -= (dx / dist) * force;
          renderY -= (dy / dist) * force;
        }

        ctx.save();
        ctx.translate(renderX, renderY);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;

        const renderSize = p.size * (0.8 + p.z * 0.25);

        if (p.type === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, renderSize, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "star") {
          ctx.beginPath();
          const r = renderSize * 1.5;
          ctx.moveTo(0, -r);
          ctx.quadraticCurveTo(0, 0, r, 0);
          ctx.quadraticCurveTo(0, 0, 0, r);
          ctx.quadraticCurveTo(0, 0, -r, 0);
          ctx.quadraticCurveTo(0, 0, 0, -r);
          ctx.fill();
        } else if (p.type === "sprinkle") {
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(-renderSize * 1.4, -renderSize * 0.45, renderSize * 2.8, renderSize * 0.9, 3);
          } else {
            ctx.rect(-renderSize * 1.4, -renderSize * 0.45, renderSize * 2.8, renderSize * 0.9);
          }
          ctx.fill();
        } else if (p.type === "heart") {
          ctx.beginPath();
          const s = renderSize * 0.75;
          ctx.moveTo(0, s * 0.3);
          ctx.bezierCurveTo(-s, -s * 0.5, -s * 1.3, s * 0.5, 0, s * 1.5);
          ctx.bezierCurveTo(s * 1.3, s * 0.5, s, -s * 0.5, 0, s * 0.3);
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ contain: "strict" }}
      aria-hidden="true"
    >
      {/* 1. Dynamic Pink Aura Mesh (GPU Compositing Layer 1) */}
      <div
        ref={aura1Ref}
        className="absolute w-[520px] h-[520px] sm:w-[680px] sm:h-[680px] rounded-full blur-3xl opacity-40 dark:opacity-25 will-change-transform"
        style={{
          background: "radial-gradient(circle, rgba(255, 94, 142, 0.42) 0%, rgba(244, 114, 182, 0.16) 50%, transparent 70%)",
          top: "4%",
          right: "4%",
        }}
      />

      {/* 2. Dynamic Baby Blue Aura Mesh (GPU Compositing Layer 2) */}
      <div
        ref={aura2Ref}
        className="absolute w-[480px] h-[480px] sm:w-[640px] sm:h-[640px] rounded-full blur-3xl opacity-40 dark:opacity-25 will-change-transform"
        style={{
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.42) 0%, rgba(125, 211, 252, 0.16) 50%, transparent 70%)",
          top: "42%",
          left: "4%",
        }}
      />

      {/* 3. Dynamic Lilac / Cotton Candy Aura Mesh (GPU Compositing Layer 3) */}
      <div
        ref={aura3Ref}
        className="absolute w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full blur-3xl opacity-35 dark:opacity-20 will-change-transform"
        style={{
          background: "radial-gradient(circle, rgba(216, 180, 254, 0.38) 0%, rgba(253, 242, 248, 0.14) 55%, transparent 70%)",
          top: "72%",
          right: "18%",
        }}
      />

      {/* 4. Canvas for Fluid Floating Dessert Stardust & Hearts */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
}
