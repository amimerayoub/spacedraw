'use client';

import React from 'react';
import { DrawOperation, DrawingModel, renderDrawingOnCanvas, ToolType } from '../lib/canvas/drawing-model';

interface CanvasBoardProps {
  model: DrawingModel;
  isReadOnly: boolean;
  tool: ToolType;
  color: string;
  size: number; // Normalized size (e.g. 0.008)
  showGridDots?: boolean;
  onStrokeFinished?: (op: DrawOperation) => void;
}

const ASPECT = 4 / 3;

export const CanvasBoard: React.FC<CanvasBoardProps> = ({
  model,
  isReadOnly,
  tool,
  color,
  size,
  showGridDots = true,
  onStrokeFinished,
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [boardSize, setBoardSize] = React.useState<{ w: number; h: number }>({ w: 400, h: 300 });
  const [cursorPos, setCursorPos] = React.useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  // Re-render canvas whenever the model changes or the board is resized.
  const redraw = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const targetWidth = Math.floor(rect.width * dpr);
    const targetHeight = Math.floor(rect.height * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    renderDrawingOnCanvas(ctx, targetWidth, targetHeight, model.getOps(), model.getActiveStroke());
  }, [model]);

  // Measure the available space and fit a 4:3 board inside it.
  const measure = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    if (cw === 0 || ch === 0) return;

    let w = cw;
    let h = w / ASPECT;
    if (h > ch) {
      h = ch;
      w = h * ASPECT;
    }
    setBoardSize((prev) =>
      Math.abs(prev.w - w) < 1 && Math.abs(prev.h - h) < 1 ? prev : { w: Math.floor(w), h: Math.floor(h) }
    );
  }, []);

  React.useEffect(() => {
    measure();
    redraw();
    const unsubscribe = model.subscribe(redraw);

    const container = containerRef.current;
    let observer: ResizeObserver | null = null;
    if (container && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        measure();
      });
      observer.observe(container);
    }

    const handleResize = () => measure();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      unsubscribe();
      observer?.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, [model, redraw, measure]);

  // Redraw after the board element resizes so stroke quality/positions stay correct.
  React.useEffect(() => {
    redraw();
  }, [boardSize, redraw]);

  // Pointer event handlers
  const getNormalizedCoordinates = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return [x, y];
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.setPointerCapture(e.pointerId);
    }
    const coords = getNormalizedCoordinates(e);
    if (!coords) return;
    model.startStroke(tool, color, size, coords[0], coords[1]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      setCursorPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        visible: !isReadOnly,
      });
    }

    if (isReadOnly || !model.getActiveStroke()) return;
    const coords = getNormalizedCoordinates(e);
    if (!coords) return;
    model.addPoint(coords[0], coords[1]);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return;
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    const finishedOp = model.endStroke();
    if (finishedOp && onStrokeFinished) {
      onStrokeFinished(finishedOp);
    }
  };

  const handlePointerLeave = () => {
    setCursorPos((prev) => ({ ...prev, visible: false }));
  };

  // Cursor indicator size in CSS pixels
  const cursorPxSize = Math.max(8, size * boardSize.w);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-0 flex items-center justify-center">
      <div
        className="relative rounded-2xl glass-panel p-2 overflow-hidden shadow-2xl border border-[var(--border-strong)] touch-none select-none"
        style={{ width: `${boardSize.w}px`, height: `${boardSize.h}px` }}
      >
        {/* Background Dot Grid */}
        {showGridDots && (
          <div
            className="absolute inset-2 pointer-events-none opacity-20 rounded-xl"
            style={{
              backgroundImage: 'radial-gradient(var(--text-primary) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        )}

        {/* Transparent Drawing Canvas */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          className={`w-full h-full block rounded-xl relative z-10 ${
            isReadOnly ? 'cursor-default' : 'cursor-none'
          }`}
          style={{ touchAction: 'none' }}
          aria-label="SpaceDraw drawing canvas"
          role="img"
        />

        {/* Feedback Pointer Circle Overlay */}
        {!isReadOnly && cursorPos.visible && (
          <div
            className="absolute z-20 pointer-events-none rounded-full border-2 border-[var(--text-primary)] -translate-x-1/2 -translate-y-1/2 shadow-sm"
            style={{
              left: `${cursorPos.x + 8}px`,
              top: `${cursorPos.y + 8}px`,
              width: `${cursorPxSize}px`,
              height: `${cursorPxSize}px`,
              backgroundColor: tool === 'eraser' ? 'rgba(255,255,255,0.2)' : color,
            }}
          />
        )}

        {/* Read-Only Guesser Overlay */}
        {isReadOnly && (
          <div className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs font-mono text-[var(--text-secondary)] pointer-events-none">
            View Only
          </div>
        )}
      </div>
    </div>
  );
};
