// Patch console.error BEFORE anything else loads
// Suppresses non-fatal RN 0.77 bridgeless warning in Expo Go SDK 54
const _error = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('disableEventLoopOnBridgeless')) return;
  if (typeof args[0] === 'string' && args[0].includes('Could not access feature flag')) return;
  _error(...args);
};

// Now load expo-router
require('expo-router/entry');
