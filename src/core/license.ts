export type LicenseTier = 'free' | 'pro' | 'team';

/**
 * Manages tiered feature gating for Zenode.
 */
export class LicenseManager {
  private currentTier: LicenseTier = 'free';

  /**
   * Sets the license key. 
   * For Demo/Pro:
   * - Includes '-PRO-' -> Pro tier
   * - Includes '-TEAM-' -> Team tier
   */
  setLicense(key: string): void {
    if (key.includes('-PRO-')) {
      this.currentTier = 'pro';
    } else if (key.includes('-TEAM-')) {
      this.currentTier = 'team';
    } else {
      this.currentTier = 'free';
    }
  }

  isPro(): boolean {
    return this.currentTier === 'pro' || this.currentTier === 'team';
  }

  getTier(): LicenseTier {
    return this.currentTier;
  }
}
