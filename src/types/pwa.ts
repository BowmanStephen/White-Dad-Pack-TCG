// ============================================================================
// PWA INSTALL TYPES (PWA-001 - PWA Install Prompt)
// ============================================================================

// PWA install prompt event (Chrome/Edge specific)
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<{
    outcome: 'accepted' | 'dismissed';
  }>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
  }>;
}

// PWA install state
export interface PWAInstallState {
  isInstallable: boolean;          // Whether PWA can be installed
  isInstalled: boolean;            // Whether PWA is installed
  visitCount: number;              // Number of visits
  dismissed: boolean;              // Whether user dismissed prompt
}

// PWA install tracking (analytics)
export interface PWAInstallTracking {
  promptedAt?: Date;               // When prompt was shown
  installedAt?: Date;              // When PWA was installed
  dismissedAt?: Date;              // When user dismissed
  visitCountAtPrompt: number;      // Visit count when prompted
}
