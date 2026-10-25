export class TimerManager {
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private intervals: Map<string, ReturnType<typeof setInterval>> = new Map();

  public setTimeout(name: string, callback: () => void, delayMs: number): void {
    this.clearTimeout(name);
    const id = setTimeout(() => {
      this.timers.delete(name);
      callback();
    }, delayMs);
    this.timers.set(name, id);
  }

  public clearTimeout(name: string): void {
    if (this.timers.has(name)) {
      clearTimeout(this.timers.get(name)!);
      this.timers.delete(name);
    }
  }

  public setInterval(name: string, callback: () => void, intervalMs: number): void {
    this.clearInterval(name);
    const id = setInterval(callback, intervalMs);
    this.intervals.set(name, id);
  }

  public clearInterval(name: string): void {
    if (this.intervals.has(name)) {
      clearInterval(this.intervals.get(name)!);
      this.intervals.delete(name);
    }
  }

  public clearAll(): void {
    this.timers.forEach((id) => clearTimeout(id));
    this.timers.clear();
    this.intervals.forEach((id) => clearInterval(id));
    this.intervals.clear();
  }
}

export const globalTimerManager = new TimerManager();
