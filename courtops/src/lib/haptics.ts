'use client'

/**
 * Advanced Haptic Feedback Utility
 * Uses the Vibration API to provide tactile feedback for user interactions.
 */

export const Haptics = {
       /**
        * Extremely light vibration for subtle UI interactions (selection, toggle)
        */
       light: () => {
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                     navigator.vibrate(5);
              }
       },

       /**
        * Medium vibration for standard actions (buttons, opening modals)
        */
       medium: () => {
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                     navigator.vibrate(10);
              }
       },

       /**
        * Heavy vibration for destructive actions or important alerts
        */
       heavy: () => {
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                     navigator.vibrate(15);
              }
       },

       /**
        * Success pattern: Two quick light vibrations
        */
       success: () => {
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                     navigator.vibrate([10, 30, 10]);
              }
       },

       /**
        * Error pattern: Three quick semi-heavy vibrations
        */
       error: () => {
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                     navigator.vibrate([15, 50, 15, 50, 15]);
              }
       }
}
