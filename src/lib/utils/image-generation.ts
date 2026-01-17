/**
 * Image Generation Utilities
 *
 * Functions for generating shareable card images using html2canvas
 */

import type { PackCard } from '../../types';
import { RARITY_CONFIG } from '../../types';

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
  return {
    webShareAPI: typeof navigator !== 'undefined' && 'share' in navigator,
    canvasAPI: typeof HTMLCanvasElement !== 'undefined',
    toBlob: typeof HTMLCanvasElement.prototype.toBlob === 'function',
    webShareFiles: typeof navigator !== 'undefined' && 'canShare' in navigator,
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
