mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // this should match your div id in show.ejs
    style: 'mapbox://styles/mapbox/outdoors-v12', // or any other style you prefer
    center: campground.geometry.coordinates, // [lng, lat]
    zoom: 10
});

// Add navigation controls
map.addControl(new mapboxgl.NavigationControl());

// Add a marker at the campground location
new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`
            )
    )
    .addTo(map);
