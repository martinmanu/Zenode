/**
 * Manages tiered feature gating for Zenode.
 */
class LicenseManager {
    constructor() {
        this.currentTier = 'free';
    }
    /**
     * Sets the license key.
     * For Demo/Pro:
     * - Includes '-PRO-' -> Pro tier
     * - Includes '-TEAM-' -> Team tier
     */
    setLicense(key) {
        if (key.includes('-PRO-')) {
            this.currentTier = 'pro';
        }
        else if (key.includes('-TEAM-')) {
            this.currentTier = 'team';
        }
        else {
            this.currentTier = 'free';
        }
    }
    isPro() {
        return this.currentTier === 'pro' || this.currentTier === 'team';
    }
    getTier() {
        return this.currentTier;
    }
}

export { LicenseManager };
//# sourceMappingURL=license.js.map
