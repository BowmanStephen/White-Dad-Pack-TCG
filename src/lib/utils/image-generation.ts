/**
 * Image Generation Utilities
 *
 * Functions for generating shareable card images using html2canvas
 */

import type { PackCard } from '../../types';
import { RARITY_CONFIG } from '../../types';
import DOMPurify from 'dompurify';

/**
 * Generate a high-resolution PNG image from a card element
 *
 * @param card - The card data (used for filename generation)
 * @param element - The DOM element to capture (should be the card container)
 * @param options - Optional configuration for image generation
 * @returns Promise<Blob> - The generated image as a PNG blob
 *
 * @example
 * ```svelte
 * <script>
 *   import { generateCardImage } from '@/lib/utils/image-generation';
 *   let cardElement;
 *
 *   async function downloadCard() {
 *     const blob = await generateCardImage(card, cardElement);
 *     const url = URL.createObjectURL(blob);
 *     const a = document.createElement('a');
 *     a.href = url;
 *     a.download = `${card.name.replace(/\s+/g, '_')}.png`;
 *     a.click();
 *   }
 * </script>
 *
 * <div bind:this={cardElement}>
 *   <Card {card} />
 * </div>
 * ```
 */
export async function generateCardImage(
  card: PackCard,
  element: HTMLElement,
  options: ImageGenerationOptions = {}
): Promise<Blob> {
  // Note: card parameter is used for filename generation in download/share functions
  // that call this function. Keeping it for API consistency.
  const {
    scale = 2, // 2x for retina displays
    backgroundColor = null, // Transparent background
    quality = 1,
  } = options;

  // Dynamically import html2canvas to avoid SSR issues
  const html2canvas = (await import('html2canvas')).default;

  // Capture the element as a canvas
  const canvas = await html2canvas(element, {
    scale,
    backgroundColor,
    logging: false,
    useCORS: true, // Allow loading cross-origin images
    allowTaint: true,
    imageTimeout: 5000, // 5 second timeout for image loading
  });

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image blob'));
        }
      },
      'image/png',
      quality
    );
  });
}

/**
 * Download a card image as a PNG file
 *
 * @param card - The card data (used for filename)
 * @param element - The DOM element to capture
 * @param options - Optional configuration for image generation
 */
export async function downloadCardImage(
  card: PackCard,
  element: HTMLElement,
  options?: ImageGenerationOptions
): Promise<void> {
  const blob = await generateCardImage(card, element, options);
  const url = URL.createObjectURL(blob);

  // Create a temporary link to trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = generateCardFilename(card);
  link.click();

  // Clean up the object URL
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Share a card image using the Web Share API (if available)
 *
 * @param card - The card data (used for filename and share text)
 * @param element - The DOM element to capture
 * @param options - Optional configuration for image generation and sharing
 * @returns Promise<boolean> - True if share was successful, false if not supported
 */
export async function shareCardImage(
  card: PackCard,
  element: HTMLElement,
  options: ShareOptions = {}
): Promise<boolean> {
  const { shareText = generateShareText(card), shareTitle = 'DadDeck™ Card' } = options;

  // Check if Web Share API is supported
  if (!navigator.share) {
    return false;
  }

  try {
    const blob = await generateCardImage(card, element, options.imageGeneration);
    const file = new File([blob], generateCardFilename(card), { type: 'image/png' });

    await navigator.share({
      title: shareTitle,
      text: shareText,
      files: [file],
    });

    return true;
  } catch (error) {
    // User cancelled the share or there was an error
    console.error('Share failed:', error);
    return false;
  }
}

/**
 * Generate a filename for a card image
 *
 * @param card - The card data
 * @returns A sanitized filename (e.g., "Grillmaster_Gary-Rare.png")
 */
export function generateCardFilename(card: PackCard): string {
  const rarityName = RARITY_CONFIG[card.rarity].name;
  const sanitizedName = card.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
  return `${sanitizedName}-${rarityName}.png`;
}

/**
 * Generate share text for social media
 *
 * @param card - The card data
 * @returns A shareable text string
 */
export function generateShareText(card: PackCard): string {
  const rarityName = RARITY_CONFIG[card.rarity].name;
  // Calculate stars based on rarity (1 for common, 6 for mythic)
  const starMap: Record<string, number> = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
    mythic: 6,
  };
  const stars = '★'.repeat(starMap[card.rarity] || 1);
  return `I just pulled a ${rarityName} ${stars} ${card.name} in DadDeck™! 🎴👔\n\nOpen your free pack at dadddeck.com`;
}

