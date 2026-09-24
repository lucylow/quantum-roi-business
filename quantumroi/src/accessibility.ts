export const accessibility = {
  minTouchTarget: 44,
  liveAnnouncement: (message: string) => ({ accessibilityLiveRegion: "polite" as const, accessibilityLabel: message }),
};
