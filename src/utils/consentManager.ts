// GDPR Consent Management Utility

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface ConsentData {
  preferences: CookiePreferences;
  timestamp: string;
  version: string;
}

class ConsentManager {
  private static instance: ConsentManager;
  private consent: ConsentData | null = null;

  private constructor() {
    this.loadConsent();
  }

  public static getInstance(): ConsentManager {
    if (!ConsentManager.instance) {
      ConsentManager.instance = new ConsentManager();
    }
    return ConsentManager.instance;
  }

  private loadConsent(): void {
    try {
      const consentString = localStorage.getItem('cookieConsent');
      if (consentString) {
        this.consent = JSON.parse(consentString);
      }
    } catch (error) {
      console.error('Error loading cookie consent:', error);
      this.consent = null;
    }
  }

  public getConsent(): ConsentData | null {
    return this.consent;
  }

  public hasConsent(): boolean {
    return this.consent !== null;
  }

  public hasAnalyticsConsent(): boolean {
    return this.consent?.preferences.analytics || false;
  }

  public hasMarketingConsent(): boolean {
    return this.consent?.preferences.marketing || false;
  }

  public updateConsent(preferences: CookiePreferences): void {
    const consentData: ConsentData = {
      preferences,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
    
    this.consent = consentData;
    localStorage.setItem('cookieConsent', JSON.stringify(consentData));
    
    // Apply consent changes immediately
    this.applyConsent();
  }

  public revokeConsent(): void {
    const minimumConsent: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    
    this.updateConsent(minimumConsent);
  }

  public applyConsent(): void {
    if (!this.consent) return;

    // Handle Google Analytics
    if (this.consent.preferences.analytics) {
      this.enableGoogleAnalytics();
    } else {
      this.disableGoogleAnalytics();
    }

    // Handle other tracking services as needed
    if (!this.consent.preferences.marketing) {
      this.disableMarketingCookies();
    }
  }

  private enableGoogleAnalytics(): void {
    if (typeof window !== 'undefined' && window.gtag) {
      // Enable Google Analytics tracking
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: this.consent?.preferences.marketing ? 'granted' : 'denied',
      });
    }
  }

  private disableGoogleAnalytics(): void {
    if (typeof window !== 'undefined' && window.gtag) {
      // Disable Google Analytics tracking
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
      });
    }
  }

  private disableMarketingCookies(): void {
    // Clear marketing-related cookies
    const marketingCookies = ['_fbp', '_fbc', '__utma', '__utmb', '__utmc', '__utmt', '__utmz'];
    
    marketingCookies.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    });
  }

  public getCookiePolicy(): string {
    return `
      This website uses cookies to enhance your browsing experience and provide personalized content.
      
      **Cookie Categories:**
      
      1. **Necessary Cookies**: Essential for basic website functionality, security, and authentication.
      2. **Analytics Cookies**: Help us understand website usage through Google Analytics.
      3. **Marketing Cookies**: Used for advertising and remarketing purposes.
      
      **Your Rights:**
      You can manage your cookie preferences at any time through your browser settings or our cookie consent banner.
      
      **Data Retention:**
      Cookie preferences are stored locally and retained until you clear your browser data or change your preferences.
    `;
  }

  public getDataProcessingInfo(): string {
    return `
      **Lawful Basis for Processing:**
      
      1. **Necessary Cookies**: Legitimate interest for website functionality
      2. **Analytics Cookies**: Consent (GDPR Article 6(1)(a))
      3. **Marketing Cookies**: Consent (GDPR Article 6(1)(a))
      
      **Data Controllers:**
      
      - Practice Qs (for user accounts and website functionality)
      - Google LLC (for Google Analytics)
      
      **Your GDPR Rights:**
      
      - Right to access your data
      - Right to rectification
      - Right to erasure ("right to be forgotten")
      - Right to restrict processing
      - Right to data portability
      - Right to object to processing
      - Right to withdraw consent
    `;
  }
}

// Export singleton instance
export const consentManager = ConsentManager.getInstance();

// Helper functions for easy use
export const hasAnalyticsConsent = (): boolean => consentManager.hasAnalyticsConsent();
export const hasMarketingConsent = (): boolean => consentManager.hasMarketingConsent();
export const hasConsent = (): boolean => consentManager.hasConsent();
export const updateConsent = (preferences: CookiePreferences): void => consentManager.updateConsent(preferences);
export const revokeConsent = (): void => consentManager.revokeConsent();

export type { CookiePreferences, ConsentData }; 