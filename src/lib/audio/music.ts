/**
 * Background Music System
 *
 * Features:
 * - Looping ambient background track
 * - Volume control separate from SFX
 * - Pause when tab inactive
 * - Fade in/out for smooth transitions
 * - Multiple music tracks with shuffle support
 */

import { musicVolume, muted } from '@/stores/audio';

export type MusicTrack = {
  id: string;
  name: string;
  path: string;
  duration?: number; // Optional duration for looping
};

/**
 * Available music tracks
 * Add more tracks here to expand the music library
 */
export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'ambient-main',
    name: 'Suburban Afternoon',
    path: '/music/ambient-main.mp3',
  },
  {
    id: 'ambient-chill',
    name: 'Backyard Vibes',
    path: '/music/ambient-chill.mp3',
  },
  {
    id: 'ambient-upbeat',
    name: 'Grill Session',
    path: '/music/ambient-upbeat.mp3',
  },
];

/**
 * Background Music Manager Class
 */
class BackgroundMusicManager {
  private audioElement: HTMLAudioElement | null = null;
  private currentTrackIndex = 0;
  private isPlaying = false;
  private isPaused = false;
  private fadeInterval: number | null = null;
  private readonly FADE_DURATION = 1000; // 1 second fade

  /**
   * Initialize the background music system
   */
  initialize(): void {
    if (typeof window === 'undefined') return;

    // Create audio element
    this.audioElement = new Audio();
    this.audioElement.loop = true;
    this.audioElement.volume = 0; // Start at 0 for fade-in

    // Load first track
    this.loadTrack(this.currentTrackIndex);

    // Set up visibility change handler (pause when tab inactive)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // Set up volume change listener
    musicVolume.subscribe(() => this.updateVolume());
    muted.subscribe(() => this.handleMuteChange());
  }

  /**
   * Load a specific track by index
   */
  private loadTrack(index: number): void {
    if (!this.audioElement || index < 0 || index >= MUSIC_TRACKS.length) return;

    const track = MUSIC_TRACKS[index];
    this.audioElement.src = track.path;
    this.audioElement.load();

    console.debug(`[Music] Loaded track: ${track.name}`);
  }

  /**
   * Start playing background music with fade-in
   */
  play(): void {
    if (!this.audioElement || muted.get()) return;

    // If already playing, don't restart
    if (this.isPlaying && !this.isPaused) return;

    this.isPaused = false;
    this.isPlaying = true;

    // Play audio
    this.audioElement.play().catch((error) => {
      console.debug('[Music] Playback prevented:', error);
      this.isPlaying = false;
    });

    // Fade in
    this.fadeIn();
  }

  /**
   * Pause the background music with fade-out
   */
  pause(): void {
    if (!this.audioElement || !this.isPlaying) return;

    this.isPaused = true;
    this.isPlaying = false;

    // Fade out then pause
    this.fadeOut(() => {
      this.audioElement?.pause();
    });
  }

  /**
   * Stop the music completely (no fade)
   */
  stop(): void {
    if (!this.audioElement) return;

    this.isPlaying = false;
    this.isPaused = false;
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
  }

  /**
   * Change to a specific track
   */
  playTrack(trackId: string): void {
    const trackIndex = MUSIC_TRACKS.findIndex((t) => t.id === trackId);
    if (trackIndex === -1) {
      console.warn(`[Music] Track not found: ${trackId}`);
      return;
    }

    const wasPlaying = this.isPlaying;

    // Stop current playback
    if (wasPlaying) {
      this.fadeOut(() => {
        this.changeTrack(trackIndex);
        this.play();
      });
    } else {
      this.changeTrack(trackIndex);
    }
  }

  /**
   * Change to the next track
   */
  nextTrack(): void {
    const nextIndex = (this.currentTrackIndex + 1) % MUSIC_TRACKS.length;
    this.playTrack(MUSIC_TRACKS[nextIndex].id);
  }

