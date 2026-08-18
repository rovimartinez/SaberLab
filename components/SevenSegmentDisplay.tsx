
"use client";

import React, { useRef, useEffect } from 'react';

// Mapa de segmentos por carácter: [a, b, c, d, e, f, g]
const DIGITS: { [key: string]: number[] } = {
  '0': [1, 1, 1, 1, 1, 1, 0],
  '1': [0, 1, 1, 0, 0, 0, 0],
  '2': [1, 1, 0, 1, 1, 0, 1],
  '3': [1, 1, 1, 1, 0, 0, 1],
  '4': [0, 1, 1, 0, 0, 1, 1],
  '5': [1, 0, 1, 1, 0, 1, 1],
  '6': [1, 0, 1, 1, 1, 1, 1],
  '7': [1, 1, 1, 0, 0, 0, 0],
  '8': [1, 1, 1, 1, 1, 1, 1],
  '9': [1, 1, 1, 1, 0, 1, 1],
  'O': [1, 1, 1, 1, 1, 1, 0],
  'L': [0, 0, 0, 1, 1, 1, 0],
  '-': [0, 0, 0, 0, 0, 0, 1],
  ' ': [0, 0, 0, 0, 0, 0, 0],
};

interface SevenSegmentDisplayProps {
  value: string;
  color?: string;
  ghostColor?: string;
  charHeight?: number;
  showGhost?: boolean;
}

const CanvasSevenSegmentDisplay = ({
  value,
  color = '#00ff66',
  ghostColor = 'rgba(0, 255, 160, 0.12)',
  charHeight = 100,
  showGhost = true,
}: SevenSegmentDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = charHeight / 160; // Scale factor based on desired height
    const charWidth = 100 * s;
    const decimalWidth = 30 * s;
    const gap = 15 * s;

    // --- Helper drawing functions ---
    const roundedBar = (x: number, y: number, w: number, h: number, r: number) => {
      const rr = Math.min(r, h / 2, w / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.lineTo(x + w - rr, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
      ctx.lineTo(x + w, y + h - rr);
      ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
      ctx.lineTo(x + rr, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
      ctx.lineTo(x, y + rr);
      ctx.quadraticCurveTo(x, y, x + rr, y);
      ctx.closePath();
      ctx.fill();
    };

    const drawDigit = (ox: number, oy: number, char: string) => {
      const W = 100 * s, H = 160 * s;
      const thick = 16 * s;
      const pad = 8 * s;
      const r = thick / 2;

      const segs = [
        { x: ox + pad + thick, y: oy + pad, w: W - 2 * pad - 2 * thick, h: thick }, // A
        { x: ox + W - pad - thick, y: oy + pad + thick / 2, w: thick, h: H / 2 - pad - thick }, // B
        { x: ox + W - pad - thick, y: oy + H / 2 + thick / 2, w: thick, h: H / 2 - pad - thick }, // C
        { x: ox + pad + thick, y: oy + H - pad - thick, w: W - 2 * pad - 2 * thick, h: thick }, // D
        { x: ox + pad, y: oy + H / 2 + thick / 2, w: thick, h: H / 2 - pad - thick }, // E
        { x: ox + pad, y: oy + pad + thick / 2, w: thick, h: H / 2 - pad - thick }, // F
        { x: ox + pad + thick, y: oy + H / 2 - thick / 2, w: W - 2 * pad - 2 * thick, h: thick }, // G
      ];

      if (showGhost) {
        ctx.fillStyle = ghostColor;
        segs.forEach(sdef => roundedBar(sdef.x, sdef.y, sdef.w, sdef.h, r));
      }

      const state = DIGITS[char] || DIGITS[' '];
      ctx.fillStyle = color;
      state.forEach((on, i) => {
        if (on) {
          const sdef = segs[i];
          roundedBar(sdef.x, sdef.y, sdef.w, sdef.h, r);
        }
      });
    };

    const drawDecimalPoint = (ox: number, oy: number) => {
        const r = 8 * s;
        const pad = 8 * s;
        const xPos = ox + charWidth + gap / 2;
        const yPos = oy + (160 * s) - (pad * 2);

        if(showGhost) {
            ctx.fillStyle = ghostColor;
            ctx.beginPath();
            ctx.arc(xPos, yPos, r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(xPos, yPos, r, 0, Math.PI * 2);
        ctx.fill();
    };

    // --- Main rendering logic ---
    const measureWidth = (text: string) => {
        let digitCount = 0;
        for (const ch of text) {
            if (ch !== '.') digitCount++;
        }
        return digitCount * (charWidth + gap) - gap;
    };
    
    const totalWidth = measureWidth(value);
    const DPR = window.devicePixelRatio || 1;
    canvas.width = totalWidth * DPR;
    canvas.height = charHeight * DPR;
    canvas.style.width = `${totalWidth}px`;
    canvas.style.height = `${charHeight}px`;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let x = 0;
    const y = 0;
    let i = 0;

    while (i < value.length) {
        const char = value[i];
        if (char !== '.') {
            drawDigit(x, y, char);
            if (i + 1 < value.length && value[i+1] === '.') {
                drawDecimalPoint(x, y);
                i++; // Skip the decimal point in the next iteration
            }
            x += charWidth + gap;
        }
        i++;
    }

  }, [value, color, ghostColor, charHeight, showGhost]);

  return <canvas ref={canvasRef} />;
};

export default CanvasSevenSegmentDisplay;
