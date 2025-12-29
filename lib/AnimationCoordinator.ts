/**
 * Central animation coordinator
 * Pauses animations only when the tab is hidden
 * Zero visual changes - only performance optimization
 */

type AnimationState = 'active' | 'paused';
type Listener = (state: AnimationState) => void;

class AnimationCoordinator {
  private state: AnimationState = 'active';
  private listeners = new Set<Listener>();
  private isInitialized = false;

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Scroll/pointer pausing removed to keep visuals stable during page scroll.

    // Tab visibility
    const handleVisibility = () => {
      if (document.hidden) {
        this.pause('visibility');
      } else {
        this.resume('visibility');
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
  }

  private pauseReasons = new Set<string>();

  private pause(reason: string) {
    this.pauseReasons.add(reason);
    if (this.state === 'paused') return;
    this.state = 'paused';
    this.notify();
  }

  private resume(reason: string) {
    this.pauseReasons.delete(reason);
    // Only resume if no other reasons to pause
    if (this.pauseReasons.size > 0) return;
    if (this.state === 'active') return;
    this.state = 'active';
    this.notify();
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.state));

    // Update body class for global performance optimizations
    if (typeof document !== 'undefined') {
      if (this.state === 'paused') {
        document.body.classList.add('animating-paused');
      } else {
        document.body.classList.remove('animating-paused');
      }
    }
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Immediately notify of current state
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState(): AnimationState {
    return this.state;
  }

  destroy() {
    this.listeners.clear();
    this.pauseReasons.clear();
    this.isInitialized = false;
  }
}

// Singleton instance
export const animationCoordinator = new AnimationCoordinator();

// Auto-initialize on client
if (typeof window !== 'undefined') {
  animationCoordinator.init();
}
