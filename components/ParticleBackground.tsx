"use client";

import { useEffect, useRef } from "react";

interface AtomNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  isCenter: boolean;
  orbitAngle: number;
  orbitSpeed: number;
  orbitRadius: number;
}

interface ChemicalCompound {
  cx: number;
  cy: number;
  vx: number;
  vy: number;
  rotation: number;
  rotSpeed: number;
  scale: number;
  type: "benzene" | "linear" | "branched";
  nodes: { relX: number; relY: number; label?: string; doubleBond?: boolean }[];
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let hasMouse = false;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      hasMouse = true;
    };

    const handleMouseLeave = () => {
      hasMouse = false;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    // ── 1. Create Chemical Compound Molecular Rings (Hexagons / Benzene / Branched) ──
    const compounds: ChemicalCompound[] = [];
    const compoundCount = Math.min(Math.max(Math.floor(width / 220), 4), 10);

    const compoundTypes: ("benzene" | "linear" | "branched")[] = ["benzene", "branched", "benzene", "linear"];

    for (let c = 0; c < compoundCount; c++) {
      const type = compoundTypes[c % compoundTypes.length];
      const scale = Math.random() * 0.4 + 0.65;
      const nodes: { relX: number; relY: number; label?: string; doubleBond?: boolean }[] = [];

      if (type === "benzene") {
        // Hexagonal Benzene Ring (6 atoms with alternating double bonds)
        const radius = 45 * scale;
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          nodes.push({
            relX: Math.cos(angle) * radius,
            relY: Math.sin(angle) * radius,
            doubleBond: i % 2 === 0,
            label: i === 0 ? "DIGI" : undefined,
          });
        }
        // Optional attached substituent branch
        nodes.push({
          relX: Math.cos(0) * (radius + 28 * scale),
          relY: Math.sin(0) * (radius + 28 * scale),
          label: "PIN",
        });
      } else if (type === "branched") {
        // Branched Coordinate Molecule
        const r = 38 * scale;
        nodes.push({ relX: 0, relY: 0, label: "MAP" }); // Center
        nodes.push({ relX: -r, relY: -r * 0.6, doubleBond: true });
        nodes.push({ relX: r, relY: -r * 0.6 });
        nodes.push({ relX: 0, relY: r });
        nodes.push({ relX: r * 1.6, relY: -r * 1.1, label: "~4m" });
      } else {
        // Linear Poly-Chained Map Route
        const step = 32 * scale;
        for (let i = -2; i <= 2; i++) {
          nodes.push({
            relX: i * step,
            relY: (i % 2 === 0 ? -12 : 12) * scale,
            doubleBond: i === 0,
          });
        }
      }

      compounds.push({
        cx: Math.random() * width,
        cy: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.003,
        scale,
        type,
        nodes,
      });
    }

    // ── 2. Create Floating Atomic Background Nodes ──
    const atomCount = Math.min(Math.floor(width / 32), 48);
    const atoms: AtomNode[] = [];
    const colors = [
      { fill: "rgba(249, 115, 22, 0.75)", glow: "rgba(249, 115, 22, 0.25)" }, // Brand Orange
      { fill: "rgba(251, 146, 60, 0.75)", glow: "rgba(251, 146, 60, 0.25)" }, // Amber
      { fill: "rgba(56, 189, 248, 0.7)", glow: "rgba(56, 189, 248, 0.2)" },   // Sky Cyan (GPS)
      { fill: "rgba(168, 85, 247, 0.65)", glow: "rgba(168, 85, 247, 0.18)" }, // Purple
    ];

    for (let i = 0; i < atomCount; i++) {
      const col = colors[i % colors.length];
      atoms.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.2 + 1.2,
        color: col.fill,
        glowColor: col.glow,
        isCenter: i % 5 === 0,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitSpeed: (Math.random() - 0.5) * 0.02,
        orbitRadius: Math.random() * 18 + 10,
      });
    }

    const maxBondDistance = 140;

    // ── 3. Render Animation Loop ──
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // ── Draw Chemical Compounds (Floating Rings & Molecular Chains) ──
      for (const comp of compounds) {
        comp.cx += comp.vx;
        comp.cy += comp.vy;
        comp.rotation += comp.rotSpeed;

        // Wrap around screen boundaries with margin
        const margin = 80;
        if (comp.cx < -margin) comp.cx = width + margin;
        else if (comp.cx > width + margin) comp.cx = -margin;

        if (comp.cy < -margin) comp.cy = height + margin;
        else if (comp.cy > height + margin) comp.cy = -margin;

        // Calculate absolute positions of all nodes in this compound
        const cosR = Math.cos(comp.rotation);
        const sinR = Math.sin(comp.rotation);

        const absNodes = comp.nodes.map((n) => ({
          x: comp.cx + (n.relX * cosR - n.relY * sinR),
          y: comp.cy + (n.relX * sinR + n.relY * cosR),
          label: n.label,
          doubleBond: n.doubleBond,
        }));

        // Draw Bonds (Covalent chemical lines between nodes in this compound)
        ctx.save();
        for (let i = 0; i < absNodes.length; i++) {
          const nextIdx = comp.type === "benzene" ? (i < 6 ? (i + 1) % 6 : i - 1) : (i + 1) % absNodes.length;
          if (comp.type === "branched" && i > 0) {
            // Connect to center (node 0)
            const nA = absNodes[0];
            const nB = absNodes[i];
            ctx.beginPath();
            ctx.moveTo(nA.x, nA.y);
            ctx.lineTo(nB.x, nB.y);
            ctx.strokeStyle = "rgba(249, 115, 22, 0.22)";
            ctx.lineWidth = 1.2;
            ctx.stroke();
          } else if (comp.type === "benzene" && i < 6) {
            const nA = absNodes[i];
            const nB = absNodes[nextIdx];

            // Single bond
            ctx.beginPath();
            ctx.moveTo(nA.x, nA.y);
            ctx.lineTo(nB.x, nB.y);
            ctx.strokeStyle = "rgba(249, 115, 22, 0.24)";
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Double bond line if applicable
            if (nA.doubleBond) {
              const dx = nB.x - nA.x;
              const dy = nB.y - nA.y;
              const len = Math.sqrt(dx * dx + dy * dy) || 1;
              const nx = (-dy / len) * 4;
              const ny = (dx / len) * 4;

              ctx.beginPath();
              ctx.moveTo(nA.x + nx, nA.y + ny);
              ctx.lineTo(nB.x + nx, nB.y + ny);
              ctx.strokeStyle = "rgba(251, 146, 60, 0.18)";
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          } else if (comp.type === "linear" && i < absNodes.length - 1) {
            const nA = absNodes[i];
            const nB = absNodes[i + 1];
            ctx.beginPath();
            ctx.moveTo(nA.x, nA.y);
            ctx.lineTo(nB.x, nB.y);
            ctx.strokeStyle = "rgba(56, 189, 248, 0.2)";
            ctx.lineWidth = 1.1;
            ctx.stroke();
          }
        }

        // Draw Compound Atom Nodes
        for (const n of absNodes) {
          // Glow halo
          ctx.beginPath();
          ctx.arc(n.x, n.y, 6 * comp.scale, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(249, 115, 22, 0.08)";
          ctx.fill();

          // Atom Core
          ctx.beginPath();
          ctx.arc(n.x, n.y, 2.5 * comp.scale, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(249, 115, 22, 0.7)";
          ctx.fill();

          // Atom Label (e.g. DIGI, PIN, MAP)
          if (n.label) {
            ctx.font = "bold 9px monospace";
            ctx.fillStyle = "rgba(249, 115, 22, 0.55)";
            ctx.textAlign = "center";
            ctx.fillText(n.label, n.x, n.y - 7);
          }
        }
        ctx.restore();
      }

      // ── Draw Inter-Atomic Network Connections (Map Lattice) ──
      for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
          const dx = atoms[i].x - atoms[j].x;
          const dy = atoms[i].y - atoms[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxBondDistance) {
            const lineAlpha = (1 - dist / maxBondDistance) * 0.16;
            ctx.beginPath();
            ctx.moveTo(atoms[i].x, atoms[i].y);
            ctx.lineTo(atoms[j].x, atoms[j].y);
            ctx.strokeStyle = `rgba(249, 115, 22, ${lineAlpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }

        // Mouse interaction bond
        if (hasMouse) {
          const mdx = atoms[i].x - mouseX;
          const mdy = atoms[i].y - mouseY;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < 160) {
            const mAlpha = (1 - mDist / 160) * 0.28;
            ctx.beginPath();
            ctx.moveTo(atoms[i].x, atoms[i].y);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = `rgba(251, 146, 60, ${mAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // ── Draw Floating Atomic Nodes & Orbiting Electrons ──
      for (let i = 0; i < atoms.length; i++) {
        const p = atoms[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;

        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        // Atom Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = p.glowColor;
        ctx.fill();

        // Atom Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Orbiting Valence Electron on select central atoms
        if (p.isCenter) {
          p.orbitAngle += p.orbitSpeed;
          const ex = p.x + Math.cos(p.orbitAngle) * p.orbitRadius;
          const ey = p.y + Math.sin(p.orbitAngle) * p.orbitRadius;

          // Orbit Track
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.orbitRadius, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(249, 115, 22, 0.1)";
          ctx.lineWidth = 0.75;
          ctx.stroke();

          // Electron
          ctx.beginPath();
          ctx.arc(ex, ey, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(56, 189, 248, 0.8)";
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        width: "100%",
        height: "100%",
        opacity: 0.88,
      }}
      aria-hidden="true"
    />
  );
}
