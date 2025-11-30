mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12", // Use the standard style for the map
  projection: "globe", // display the map as a globe
  zoom: 9, // initial zoom level, 0 is the world view, higher values zoom in
  center: listData.geometry.coordinates, // center the map on this longitude and latitude
});

map.addControl(new mapboxgl.NavigationControl());
map.scrollZoom.disable();

map.on("style.load", () => {
  map.setFog({}); // Set the default atmosphere style
});

const marker = new mapboxgl.Marker({ color: "red" })
  .setLngLat(listData.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h5>${listData.title}</h5><p>Exact location will be provided after booking!</p>`
    )
  )
  .addTo(map);
