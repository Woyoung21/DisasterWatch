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

/**
 * Add a new event to the events list
 * @param {Object} eventData - The event data object
 * @param {number} eventData.id - Event ID
 * @param {number} eventData.users_id - User ID
 * @param {string} eventData.time_created - ISO timestamp
 * @param {Object} eventData.data - Event data containing optional description
 * @param {string} eventData.severity - Event severity (e.g., "High")
 */
function addNewEvent(eventData) {
  const eventsList = document.getElementById("eventsList");

  // Create new list item
  const listItem = document.createElement("li");
  listItem.className =
    "list-group-item d-flex justify-content-between align-items-center";

  // Format date
  const date = new Date(eventData.time_created);
  const formattedDate = `${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}-${date
    .getFullYear()
    .toString()
    .slice(-2)}`;

  // Get description
  const description =
    eventData.data && eventData.data.description
      ? eventData.data.description
      : "No description available";

  // Create left side content div
  const contentDiv = document.createElement("div");

  // Add date
  const dateElement = document.createElement("small");
  dateElement.className = "text-muted me-2";
  dateElement.innerHTML = `<i class="bi bi-calendar"></i> ${formattedDate}`;
  contentDiv.appendChild(dateElement);

  // Add user ID
  const userElement = document.createElement("small");
  userElement.className = "text-secondary me-3";
  userElement.innerHTML = `<i class="bi bi-person"></i> ${eventData.users_id}`;
  contentDiv.appendChild(userElement);

  // Add description
  const descElement = document.createElement("span");
  descElement.className = "description";
  descElement.textContent = description;
  contentDiv.appendChild(descElement);

  // Add content div to list item
  listItem.appendChild(contentDiv);

  // Add severity badge if exists
  if (eventData.severity) {
    const severityBadge = document.createElement("span");
    const badgeColor = eventData.severity === "High" ? "danger" : "warning";
    severityBadge.className = `badge bg-${badgeColor}`;
    severityBadge.textContent = eventData.severity;
    listItem.appendChild(severityBadge);
  }

  // Add new event to the list in the correct position (sorted by date)
  const existingItems = Array.from(eventsList.children);
  const eventTime = date.getTime();

  let inserted = false;

  // Find the correct position based on time_created
  for (let i = 0; i < existingItems.length; i++) {
    const itemDateText = existingItems[i]
      .querySelector(".text-muted")
      .textContent.trim()
      .replace(/[^0-9-]/g, "");
    const [month, day, year] = itemDateText.split("-");
    const itemDate = new Date(`20${year}`, month - 1, day);

    if (date < itemDate) {
      eventsList.insertBefore(listItem, existingItems[i]);
      inserted = true;
      break;
    }
  }

  // If we didn't find a place to insert, add to the end
  if (!inserted) {
    eventsList.appendChild(listItem);
  }

  const container = document.querySelector(".events-scroll-container");
  container.scrollIntoView({ behavior: "smooth" });
  container.scrollTop = container.scrollHeight;
  
}