/**
 * Check if the browser supports the required APIs for image sharing
 *
 * @returns An object indicating which features are supported
 */
export function checkShareSupport(): ShareSupport {
  // Check if we're in a browser environment (not SSR)
  const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';

  return {
    webShareAPI: isBrowser && 'share' in navigator,
    canvasAPI: isBrowser && typeof HTMLCanvasElement !== 'undefined',
    toBlob: isBrowser && typeof HTMLCanvasElement !== 'undefined' && typeof HTMLCanvasElement.prototype.toBlob === 'function',
    webShareFiles: isBrowser && 'canShare' in navigator,
  };
}

/**
 * Options for image generation
 */
export interface ImageGenerationOptions {
  /**
   * Scale factor for the generated image (default: 2 for retina displays)
   * Higher values produce larger, higher-quality images
   */
  scale?: number;

  /**
   * Background color for the image (default: null for transparent)
   * Use 'transparent' or null for a transparent background
   * Use a hex color like '#ffffff' for a solid background
   */
  backgroundColor?: string | null;

  /**
   * Image quality for lossy formats (0-1, default: 1)
   * Note: PNG is lossless, so this may not affect output
   */
  quality?: number;
}

/**
 * Options for sharing
 */
export interface ShareOptions {
  /**
   * Text to include in the share
   */
  shareText?: string;

  /**
   * Title for the share
   */
  shareTitle?: string;

  /**
   * Options for image generation
   */
  imageGeneration?: ImageGenerationOptions;
}

/**
 * Support information for sharing features
 */
export interface ShareSupport {
  /** Whether the Web Share API is supported */
  webShareAPI: boolean;

  /** Whether the Canvas API is supported */
  canvasAPI: boolean;

  /** Whether canvas.toBlob() is supported */
  toBlob: boolean;

  /** Whether navigator.canShare() is supported (for file sharing) */
  webShareFiles: boolean;
}

/**
 * Options for pack image generation
 */
export interface PackImageGenerationOptions {
  /**
   * Width of the generated image (default: 1200)
   */
  width?: number;

  /**
   * Height of the generated image (default: 675)
   */
  height?: number;

  /**
   * Background color for the collage (default: '#0f172a' - slate-900)
   */
  backgroundColor?: string;

  /**
   * Whether to include the DadDeck™ branding (default: true)
   */
  includeBranding?: boolean;

  /**
   * Custom logo URL (default: uses public/logo.png)
   */
  logoUrl?: string;
}

/**
 * Generate a high-resolution pack collage image
 *
 * Creates a grid layout of all cards in the pack with DadDeck™ branding,
 * optimized for sharing on social media platforms (Twitter/X, Discord).
 *
 * @param cards - Array of PackCard objects to include in the collage
 * @param options - Optional configuration for image generation
 * @returns Promise<Blob> - The generated collage image as a PNG blob
 *
 * @example
 * ```svelte
 * <script>
 *   import { generatePackImage, downloadPackImage, sharePackImage } from '@/lib/utils/image-generation';
 *
 *   async function handleSharePack() {
 *     // Share using Web Share API (if available)
 *     const success = await sharePackImage(pack.cards);
 *     if (!success) {
 *       // Fallback to download
 *       await downloadPackImage(pack.cards);
 *     }
 *   }
 * </script>
 * ```
 */
