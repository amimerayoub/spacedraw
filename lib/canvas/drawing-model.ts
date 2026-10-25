export type ToolType = 'brush' | 'eraser' | 'fill' | 'eyedropper';

export interface DrawOperation {
  id: string;
  type: 'stroke' | 'clear' | 'fill';
  tool: ToolType;
  color: string;
  size: number; // Normalized size relative to board width (e.g. 0.008)
  points: [number, number][]; // Normalized [x, y] coordinates (0.0 to 1.0)
}

export class DrawingModel {
  private ops: DrawOperation[] = [];
  private redoStack: DrawOperation[] = [];
  private activeStroke: DrawOperation | null = null;
  private listeners: (() => void)[] = [];

  public getOps(): DrawOperation[] {
    return [...this.ops];
  }

  public getActiveStroke(): DrawOperation | null {
    return this.activeStroke;
  }

  public canUndo(): boolean {
    return this.ops.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public startStroke(tool: ToolType, color: string, size: number, x: number, y: number): void {
    this.redoStack = [];
    this.activeStroke = {
      id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: 'stroke',
      tool,
      color,
      size,
      points: [[x, y]],
    };
    this.notify();
  }

  public addPoint(x: number, y: number): void {
    if (!this.activeStroke) return;

    const points = this.activeStroke.points;
    if (points.length > 0) {
      const [lastX, lastY] = points[points.length - 1];
      const dx = x - lastX;
      const dy = y - lastY;
      // Drop points closer than ~0.002 normalized distance to avoid bloat
      if (dx * dx + dy * dy < 0.000004) return;
    }

    points.push([x, y]);
    this.notify();
  }

  public endStroke(): DrawOperation | null {
    if (!this.activeStroke) return null;

    const finished = { ...this.activeStroke, points: [...this.activeStroke.points] };
    this.ops.push(finished);
    this.activeStroke = null;

    // Limit history length to 200 ops
    if (this.ops.length > 200) {
      this.ops.shift();
    }

    this.notify();
    return finished;
  }

  public addExternalOp(op: DrawOperation): void {
    // Ignore ops already present locally (e.g. the drawer's own strokes echoed by the service).
    if (this.ops.some((o) => o.id === op.id)) return;
    this.ops.push(op);
    this.notify();
  }

  public clearBoard(): void {
    if (this.ops.length === 0) return;
    this.redoStack = [];
    const clearOp: DrawOperation = {
      id: `clear-${Date.now()}`,
      type: 'clear',
      tool: 'eraser',
      color: '#000000',
      size: 0,
      points: [],
    };
    this.ops.push(clearOp);
    this.notify();
  }

  public undo(): void {
    if (this.ops.length === 0) return;
    const popped = this.ops.pop();
    if (popped) {
      this.redoStack.push(popped);
      this.notify();
    }
  }

  public redo(): void {
    if (this.redoStack.length === 0) return;
    const popped = this.redoStack.pop();
    if (popped) {
      this.ops.push(popped);
      this.notify();
    }
  }

  public reset(): void {
    this.ops = [];
    this.redoStack = [];
    this.activeStroke = null;
    this.notify();
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }
}

export function renderDrawingOnCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  ops: DrawOperation[],
  activeStroke: DrawOperation | null = null
): void {
  ctx.clearRect(0, 0, width, height);

  const allOps = activeStroke ? [...ops, activeStroke] : ops;

  for (const op of allOps) {
    if (op.type === 'clear') {
      ctx.clearRect(0, 0, width, height);
      continue;
    }

    if (op.points.length === 0) continue;

    ctx.save();

    if (op.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = op.color;
    }

    const strokeWidth = Math.max(1, op.size * width);
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();

    const points = op.points;

    if (points.length === 1) {
      // Single tap dot
      const [x, y] = points[0];
      ctx.arc(x * width, y * height, strokeWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = op.tool === 'eraser' ? 'rgba(0,0,0,1)' : op.color;
      ctx.fill();
    } else {
      ctx.moveTo(points[0][0] * width, points[0][1] * height);

      for (let i = 1; i < points.length - 1; i++) {
        const xc = ((points[i][0] + points[i + 1][0]) / 2) * width;
        const yc = ((points[i][1] + points[i + 1][1]) / 2) * height;
        ctx.quadraticCurveTo(points[i][0] * width, points[i][1] * height, xc, yc);
      }

      const last = points[points.length - 1];
      ctx.lineTo(last[0] * width, last[1] * height);
      ctx.stroke();
    }

    ctx.restore();
  }
}
