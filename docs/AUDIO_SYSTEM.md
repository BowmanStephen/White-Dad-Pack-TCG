# Audio System Documentation

## Overview

DadDeck™ features a comprehensive audio system with separate controls for background music and sound effects.

## Architecture

### Sound Effects (SFX)
- **Location:** `src/stores/audio.ts`
- **Features:**
  - Pack tear sounds
  - Card reveal jingles (rarity-specific)
  - Card flip sounds
  - Layered audio support
  - Sound caching for instant playback

### Background Music
- **Location:** `src/lib/audio/music.ts`
- **Features:**
  - Looping ambient tracks
  - Volume control separate from SFX
  - Fade in/out transitions
  - Multiple track support with shuffle
  - Pause when tab inactive
  - Auto-resume when tab becomes visible

## Usage

### Playing Music

```typescript
import { playBackgroundMusic, pauseBackgroundMusic } from '@/lib/audio/music';

// Start playing background music
playBackgroundMusic();

// Pause with fade-out
pauseBackgroundMusic();

// Change to specific track
import { playMusicTrack } from '@/lib/audio/music';
playMusicTrack('ambient-chill');
```

### Track Management

```typescript
import {
  nextMusicTrack,
  previousMusicTrack,
  shuffleMusicTrack,
  getCurrentMusicTrack
} from '@/lib/audio/music';

// Play next track
nextMusicTrack();

// Play previous track
previousMusicTrack();

// Shuffle to random track
shuffleMusicTrack();

// Get current track info
const current = getCurrentMusicTrack();
console.log(`Now playing: ${current?.name}`);
```

### Volume Control

```typescript
import { setMusicVolume, setSfxVolume, setMasterVolume } from '@/stores/audio';

// Set music volume (0.0 to 1.0)
setMusicVolume(0.5);

// Set SFX volume (separate from music)
setSfxVolume(0.8);

// Set master volume (affects both)
setMasterVolume(0.7);
```

## Audio Files

### Required Music Files

Place music files in `/public/music/`:

- `ambient-main.mp3` - Main background track
- `ambient-chill.mp3` - Chill variant
- `ambient-upbeat.mp3` - Upbeat variant

### Required SFX Files

Place sound effects in `/public/sounds/`:

- `pack-tear.mp3` - Pack opening sound
- `reveal-common.mp3` - Common card reveal
- `reveal-uncommon.mp3` - Uncommon card reveal
- `reveal-rare.mp3` - Rare card reveal
- `reveal-epic.mp3` - Epic card reveal
- `reveal-legendary.mp3` - Legendary card reveal
- `reveal-mythic.mp3` - Mythic card reveal
- `card-flip.mp3` - Card flip sound

## Browser Autoplay Policies

The music system respects browser autoplay policies:

1. **No Auto-Play:** Music does not start automatically
2. **User Interaction Required:** Music starts after user clicks a button
3. **Tab Visibility:** Music pauses when tab is hidden
4. **Mute State:** Music respects global mute setting

## Implementation Details

### Background Music Manager

The music system uses a singleton pattern with the `BackgroundMusicManager` class:

- **Fade Duration:** 1 second (1000ms)
- **Loop Mode:** Enabled by default
- **Volume Control:** Separate from SFX volume
- **Visibility API:** Pauses when `document.hidden` is true

### Volume Architecture

```
Master Volume (0.7)
├── Music Volume (0.7) → 0.49 final
└── SFX Volume (0.8) → 0.56 final
```

Final volume = `master × musicVolume` (or `sfxVolume`)

## Future Enhancements

Potential improvements for the music system:

1. **Dynamic Music:** Change music based on game state (pack opening, collection view, etc.)
2. **Custom Playlists:** Allow users to create custom track playlists
3. **Audio Visualization:** Display music visualizer
4. **Crossfade:** Smooth crossfade between tracks
5. **Audio Analysis:** Beat detection for card reveal sync
6. **Seasonal Music:** Different tracks for holidays/events

## Troubleshooting

### Music Not Playing

1. Check if audio is muted: `import { muted } from '@/stores/audio'; console.log(muted.get());`
2. Check music volume: `import { musicVolume } from '@/stores/audio'; console.log(musicVolume.get());`
3. Verify music files exist in `/public/music/`
4. Check browser console for autoplay policy errors

### Stuttering Audio

1. Reduce fade duration in `BackgroundMusicManager.FADE_DURATION`
2. Check network tab for slow audio file loading
3. Consider using shorter audio files or lower bitrate

### Tab Visibility Issues

If music doesn't pause when switching tabs:

1. Check browser supports Page Visibility API
2. Verify event listener is attached: `document.addEventListener('visibilitychange', ...)`
3. Check console for visibility change logs

## See Also

- `src/stores/audio.ts` - SFX system and volume controls
- `src/components/audio/MusicInitializer.svelte` - Music system initialization
- `src/layouts/BaseLayout.astro` - App initialization point
