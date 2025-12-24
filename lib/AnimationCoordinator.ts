/**
 * Central animation coordinator
 * Pauses ALL animations during user interactions (scroll, touch, mouse)
 * Resumes when user is idle
 * Zero visual changes - only performance optimization
 */

type AnimationState = 'active' | 'paused';
type Listener = (state: AnimationState) => void;

class AnimationCoordinator {
  private state: AnimationState = 'active';
  private listeners = new Set<Listener>();
  private scrollTimeout: NodeJS.Timeout | null = null;
  private pointerTimeout: NodeJS.Timeout | null = null;
  private rafId: number | null = null;
  private isInitialized = false;

  // Configurable pause duration (ms)
  private readonly SCROLL_PAUSE_DURATION = 150;
  private readonly POINTER_PAUSE_DURATION = 100;

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Scroll detection
    const handleScroll = () => {
      this.pause('scroll');
      if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.resume('scroll');
      }, this.SCROLL_PAUSE_DURATION);
    };

    // Pointer movement detection (mouse, touch)
    const handlePointer = () => {
      this.pause('pointer');
      if (this.pointerTimeout) clearTimeout(this.pointerTimeout);
      this.pointerTimeout = setTimeout(() => {
        this.resume('pointer');
      }, this.POINTER_PAUSE_DURATION);
    };

    // Use RAF for scroll to reduce main thread work
    let scrollRafId: number;
    const onScroll = () => {
      if (scrollRafId) cancelAnimationFrame(scrollRafId);
      scrollRafId = requestAnimationFrame(handleScroll);
    };

    // Passive listeners for performance
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', handlePointer, { passive: true });
    window.addEventListener('touchstart', handlePointer, { passive: true });
    window.addEventListener('touchmove', handlePointer, { passive: true });

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
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
    if (this.pointerTimeout) clearTimeout(this.pointerTimeout);
    if (this.rafId) cancelAnimationFrame(this.rafId);
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