  /**
   * Change to the previous track
   */
  previousTrack(): void {
    const prevIndex = (this.currentTrackIndex - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length;
    this.playTrack(MUSIC_TRACKS[prevIndex].id);
  }

  /**
   * Shuffle to a random track
   */
  shuffleTrack(): void {
    const randomIndex = Math.floor(Math.random() * MUSIC_TRACKS.length);
    this.playTrack(MUSIC_TRACKS[randomIndex].id);
  }

  /**
   * Get current track info
   */
  getCurrentTrack(): MusicTrack | null {
    if (this.currentTrackIndex < 0 || this.currentTrackIndex >= MUSIC_TRACKS.length) {
      return null;
    }
    return MUSIC_TRACKS[this.currentTrackIndex];
  }

  /**
   * Check if music is currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Update volume based on store
   */
  private updateVolume(): void {
    if (!this.audioElement) return;

    const targetVolume = musicVolume.get();

    // If muted, set to 0 immediately
    if (muted.get()) {
      this.audioElement.volume = 0;
      return;
    }

    // Otherwise, use music volume setting
    this.audioElement.volume = targetVolume;
  }

  /**
   * Handle mute state change
   */
  private handleMuteChange(): void {
    if (muted.get()) {
      // Fade out and pause
      this.fadeOut(() => {
        this.audioElement?.pause();
      });
    } else if (this.isPlaying) {
      // Unmuted while playing - fade back in
      this.audioElement?.play().catch(() => {
        this.isPlaying = false;
      });
      this.fadeIn();
    }
  }

  /**
   * Handle visibility change (pause when tab inactive)
   */
  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      // Tab is hidden - pause music
      if (this.isPlaying) {
        this.audioElement?.pause();
      }
    } else {
      // Tab is visible again - resume if we were playing
      if (this.isPlaying && !muted.get()) {
        this.audioElement?.play().catch(() => {
          this.isPlaying = false;
        });
      }
    }
  };

  /**
   * Fade in volume
   */
  private fadeIn(): void {
    if (!this.audioElement) return;

    // Clear any existing fade
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
    }

    const targetVolume = musicVolume.get();
    const steps = 20; // Number of fade steps
    const increment = targetVolume / steps;
    const duration = this.FADE_DURATION / steps;

    let currentStep = 0;
    this.audioElement.volume = 0;

    this.fadeInterval = window.setInterval(() => {
      currentStep++;
      this.audioElement!.volume = Math.min(targetVolume, currentStep * increment);

      if (currentStep >= steps) {
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
      }
    }, duration);
  }

  /**
   * Fade out volume
   */
  private fadeOut(callback?: () => void): void {
    if (!this.audioElement) return;

    // Clear any existing fade
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
    }

    const currentVolume = this.audioElement.volume;
    const steps = 20;
    const decrement = currentVolume / steps;
    const duration = this.FADE_DURATION / steps;

    let currentStep = 0;

    this.fadeInterval = window.setInterval(() => {
      currentStep++;
      this.audioElement!.volume = Math.max(0, currentVolume - (currentStep * decrement));

      if (currentStep >= steps) {
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
        callback?.();
      }
    }, duration);
  }

  /**
   * Change track (internal method)
   */
  private changeTrack(index: number): void {
    if (!this.audioElement) return;

    this.currentTrackIndex = index;
    this.loadTrack(index);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
    }

    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.remove();
      this.audioElement = null;
    }

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}

/**
 * Singleton instance
 */
let musicManager: BackgroundMusicManager | null = null;

/**
 * Get or create the music manager singleton
 */
export function getMusicManager(): BackgroundMusicManager {
  if (!musicManager) {
    musicManager = new BackgroundMusicManager();
    musicManager.initialize();
  }
  return musicManager;
}

/**
 * Convenience functions
 */
export function playBackgroundMusic(): void {
  getMusicManager().play();
}

export function pauseBackgroundMusic(): void {
  getMusicManager().pause();
}

export function stopBackgroundMusic(): void {
  getMusicManager().stop();
}

export function playMusicTrack(trackId: string): void {
  getMusicManager().playTrack(trackId);
}

export function nextMusicTrack(): void {
  getMusicManager().nextTrack();
}

export function previousMusicTrack(): void {
  getMusicManager().previousTrack();
}

export function shuffleMusicTrack(): void {
  getMusicManager().shuffleTrack();
}

export function getCurrentMusicTrack(): MusicTrack | null {
  return getMusicManager().getCurrentTrack();
}

export function isMusicPlaying(): boolean {
  return getMusicManager().getIsPlaying();
}

/**
 * Initialize music system
 * Call this during app initialization
 */
export function initializeMusic(): void {
  getMusicManager();
}
