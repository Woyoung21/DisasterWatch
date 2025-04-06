function createMarker(
  map,
  coordinates,
  text,
  type = "unknown",
  user = "anonymous"
) {
  const marker = L.marker(coordinates).addTo(map);
  marker
    .bindPopup(
      `2025-04-04: User ${user} reported event ${type}, [${coordinates[0]},${coordinates[1]}], '${text}'`
    )
    .openPopup();
  return marker;
}
