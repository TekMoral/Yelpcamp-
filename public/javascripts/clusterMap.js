mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: "cluster-map",
    style: "mapbox://styles/mapbox/navigation-night-v1",
    center: [0, 0],
    zoom: 2,
    projection: 'globe',
    renderWorldCopies: true
}).addControl(new mapboxgl.NavigationControl(), "top-right");

// Ensure the map container doesn't have unnecessary margins
document.getElementById('cluster-map').style.marginBottom = '0';

// Add atmosphere and terrain effects for a globe-like appearance
map.on('style.load', () => {
    map.setFog({
        'color': 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6
    });
});

// Convert the campgrounds data to GeoJSON format (with guards)
const _src = (typeof campgrounds !== 'undefined' && campgrounds && Array.isArray(campgrounds.features))
  ? campgrounds.features
  : [];

const geojsonData = {
    type: "FeatureCollection",
    features: _src
      .filter(cg => cg && cg.geometry && Array.isArray(cg.geometry.coordinates) && cg.geometry.coordinates.length === 2)
      .map(campground => ({
        type: "Feature",
        properties: {
            popUpMarkup: `<strong><a href="/campgrounds/${campground._id}">${campground.title}</a></strong><p>${campground.location}</p>`,
        },
        geometry: {
            type: "Point",
            coordinates: campground.geometry.coordinates
        }
      }))
};

map.on("load", () => {
    map.addSource("campgrounds", {
        type: "geojson",
        data: geojsonData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
    });

    map.addLayer({
        id: "clusters",
        type: "circle",
        source: "campgrounds",
        filter: ["has", "point_count"],
        paint: {
            "circle-color": [
                "step",
                ["get", "point_count"],
                "#03A9F4",
                10,
                "#2196F3",
                40,
                "#3F51B5"
            ],
            "circle-radius": ["step", ["get", "point_count"], 15, 10, 20, 30, 25],
        },
    });

    map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "campgrounds",
        filter: ["has", "point_count"],
        layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
        },
    });

    map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "campgrounds",
        filter: ["!", ["has", "point_count"]],
        paint: {
            "circle-color": "#11b4da",
            "circle-radius": 8,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff",
        },
    });

    // Zoom in when clicking a cluster
    map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ["clusters"],
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource("campgrounds").getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;

            map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom,
            });
        });
    });

    // Show popup for individual campground
    map.on("click", "unclustered-point", (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const text = e.features[0].properties.popUpMarkup;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(text)
            .addTo(map);
    });

    map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
    });
});
