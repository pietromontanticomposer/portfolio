/**
 * Global Audio Manager - Ensures only ONE WaveSurfer instance is active at a time
 * Prevents CPU/memory overhead from multiple simultaneous audio players
 */

type WaveSurferInstance = {
  id: string;
  instance: unknown;
  pause: () => void;
  destroy: () => void;
};

class AudioManagerClass {
  private activePlayer: WaveSurferInstance | null = null;
  private instances: Map<string, WaveSurferInstance> = new Map();

  /**
   * Register a new WaveSurfer instance
   */
  register(id: string, instance: unknown, pause: () => void, destroy: () => void) {
    this.instances.set(id, { id, instance, pause, destroy });
  }

  /**
   * Unregister and cleanup an instance
   */
  unregister(id: string) {
    const player = this.instances.get(id);
    if (player) {
      if (this.activePlayer?.id === id) {
        this.activePlayer = null;
      }
      this.instances.delete(id);
    }
  }

  /**
   * Set a player as active - pauses all others
   */
  setActive(id: string) {
    const newActive = this.instances.get(id);
    if (!newActive) return;

    // Pause previous active player
    if (this.activePlayer && this.activePlayer.id !== id) {
      this.activePlayer.pause();
    }

    this.activePlayer = newActive;
  }

  /**
   * Get current active player ID
   */
  getActiveId(): string | null {
    return this.activePlayer?.id || null;
  }

  /**
   * Pause all players
   */
  pauseAll() {
    this.instances.forEach((player) => {
      player.pause();
    });
    this.activePlayer = null;
  }

  /**
   * Cleanup all instances (use sparingly)
   */
  destroyAll() {
    this.instances.forEach((player) => {
      player.destroy();
    });
    this.instances.clear();
    this.activePlayer = null;
  }
}

// Singleton instance
export const AudioManager = new AudioManagerClass();
