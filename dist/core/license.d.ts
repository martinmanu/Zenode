export type LicenseTier = 'free' | 'pro' | 'team';
/**
 * Manages tiered feature gating for Zenode.
 */
export declare class LicenseManager {
    private currentTier;
    /**
     * Sets the license key.
     * For Demo/Pro:
     * - Includes '-PRO-' -> Pro tier
     * - Includes '-TEAM-' -> Team tier
     */
    setLicense(key: string): void;
    isPro(): boolean;
    getTier(): LicenseTier;
}
