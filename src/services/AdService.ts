import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { AD_CONFIG } from '../constants/theme';

let interstitial: InterstitialAd | null = null;
let lastShowTime = 0;

const AdService = {
  init: () => {
    // Standard AdMob init logic
    // Replace with real IDs in production
    const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : AD_CONFIG.interstitialId;
    
    interstitial = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    interstitial.addAdEventListener(AdEventType.LOADED, () => {
      console.log('Interstitial Loaded');
    });

    interstitial.load();
  },

  showInterstitial: () => {
    const now = Date.now();
    const cooldown = AD_CONFIG.interstitialCooldown;

    if (now - lastShowTime > cooldown && interstitial?.loaded) {
      interstitial.show();
      lastShowTime = now;
      // Re-load for next time
      interstitial.load();
    } else {
      console.log('Ad cooldown active or not loaded');
      if (!interstitial?.loaded) {
        interstitial?.load();
      }
    }
  }
};

export default AdService;
