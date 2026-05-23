import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.datereunion.app",
  appName: "DateRéunion",
  webDir: "out",

  // The app loads the live Vercel deployment.
  // Native plugins (camera, haptics, notifications) enhance the web experience.
  server: {
    url: "https://datereunion.vercel.app",
    cleartext: false,
    androidScheme: "https",
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0f172a",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#FF6B6B",
      overlaysWebView: false,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },

  ios: {
    scheme: "DateReunion",
    contentInset: "automatic",
  },
};

export default config;
