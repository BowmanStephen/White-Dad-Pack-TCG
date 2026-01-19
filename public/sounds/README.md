# Sound Effects Directory

This directory contains sound effects for the DadDeck pack opening experience.

## Required Audio Files

### Pack Opening Sounds
- `pack-tear.mp3` - Sound when the pack tears open (0.5-1s)
  - Description: Paper tearing / ripping sound
  - Suggested: Short crisp tear with slight "whoosh"

### Card Reveal Sounds (Rarity-based)
- `reveal-common.mp3` - Common card reveal (0.5s)
  - Description: Simple flip/click sound
  - Pitch: Low to medium

- `reveal-uncommon.mp3` - Uncommon card reveal (0.5s)
  - Description: Flip sound with slight shimmer
  - Pitch: Medium

- `reveal-rare.mp3` - Rare card reveal (0.75s)
  - Description: Flip with metallic "ting"
  - Pitch: Medium-high

- `reveal-epic.mp3` - Epic card reveal (0.75s)
  - Description: Flip with magical sparkle
  - Pitch: High

- `reveal-legendary.mp3` - Legendary card reveal (1s)
  - Description: Dramatic reveal with chord/impact
  - Pitch: Very high with echo

- `reveal-mythic.mp3` - Mythic card reveal (1s)
  - Description: Epic reveal with full chord sweep
  - Pitch: Highest with prismatic effect

### Card Flip Sound
- `card-flip.mp3` - General card flip (0.3s)
  - Description: Quick card flip/click sound
  - Used for manual navigation between revealed cards

## Audio Specifications

- **Format**: MP3 (preferred) or OGG
- **Bitrate**: 128 kbps (balance quality/file size)
- **Sample Rate**: 44.1 kHz
- **Channels**: Stereo
- **Duration**: 0.3-1 second each
- **Volume**: Normalized to -3dB peak

## Creating Placeholder Sounds

If you have ffmpeg installed, you can generate simple placeholder sounds:

```bash
# Generate pack tear sound (white noise burst)
ffmpeg -f lavfi -i "anoisesrc=duration=0.8:color=white:amplitude=0.5" -af "highpass=f=500,lowpass=f=3000" pack-tear.mp3

# Generate reveal sounds (sine wave at different pitches)
ffmpeg -f lavfi -i "sine=frequency=440:duration=0.5" reveal-common.mp3
ffmpeg -f lavfi -i "sine=frequency=523:duration=0.5" reveal-uncommon.mp3
ffmpeg -f lavfi -i "sine=frequency=659:duration=0.75" reveal-rare.mp3
ffmpeg -f lavfi -i "sine=frequency=784:duration=0.75" reveal-epic.mp3
ffmpeg -f lavfi -i "sine=frequency=880:duration=1" reveal-legendary.mp3
ffmpeg -f lavfi -i "sine=frequency=1047:duration=1" reveal-mythic.mp3
ffmpeg -f lavfi -i "sine=frequency=600:duration=0.3" card-flip.mp3
```

## License Note

These sound effects should be either:
1. Original compositions
2. Licensed under appropriate terms
3. Public domain / Creative Commons

For MVP development, placeholder sounds are acceptable.
