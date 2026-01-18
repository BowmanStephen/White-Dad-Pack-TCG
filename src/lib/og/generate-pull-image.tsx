import satori from 'satori';
import { join } from 'path';
import type { Pack, Card } from '../../types';

// Satori dimensions
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

// DadDeck brand colors
const COLORS = {
  background: '#0f172a', // slate-900
  accent: '#f59e0b', // amber-500
  text: '#ffffff',
  subtext: '#94a3b8', // slate-400
  rare: '#eab308', // gold
  epic: '#a855f7', // purple
  legendary: '#f97316', // orange
  mythic: '#ec4899', // pink
};

// Font configuration
const fontData = {
  name: 'Inter',
  data: Buffer.from(
    await fetch('https://cdn.jsdelivr.net/npm/source-sans-pro@14.0.0/source-sans-pro-v14-latin-regular.ttf')
  ).then(res => res.arrayBuffer()
  )
};

// Rarity border colors
const RARITY_COLORS = {
  common: '#9ca3af',
  uncommon: '#3b82f6',
  rare: '#eab308',
  epic: '#a855f7',
  legendary: '#f97316',
  mythic: '#ec4899'
};

/**
 * Generate dynamic OG image for a pack pull
 * Creates a 1200x630px image optimized for social media sharing
 */
export async function generatePullOGImage(
  pack: Pack,
  bestCard: Card
): Promise<{ success: boolean; imagePath?: string; error?: string }> {
  try {
    // Convert card image to base64 for inline rendering
    let cardImageData = '';
    
    try {
      // Try to read card artwork from public directory
      const fs = await import('fs/promises');
      const cardImagePath = join(process.cwd(), 'public', bestCard.artwork.replace(/^\//, ''));
      
      if (await fs.access(cardImagePath).then(() => true).catch(() => false)) {
        const cardImage = await fs.readFile(cardImagePath);
        const base64Card = cardImage.toString('base64');
        
        // Determine content type
        const ext = cardImagePath.split('.').pop().toLowerCase();
        const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
        
        cardImageData = `data:${contentType};base64,${base64Card}`;
      }
    } catch (error) {
      console.warn('Could not load card image, using placeholder:', error);
    }

    // Calculate rarity border color
    const rarityColor = RARITY_COLORS[bestCard.rarity] || RARITY_COLORS.common;

    // Create SVG element for Satori
    const element = (
      <div style={{
        width: OG_WIDTH,
        height: OG_HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background,
        fontFamily: 'Inter',
        padding: '40px',
      }}>
        {/* Top branding */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '32px',
        }}>
          <div style={{
            fontSize: '72px',
            fontWeight: '900',
            fill: COLORS.text,
            fontFamily: 'Inter',
            letterSpacing: '-0.5px',
          }}>
            DADDECK™
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: '600',
            fill: COLORS.subtext,
            fontFamily: 'Inter',
            letterSpacing: '0.25px',
          }}>
            THE WHITE DAD TRADING CARD SIMULATOR
          </div>
        </div>

        {/* Card display */}
        <div style={{
          position: 'relative',
          width: '400px',
          height: '550px',
          border: `4px solid ${rarityColor}`,
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: `0 10px 25px ${COLORS.background}`,
        }}>
          {/* Card background/gradient */}
          <div style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            background: `linear-gradient(135deg, ${COLORS.accent}33, ${rarityColor}11)`,
            opacity: 0.2,
          }} />

          {/* Card image or placeholder */}
          {cardImageData ? (
            <img
              src={cardImageData}
              alt={bestCard.name}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '20px',
              }}
            />
          ) : (
            <div style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: COLORS.background,
              color: COLORS.subtext,
              fontSize: '18px',
              fontWeight: '600',
            }}>
              <div>
                {bestCard.name}
              </div>
            </div>
          )}

          {/* Card details */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '0',
            right: '0',
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(8px)',
            borderRadius: '12px',
          }}>
            {/* Dad type badge */}
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: COLORS.text,
              backgroundColor: rarityColor,
              padding: '6px 12px',
              borderRadius: '6px',
              marginBottom: '8px',
            }}>
              {bestCard.type}
            </div>

            {/* Stats row */}
            <div style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
            }}>
              <div style={{ fontSize: '14px', color: COLORS.subtext }}>
                <strong>DJ:</strong> {bestCard.stats.dadJoke}
              </div>
              <div style={{ fontSize: '14px', color: COLORS.subtext }}>
                <strong>Grill:</strong> {bestCard.stats.grillSkill}
              </div>
            </div>

            {/* Rarity badge */}
            <div style={{
              marginTop: '8px',
              padding: '8px 16px',
              backgroundColor: rarityColor,
              borderRadius: '9999px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '700',
              textTransform: 'uppercase',
            }}>
              {bestCard.rarity}
            </div>
          </div>

          {/* Holo indicator */}
          {bestCard.isHolo && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: '#fbbf24',
              color: 'white',
              fontSize: '10px',
              fontWeight: '700',
              padding: '4px 8px',
              borderRadius: '9999px',
            }}>
              HOLO
            </div>
          )}
        </div>

        {/* Pull info */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          marginTop: '32px',
          padding: '16px 32px',
          background: 'rgba(0, 0, 0, 0.05)',
          borderRadius: '16px',
          border: `2px dashed ${COLORS.subtext}`,
        }}>
          <div style={{
            fontSize: '16px',
            color: COLORS.subtext,
            fontWeight: '600',
            textAlign: 'center',
            lineHeight: '1.5',
          }}>
            Pull #{pack.metadata.totalPacksOpened}
          </div>
          <div style={{
            fontSize: '14px',
            color: COLORS.subtext,
            fontWeight: '400',
            textAlign: 'center',
          }}>
            <div style={{ fontWeight: '600' }}>
              Best Card:
            </div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: COLORS.accent }}>
              {bestCard.name}
            </div>
            <div style={{
              fontSize: '12px',
              color: COLORS.subtext,
              marginTop: '4px',
            }}>
              {bestCard.type} • {bestCard.rarity}
            </div>
          </div>
        </div>

        {/* Bottom branding */}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            fill: COLORS.accent,
            fontFamily: 'Inter',
            letterSpacing: '-0.25px',
          }}>
            🎴 daddeck.app
          </div>
          <div style={{
            fontSize: '14px',
            fontWeight: '500',
            fill: COLORS.subtext,
            fontFamily: 'Inter',
            letterSpacing: '0.1px',
          }}>
            Open Your Free Pack Today
          </div>
        </div>
      </div>
    );

    // Render to SVG with Satori
    const svg = await satori(element, {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fonts: [fontData],
    });

    // Convert to PNG
    const { default: resvg } = await import('satori/resvg');
    const png = resvg(svg);

    // Generate unique filename
    const filename = `pull-${pack.id}-${Date.now()}.png`;
    const publicDir = join(process.cwd(), 'public', 'shares');
    const outputPath = join(publicDir, filename);

    // Write file
    const fs = await import('fs/promises');
    await fs.mkdir(publicDir, { recursive: true }).catch(() => {});
    await fs.writeFile(outputPath, png);

    return {
      success: true,
      imagePath: `/shares/${filename}`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate OG image'
    };
  }
}
