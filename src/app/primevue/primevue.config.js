import BioTrackPreset from './theme-preset'

export const primeVueConfig = {
  ripple: true,
  theme: {
    preset: BioTrackPreset,
    options: {
      prefix: 'p',
      darkModeSelector: false,
      cssLayer: false,
    },
  },
  zIndex: {
    modal: 1200,
    overlay: 1100,
    menu: 1100,
    tooltip: 1300,
  },
}
