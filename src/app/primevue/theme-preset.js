import { definePreset, palette } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

const biotrackBlue = palette('#0F4C81')
const biotrackGreen = palette('#10B981')

const BioTrackPreset = definePreset(Aura, {
  primitive: {
    biotrackBlue,
    biotrackGreen,
  },
  semantic: {
    primary: {
      50: '{biotrackBlue.50}',
      100: '{biotrackBlue.100}',
      200: '{biotrackBlue.200}',
      300: '{biotrackBlue.300}',
      400: '{biotrackBlue.400}',
      500: '{biotrackBlue.500}',
      600: '{biotrackBlue.600}',
      700: '{biotrackBlue.700}',
      800: '{biotrackBlue.800}',
      900: '{biotrackBlue.900}',
      950: '{biotrackBlue.950}',
    },
    focusRing: {
      width: '3px',
      style: 'solid',
      color: '#0F4C81',
      offset: '2px',
    },
    colorScheme: {
      light: {
        primary: {
          color: '#0F4C81',
          inverseColor: '#FFFFFF',
          hoverColor: '#0A3660',
          activeColor: '#0A3660',
        },
        highlight: {
          background: '#E8F0F9',
          focusBackground: '#E8F0F9',
          color: '#0A3660',
          focusColor: '#0A3660',
        },
        surface: {
          0: '#FFFFFF',
          50: '#F8FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712',
        },
      },
    },
  },
  extend: {
    biotrack: {
      text: '#1F2937',
      textMuted: '#4B5563',
      surface: '#F3F4F6',
      border: '#E5E7EB',
      background: '#F8FAFB',
      success: '#10B981',
      successDark: '#0A9268',
      successSoft: '#D1FAE5',
      danger: '#DC3545',
      warning: '#FBBF24',
      primarySoft: '#E8F0F9',
      white: '#FFFFFF',
    },
  },
})

export default BioTrackPreset
