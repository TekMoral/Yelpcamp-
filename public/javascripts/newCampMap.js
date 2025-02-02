mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-103.5917, 40.6699], // Default center (you can change this)
    zoom: 4
});

// Add navigation controls
map.addControl(new mapboxgl.NavigationControl());

// Add a draggable marker
const marker = new mapboxgl.Marker({
    draggable: true
})
    .setLngLat([-103.5917, 40.6699])
    .addTo(map);

// Update coordinates when marker is dragged
marker.on('dragend', () => {
    const lngLat = marker.getLngLat();
    // You'll need to add hidden form fields to store these coordinates
    console.log('Longitude:', lngLat.lng);
    console.log('Latitude:', lngLat.lat);
});