export async function generatePackImage(
  cards: PackCard[],
  options: PackImageGenerationOptions = {}
): Promise<Blob> {
  const {
    width = 1200,
    height = 675,
    backgroundColor = '#0f172a',
    includeBranding = true,
    logoUrl = '/logo.png',
  } = options;

  // Dynamically import html2canvas to avoid SSR issues
  const html2canvas = (await import('html2canvas')).default;

  // Create a temporary container for the collage
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.backgroundColor = backgroundColor;
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  container.style.padding = '40px';
  container.style.boxSizing = 'border-box';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';

  // Build the collage HTML
  // Note: We use DOMPurify to sanitize the HTML before setting innerHTML.
  // The card data comes from our internal database, not user input,
  // but sanitization provides defense-in-depth security.
  let collageHTML = '';

  // Add branding section
  if (includeBranding) {
    collageHTML += `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <img src="${logoUrl}" alt="DadDeck™" style="width: 60px; height: 60px; object-fit: contain;" onerror="this.style.display='none'">
          <div>
            <div style="font-size: 32px; font-weight: 900; color: #ffffff; letter-spacing: -1px; line-height: 1;">DadDeck™</div>
            <div style="font-size: 14px; color: #94a3b8; font-weight: 500; letter-spacing: 0.05em;">THE WHITE DAD TRADING CARD SIMULATOR</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 12px; color: #64748b; font-weight: 600; letter-spacing: 0.1em;">PACK OPENING</div>
          <div style="font-size: 14px; color: #ffffff; font-weight: 700;">${cards.length} CARDS</div>
        </div>
      </div>
    `;
  }

  // Calculate grid layout
  const isSevenCards = cards.length === 7;
  const gridCols = isSevenCards ? 4 : 3;
  const gridRows = isSevenCards ? 2 : 2;
  const cardWidth = isSevenCards ? 250 : 340;
  const cardHeight = Math.round(cardWidth * 1.4); // Standard card ratio
  const gap = 20;

  // Determine best card for highlight
  const rarityOrder: Record<string, number> = { mythic: 6, legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
  const sortedCards = [...cards].sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);
  const bestCard = sortedCards[0];
  const bestRarityConfig = RARITY_CONFIG[bestCard.rarity];

  // Add best card highlight
  collageHTML += `
    <div style="display: flex; gap: 25px; margin-bottom: 25px; align-items: center;">
      <div style="flex-shrink: 0; width: ${cardWidth}px; height: ${cardHeight}px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden; background: linear-gradient(135deg, ${bestRarityConfig.color}44, ${bestRarityConfig.color}11); border: 3px solid ${bestRarityConfig.color}; box-shadow: 0 0 40px ${bestRarityConfig.glowColor};">
        ${bestCard.isHolo ? '<div style="position: absolute; inset: 0; background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%);"></div>' : ''}
        <div style="font-size: 80px;">${getDadTypeIcon(bestCard.type)}</div>
        <div style="text-align: center; padding: 0 15px; margin-top: 10px;">
          <div style="font-size: 11px; font-weight: 900; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.1em; background: ${bestRarityConfig.color}22; color: ${bestRarityConfig.color}; border: 1px solid ${bestRarityConfig.color}44;">${bestRarityConfig.name}${bestCard.isHolo ? ' ✨ HOLO' : ''}</div>
          <div style="font-size: 22px; font-weight: 900; color: #ffffff; line-height: 1.2;">${bestCard.name}</div>
        </div>
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: 11px; font-weight: 900; color: #64748b; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 10px;">Best Pull</div>
        <div style="font-size: 28px; font-weight: 900; color: ${bestRarityConfig.color}; line-height: 1.2; margin-bottom: 8px;">${bestCard.name}</div>
        <div style="font-size: 14px; color: #94a3b8; line-height: 1.4;">${bestCard.subtitle}</div>
        ${bestCard.flavorText ? `<div style="margin-top: 12px; padding: 10px 14px; background: rgba(255,255,255,0.05); border-left: 3px solid ${bestRarityConfig.color}; border-radius: 0 8px 8px 0; font-size: 12px; color: #cbd5e1; font-style: italic; line-height: 1.4;">"${bestCard.flavorText}"</div>` : ''}
      </div>
    </div>
  `;

  // Add card grid
  collageHTML += `
    <div style="display: grid; grid-template-columns: repeat(${gridCols}, ${cardWidth}px); grid-template-rows: repeat(${gridRows}, ${cardHeight}px); gap: ${gap}px; justify-content: center; flex: 1;">
  `;

  sortedCards.forEach((card) => {
    const rarityConfig = RARITY_CONFIG[card.rarity];
    collageHTML += `
      <div style="border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden; background: linear-gradient(135deg, ${rarityConfig.color}44, ${rarityConfig.color}11); border: 2px solid ${rarityConfig.color}66; box-shadow: 0 0 20px ${rarityConfig.glowColor}22;">
        ${card.isHolo ? '<div style="position: absolute; inset: 0; background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%);"></div>' : ''}
        <div style="font-size: 48px;">${getDadTypeIcon(card.type)}</div>
        <div style="text-align: center; padding: 0 10px; margin-top: 6px;">
          <div style="font-size: 9px; font-weight: 900; padding: 2px 8px; border-radius: 10px; display: inline-block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; background: ${rarityConfig.color}22; color: ${rarityConfig.color}; border: 1px solid ${rarityConfig.color}44;">${rarityConfig.name}</div>
          <div style="font-size: 13px; font-weight: 900; color: #ffffff; line-height: 1.1;">${card.name}</div>
        </div>
        ${card.isHolo ? '<div style="position: absolute; top: 6px; left: 6px; font-size: 8px; padding: 2px 6px; background: rgba(236, 72, 153, 0.2); color: #f472b6; border-radius: 4px; font-weight: 900; font-style: italic;">HOLO</div>' : ''}
      </div>
    `;
  });

  collageHTML += '</div>';

  // Add footer
  if (includeBranding) {
    collageHTML += `
      <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 12px; color: #64748b; font-weight: 600;">Open your free pack at</div>
        <div style="font-size: 14px; color: #ffffff; font-weight: 700;">dadddeck.com</div>
      </div>
    `;
  }

  // Sanitize HTML before setting innerHTML
  container.innerHTML = DOMPurify.sanitize(collageHTML, {
    ALLOWED_TAGS: ['div', 'img', 'span', 'style'],
    ALLOWED_ATTR: ['style', 'src', 'alt', 'class', 'onerror'],
    ALLOW_DATA_ATTR: false,
  });

  // Add to DOM temporarily
  document.body.appendChild(container);

  try {
    // Capture the container as a canvas
    const canvas = await html2canvas(container, {
      scale: 1,
      backgroundColor,
      logging: false,
      useCORS: true,
      allowTaint: true,
      imageTimeout: 5000,
      width,
      height,
    });

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate pack image blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
}

/**
 * Helper function to get dad type icon (emoji)
 */
function getDadTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    BBQ_DAD: '🔥',
    FIX_IT_DAD: '🛠️',
    GOLF_DAD: '🏌️',
    COUCH_DAD: '📺',
    LAWN_DAD: '🌱',
    CAR_DAD: '🚗',
    OFFICE_DAD: '👔',
    COOL_DAD: '🎸',
    COACH_DAD: '🎒',
    CHEF_DAD: '👨‍🍳',
    HOLIDAY_DAD: '🎄',
    WAREHOUSE_DAD: '📦',
    VINTAGE_DAD: '🔧',
    FASHION_DAD: '👟',
    TECH_DAD: '💻',
    ITEM: '🎁',
  };
  return icons[type] || '🎴';
}

