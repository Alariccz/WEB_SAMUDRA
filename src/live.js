/**
 * SAMUDRA Live Tracking Darurat
 * Entry point untuk halaman /live/[id]
 */

import { renderLiveTracking } from './live/LiveTracking.js';

const root = document.getElementById('live-app');

// Ambil tracking ID dari URL path: /live/track-123456-789012
const pathParts = window.location.pathname.split('/').filter(Boolean);
const liveIndex = pathParts.findIndex(p => p === 'live');
const trackingId = liveIndex >= 0 ? pathParts[liveIndex + 1] : null;

renderLiveTracking(root, trackingId);
