import React, { useEffect, useRef } from 'react';
import { LevelSegment, SegmentType } from '../types';

interface LevelPreviewProps {
  segments: LevelSegment[];
}

export const LevelPreview: React.FC<LevelPreviewProps> = ({ segments }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas Setup
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear
    ctx.fillStyle = '#0f172a'; // Dark blue bg
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for(let i=0; i<width; i+=20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }
    for(let i=0; i<height; i+=20) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
    }

    // Draw Ground
    ctx.fillStyle = '#334155';
    const groundY = height - 40;
    ctx.fillRect(0, groundY, width, 40);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(width, groundY); ctx.stroke();

    // Draw Segments
    let currentX = 50;
    let currentY = groundY;
    const scale = 0.5; // Scale down to fit more

    segments.forEach(seg => {
        ctx.fillStyle = '#22c55e'; // Block Color (Green)
        ctx.strokeStyle = '#f0f9ff';

        const drawBlock = (x: number, y: number) => {
             ctx.fillRect(x, y - 20, 20, 20);
             ctx.strokeRect(x, y - 20, 20, 20);
        };

        const drawSpike = (x: number, y: number) => {
            ctx.fillStyle = '#ef4444'; // Spike Red
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 10, y - 20);
            ctx.lineTo(x + 20, y);
            ctx.fill();
        };

        const drawPortal = (x: number, y: number, color: string) => {
            ctx.fillStyle = color;
            ctx.fillRect(x, y - 40, 30, 60);
        };

        switch (seg.type) {
             case SegmentType.START_PAD:
             case SegmentType.REST_AREA:
                currentX += 60 * scale;
                break;
             case SegmentType.BASIC_SPIKE:
                drawSpike(currentX, currentY);
                currentX += 40;
                break;
             case SegmentType.DOUBLE_SPIKE:
                drawSpike(currentX, currentY);
                drawSpike(currentX + 20, currentY);
                currentX += 60;
                break;
             case SegmentType.TRIPLE_SPIKE:
                drawSpike(currentX, currentY);
                drawSpike(currentX + 20, currentY);
                drawSpike(currentX + 40, currentY);
                currentX += 80;
                break;
             case SegmentType.PLATFORM_JUMP:
                const h = (seg.yOffset || 1) * 30;
                drawBlock(currentX, currentY - h);
                currentX += 40;
                break;
             case SegmentType.STAIRS_UP:
                drawBlock(currentX, currentY);
                drawBlock(currentX + 20, currentY - 20);
                drawBlock(currentX + 40, currentY - 40);
                currentX += 60;
                currentY -= 40;
                break;
             case SegmentType.STAIRS_DOWN:
                drawBlock(currentX, currentY + 20);
                drawBlock(currentX + 20, currentY + 40);
                currentX += 60;
                currentY += 40;
                if(currentY > groundY) currentY = groundY;
                break;
             case SegmentType.SHIP_GATE:
                drawPortal(currentX, currentY - 40, '#a855f7'); // Purple
                currentX += 80;
                drawPortal(currentX, currentY - 40, '#22c55e'); // Green
                break;
             case SegmentType.SHIP_STRAIGHT:
                drawPortal(currentX, currentY - 40, '#a855f7'); 
                currentX += 120; // Visualize long straight
                drawPortal(currentX, currentY - 40, '#22c55e');
                break;
        }
        
        // Reset scale simulation for X progress to make it fit visually
        // Real mapping would be more complex, this is just an approximation
    });

  }, [segments]);

  return (
    <div className="w-full h-64 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-inner relative">
       <canvas 
        ref={canvasRef} 
        width={800} 
        height={256} 
        className="w-full h-full object-cover"
       />
       <div className="absolute bottom-2 right-2 text-xs text-slate-500 bg-slate-900/80 px-2 py-1 rounded">
         Approximation Preview
       </div>
    </div>
  );
};