/**
 * Download a pack collage image as a PNG file
 *
 * @param cards - Array of PackCard objects to include in the collage
 * @param options - Optional configuration for image generation
 */
export async function downloadPackImage(
  cards: PackCard[],
  options: PackImageGenerationOptions = {}
): Promise<void> {
  const blob = await generatePackImage(cards, options);
  const url = URL.createObjectURL(blob);

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `daddeck-pack-${timestamp}.png`;

  // Create a temporary link to trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  // Clean up the object URL
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Share a pack collage image using the Web Share API (if available)
 *
 * @param cards - Array of PackCard objects to include in the collage
 * @param options - Optional configuration for image generation and sharing
 * @returns Promise<boolean> - True if share was successful, false if not supported
 */
export async function sharePackImage(
  cards: PackCard[],
  options: PackShareOptions = {}
): Promise<boolean> {
  const { shareText, shareTitle = 'DadDeck™ Pack Pull' } = options;

  // Check if Web Share API is supported
  if (!navigator.share) {
    return false;
  }

  try {
    const blob = await generatePackImage(cards, options.imageGeneration);
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const filename = `daddeck-pack-${timestamp}.png`;
    const file = new File([blob], filename, { type: 'image/png' });

    // Generate share text if not provided
    const bestCard = [...cards].sort((a, b) => {
      const rarityOrder: Record<string, number> = { mythic: 6, legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
      return rarityOrder[b.rarity] - rarityOrder[a.rarity];
    })[0];

    const defaultShareText = `I just opened a DadDeck™ pack and pulled a ${RARITY_CONFIG[bestCard.rarity].name} ${bestCard.name}! 🎴✨\n\nOpen your free pack at:`;

    await navigator.share({
      title: shareTitle,
      text: shareText || defaultShareText,
      files: [file],
    });

    return true;
  } catch (error) {
    // User cancelled the share or there was an error
    console.error('Share failed:', error);
    return false;
  }
}

/**
 * Options for pack sharing
 */
export interface PackShareOptions {
  /**
   * Text to include in the share
   */
  shareText?: string;

  /**
   * Title for the share
   */
  shareTitle?: string;

  /**
   * Options for image generation
   */
  imageGeneration?: PackImageGenerationOptions;
}

/**
 * Share content to Twitter/X using the Twitter Web Intent API
 *
 * Opens a new tab/window with the Twitter compose interface pre-filled
 * with the specified text and URL. Note: Twitter Web Intent does not
 * support directly attaching images via URL - images must be uploaded
 * through Twitter's interface or API.
 *
 * @param text - The tweet text (will be URL-encoded)
 * @param imageUrl - Optional image URL to include in tweet (Twitter will attempt to fetch and attach)
 * @param url - Optional URL to share (defaults to current origin)
 *
 * @example
 * ```typescript
 * import { shareToTwitter } from '@/lib/utils/image-generation';
 *
 * // Share a card pull
 * shareToTwitter('Just pulled a Mythic Grillmaster Gary! 🎴', 'https://example.com/card.png');
 *
 * // Share with custom URL
 * shareToTwitter('Check out this pack!', 'https://example.com/pack.png', 'https://dadddeck.com');
 * ```
 */
export function shareToTwitter(text: string, _imageUrl?: string, url?: string): void {
  // Build the Twitter Intent URL
  const tweetUrl = url || window.location.origin;
  let intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(tweetUrl)}`;

  // Note: Twitter Web Intent doesn't support direct image URL attachment.
  // The imageUrl parameter is included for future API integration or as a reference.
  // For actual image sharing, users would need to:
  // 1. Use the Web Share API (navigator.share) with files
  // 2. Upload images to a service and use Twitter's API with media_ids
  // 3. Manually attach images after the intent opens

  // Open in new tab/window
  window.open(intentUrl, '_blank', 'noopener,noreferrer,width=550,height=420');
}
