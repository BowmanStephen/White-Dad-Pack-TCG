/**
 * Image Optimization Utilities
 *
 * Functions for optimizing images, lazy loading, and responsive image handling
 */

/**
 * Generate a responsive image source set for Astro <Image /> components
 *
 * @param src - The image source path
 * @param widths - Array of widths to generate (default: common breakpoints)
 * @returns A source set string for the srcset attribute
 *
 * @example
 * ```astro
 * <Image
 *   src={getImageSrcSet('/images/card.png', [400, 800, 1200])}
 *   sizes="(max-width: 768px) 100vw, 50vw"
 *   alt="Card"
 *   loading="lazy"
 * />
 * ```
 */
export function getOptimizedImageSrc(src: string, _width = 800, _quality = 80): string {
  // For static builds, Astro's Image component handles optimization
  // This function provides a consistent API for future CDN integration
  return src;
}

/**
 * Lazy load images using Intersection Observer
 *
 * @param selector - CSS selector for images to lazy load
 * @param rootMargin - Root margin for intersection observer (default: '50px')
 *
 * @example
 * ```ts
 * import { lazyLoadImages } from '@/lib/utils/image-optimization';
 *
 * // On mount in Svelte component
 * onMount(() => {
 *   lazyLoadImages('img[data-lazy]');
 * });
 * ```
 */
export function lazyLoadImages(
  selector: string = 'img[data-lazy]',
  rootMargin: string = '50px'
): void {
  // Check if browser supports Intersection Observer
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    // Fallback: load all images immediately
    document.querySelectorAll(selector).forEach(img => {
      const element = img as HTMLImageElement;
      if (element.dataset.src) {
        element.src = element.dataset.src;
        element.removeAttribute('data-src');
      }
    });
    return;
  }

  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;

          if (src) {
            img.src = src;
            img.removeAttribute('data-src');

            // Optional: Add fade-in animation
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease-in';

            // Trigger reflow to enable transition
            img.offsetHeight;

            img.style.opacity = '1';

            // Stop observing this image
            observer.unobserve(img);
          }
        }
      });
    },
    {
      rootMargin,
      // Load images when they're within 50px of viewport
    }
  );

  // Start observing images
  document.querySelectorAll(selector).forEach(img => {
    imageObserver.observe(img);
  });
}

/**
 * Generate a blur placeholder for slow-loading images
 *
 * @param color - Base color for placeholder (default: slate-800)
 * @returns A CSS background string
 *
 * @example
 * ```svelte
 * <style>
 *   .card-image {
 *     background: {blurPlaceholder()};
 *   }
 * </style>
 * ```
 */
export function blurPlaceholder(color: string = '#1e293b'): string {
  return `
    linear-gradient(90deg,
      ${color} 0px,
      ${color} 2px,
      transparent 2px,
      transparent 4px
    ),
    ${color}
  `;
}

/**
 * Preload critical images for faster initial render
 *
 * @param urls - Array of critical image URLs to preload
 *
 * @example
 * ```ts
 * import { preloadCriticalImages } from '@/lib/utils/image-optimization';
 *
 * // In your layout or page head
 * preloadCriticalImages([
 *   '/images/logo.png',
 *   '/images/hero-bg.jpg'
 * ]);
 * ```
 */
export function preloadCriticalImages(urls: string[]): void {
  if (typeof window === 'undefined') return;

  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;

    // Only append if not already present
    if (!document.querySelector(`link[href="${url}"][rel="preload"]`)) {
      document.head.appendChild(link);
    }
  });
}

/**
 * Get the optimal image format for the current browser
 *
 * @returns The best image format (webp, avif, or png)
 *
 * @example
 * ```ts
 * import { getOptimalFormat } from '@/lib/utils/image-optimization';
 *
 * const format = getOptimalFormat();
 * const imageUrl = `/images/card.${format}`;
 * ```
 */
export function getOptimalFormat(): 'webp' | 'avif' | 'png' {
  if (typeof window === 'undefined') return 'png';

  const canvas = document.createElement('canvas');

  // Check for AVIF support
  if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
    return 'avif';
  }

  // Check for WebP support
  if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
    return 'webp';
  }

  // Fallback to PNG
  return 'png';
}

/**
 * Debounce function for performance optimization
 *
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds (default: 100ms)
 * @returns Debounced function
 *
 * @example
 * ```svelte
 * import { debounce } from '@/lib/utils/image-optimization';
 *
 * const handleResize = debounce(() => {
 *   // Handle resize
 * }, 200);
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number = 100
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 *
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds (default: 100ms)
 * @returns Throttled function
 *
 * @example
 * ```svelte
 * import { throttle } from '@/lib/utils/image-optimization';
 *
 * const handleScroll = throttle(() => {
 *   // Handle scroll
 * }, 100);
 * ```
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number = 100
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
