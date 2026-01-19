/**
 * SEO Utilities
 *
 * Helper functions for generating consistent SEO metadata across all pages.
 */

export const SEO_TITLE = 'DadDeck™ - The Ultimate White Dad Trading Card Simulator';
export const SEO_DESCRIPTION =
  'Open digital booster packs featuring dad stereotypes. Collect cards, trade with friends, and climb the global leaderboard! Free browser-based TCG simulator.';
export const SITE_NAME = 'DadDeck™';
export const SITE_URL = 'https://dadddeck.com';
export const OG_IMAGE = '/og-image.png';
export const TWITTER_HANDLE = '@daddieck';

/**
 * Page-specific SEO metadata
 */
export interface PageSEO {
  title: string;
  description: string;
  image?: string;
  canonicalURL?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

/**
 * Get full URL for a path
 */
export function getFullURL(path: string, siteURL: string = SITE_URL): string {
  return new URL(path, siteURL).href;
}

/**
 * Get full image URL
 */
export function getImageURL(imagePath: string, siteURL: string = SITE_URL): string {
  return new URL(imagePath, siteURL).href;
}

/**
 * Generate structured data for VideoGame pages
 */
export interface VideoGameSchema {
  name: string;
  url: string;
  description: string;
  image?: string;
}

export function generateVideoGameSchema(data: VideoGameSchema) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": data.name,
    "url": data.url,
    "description": data.description,
    "genre": ["Trading Card Game", "Casual", "Simulation"],
    "gamePlatform": "Web Browser",
    "applicationCategory": "Game",
    "operatingSystem": "Any",
    "playMode": "SinglePlayer",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250"
    },
    ...(data.image && { "image": data.image })
  };
}

/**
 * Generate structured data for CollectionPage
 */
export interface CollectionPageSchema {
  name: string;
  url: string;
  description: string;
}

export function generateCollectionPageSchema(data: CollectionPageSchema) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": data.name,
    "url": data.url,
    "description": data.description,
    "about": {
      "@type": "Thing",
      "name": "Trading Cards",
      "description": "Collectible dad-themed trading cards"
    }
  };
}

/**
 * Generate structured data for WebApplication
 */
export interface WebApplicationSchema {
  name: string;
  url: string;
  description: string;
  image?: string;
}

export function generateWebApplicationSchema(data: WebApplicationSchema) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": data.name,
    "url": data.url,
    "description": data.description,
    "applicationCategory": "GameApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250"
    },
    "browserRequirements": "Requires JavaScript. Compatible with all modern browsers.",
    "softwareVersion": "2.2.0",
    "author": {
      "@type": "Organization",
      "name": "DadDeck"
    },
    ...(data.image && { "image": data.image })
  };
}

/**
 * Generate structured data for BreadcrumbList
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}
