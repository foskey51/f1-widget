import { RaceData } from './app.js';

async function renderTrackMap() {
  const nearestFutureRace = await RaceData();

  if (!nearestFutureRace) {
    console.error('Error: No upcoming races found.');
    return;
  }

  const imageUrl = nearestFutureRace.trackmap;

  if (!imageUrl) {
    console.error('Error: Invalid image URL.');
    return;
  }

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imageUrl;
  img.alt = 'Track Map';
  img.style.width = '80px';
  img.style.height = 'auto';
  img.onload = function() {
    const container = document.getElementById('track-map-container');
    if (container) {
      container.appendChild(img);
    } else {
      console.error('Error: Container element not found.');
    }
  };
  img.onerror = function() {
    console.error('Error: Failed to load image.');
  };
}

renderTrackMap();


