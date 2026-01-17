#!/bin/bash
# Generate placeholder audio files for DadDeck sound effects
# Requires: ffmpeg

SOUNDS_DIR="public/sounds"

# Create sounds directory if it doesn't exist
mkdir -p "$SOUNDS_DIR"

echo "Generating placeholder audio files..."

# Pack tear sound (white noise burst with envelope)
ffmpeg -f lavfi -i "anoisesrc=duration=0.8:color=white:sample_rate=44100" \
  -af "highpass=f=500,lowpass=f=3000,volume=0.3" \
  -y "$SOUNDS_DIR/pack-tear.mp3" 2>/dev/null

# Common reveal (low pitch sine)
ffmpeg -f lavfi -i "sine=frequency=440:duration=0.5:sample_rate=44100" \
  -af "volume=0.4" \
  -y "$SOUNDS_DIR/reveal-common.mp3" 2>/dev/null

# Uncommon reveal (medium-low pitch)
ffmpeg -f lavfi -i "sine=frequency=523:duration=0.5:sample_rate=44100" \
  -af "volume=0.4" \
  -y "$SOUNDS_DIR/reveal-uncommon.mp3" 2>/dev/null

# Rare reveal (medium pitch)
ffmpeg -f lavfi -i "sine=frequency=659:duration=0.75:sample_rate=44100" \
  -af "volume=0.5" \
  -y "$SOUNDS_DIR/reveal-rare.mp3" 2>/dev/null

# Epic reveal (medium-high pitch)
ffmpeg -f lavfi -i "sine=frequency=784:duration=0.75:sample_rate=44100" \
  -af "volume=0.5" \
  -y "$SOUNDS_DIR/reveal-epic.mp3" 2>/dev/null

# Legendary reveal (high pitch)
ffmpeg -f lavfi -i "sine=frequency=880:duration=1:sample_rate=44100" \
  -af "volume=0.6" \
  -y "$SOUNDS_DIR/reveal-legendary.mp3" 2>/dev/null

# Mythic reveal (very high pitch)
ffmpeg -f lavfi -i "sine=frequency=1047:duration=1:sample_rate=44100" \
  -af "volume=0.6" \
  -y "$SOUNDS_DIR/reveal-mythic.mp3" 2>/dev/null

# Card flip (quick click)
ffmpeg -f lavfi -i "sine=frequency=600:duration=0.3:sample_rate=44100" \
  -af "volume=0.3" \
  -y "$SOUNDS_DIR/card-flip.mp3" 2>/dev/null

echo "Done! Audio files generated in $SOUNDS_DIR"
echo "Note: These are simple placeholder sounds. Replace with professional audio for production."
