const dbFunctions = require("./db/functions");

story_beats = [
  [
    {
      users_id: 1,
      lat: 37.7709,
      long: -122.4569,
      time_created: new Date(),
      time_updated: new Date(),
      time_expiry: new Date(Date.now() + 86400000),
      data: {
        description:
          "Fire : I see heavy smoke rising near Golden Gate Park. Stay safe everyone!",
      },
      authority: "",
      severity: "low",
    },
  ],
  [
    {
      users_id: 1,
      lat: 37.773361,
      long: -122.460952,
      time_created: new Date(),
      time_updated: new Date(),
      time_expiry: new Date(Date.now() + 86400000),
      data: {
        description:
          "Fire : Fire trucks are rushing towards the park area. Hope everyone is okay.",
      },
      authority: "",
      severity: "low",
    },
  ],
  [
    {
      users_id: 1,
      lat: 37.771172,
      long: -122.45506,
      time_created: new Date(),
      time_updated: new Date(),
      time_expiry: new Date(Date.now() + 86400000),
      data: {
        description:
          "Fire : A fire has broken out near the Conservatory of Flowers. Avoid the area if possible.",
      },
      authority: "",
      severity: "medium",
    },
    {
      users_id: 1,
      lat: 37.771174,
      long: -122.45504,
      time_created: new Date(),
      time_updated: new Date(),
      time_expiry: new Date(Date.now() + 86400000),
      data: {
        description:
          "Fire : A fire has broken out near the Conservatory of Flowers. Avoid the area if possible.",
      },
      authority: "",
      severity: "medium",
    },
  ],
  [
    {
      users_id: 1,
      lat: 37.773293,
      long: -122.469964,
      time_created: new Date(),
      time_updated: new Date(),
      time_expiry: new Date(Date.now() + 86400000),
      data: {
        description:
          " Fire : Witnessed flames near a building on Fulton Street. Authorities are on the scene.",
      },
      authority: "",
      severity: "low",
    },
  ],
  [
    {
      users_id: 1,
      lat: 37.771393,
      long: -122.45091,
      time_created: new Date(),
      time_updated: new Date(),
      time_expiry: new Date(Date.now() + 86400000),
      data: {
        description:
          "Fire : Golden Gate Park is being evacuated due to a fire. Please follow safety protocols.",
      },
      authority: "",
      severity: "low",
    },
  ],
  [
    {
      users_id: 1,
      lat: 37.773293,
      long: -122.469964,
      time_created: new Date(),
      time_updated: new Date(),
      time_expiry: new Date(Date.now() + 86400000),
      data: {
        description:
          "Fire : Witnessed flames near a building on Fulton Street. Authorities are on the scene.",
      },
      authority: "",
      severity: "low",
    },
  ],
  [
    {
      users_id: 4,
      lat: 37.773293,
      long: -122.469964,
      time_created: new Date(),
      time_updated: new Date(),
      time_expiry: new Date(Date.now() + 86400000),
      data: {
        description:
          "Fire : Golden Gate Park is being evacuated due to a fire. Please follow safety protocols.",
      },
      authority: "",
      severity: "high",
    },
  ],
  [
    {
      users_id: 1,
      lat: 37.767382,
      long: -122.477297,
      time_created: new Date(),
      time_updated: new Date(),
      time_expiry: new Date(Date.now() + 86400000),
      data: {
        description:
          "Fire : The fire near Stow Lake seems to be spreading. Stay alert and avoid the area.",
      },
      authority: "",
      severity: "medium",
    },
  ],
  [
    {
      users_id: 1,
      lat: 37.766483,
      long: -122.496319,
      time_created: new Date(),
      time_updated: new Date(),
      time_expiry: new Date(Date.now() + 86400000),
      data: {
        description:
          "Fire : Emergency services are responding to a fire incident near the Japanese Tea Garden. Stay safe!",
      },
      authority: "",
      severity: "medium",
    },
  ],
  [
    {
      users_id: 2,
      lat: 37.7685,
      long: -122.482,
      time_created: new Date(),
      time_updated: new Date(),
      time_expiry: new Date(Date.now() + 86400000),
      data: {
        description:
          "Fire : SF Fire Department: Units have arrived on scene at Golden Gate Park.",
      },
      authority: "",
      severity: "high",
    },
  ],
  [
    {
      users_id: 2,
      lat: 37.772,
      long: -122.468,
      time_created: new Date(),
      time_updated: new Date(),
      time_expiry: new Date(Date.now() + 86400000),
      data: {
        description:
          " Fire : SF Fire Department: Fire contained near Fulton Street. Residents are advised to stay clear.",
      },
      authority: "",
      severity: "high",
    },
  ],
  [
    {
      users_id: 2,
      lat: 37.769,
      long: -122.475,
      time_created: new Date(),
      time_updated: new Date(),
      time_expiry: new Date(Date.now() + 86400000),
      data: {
        description:
          "Fire : SF Fire Department: Additional units requested to secure perimeter near Stow Lake.",
      },
      authority: "",
      severity: "medium",
    },
  ],
  [
    {
      users_id: 2,
      lat: 37.767,
      long: -122.495,
      time_created: new Date(),
      time_updated: new Date(),
      time_expiry: new Date(Date.now() + 86400000),
      data: {
        description:
          "Fire : SF Fire Department: Situation under control, ongoing monitoring in progress.",
      },
      authority: "",
      severity: "low",
    },
  ],
  [],
];

function waitForKeyPress() {
  return new Promise((resolve) => {
    console.log("Press Enter to continue to the next event set...");

    const stdin = process.stdin;
    // Save current settings
    const isRawMode = stdin.isRaw;

    // Set stdin to raw mode if possible (to capture keypress without Enter)
    if (stdin.setRawMode) {
      stdin.setRawMode(true);
    }

    stdin.resume();
    stdin.once("data", (data) => {
      // Restore previous mode if needed
      if (stdin.setRawMode) {
        stdin.setRawMode(isRawMode);
      }

      // Handle Ctrl+C properly
      if (data.toString() === "\u0003") {
        process.exit(0);
      }

      resolve();
    });
  });
}

async function main() {
    await dbFunctions.deleteAllEvent();
    console.log("Deleted all events from the database.");

    await waitForKeyPress();
    for (const beat of story_beats) {
        for (const event of beat) {
            console.log("coordinates", event.lat, event.long);
            console.log("event", event.data.description);
            await dbFunctions.insertEventNoId(event);
        }
        await waitForKeyPress();
    }
}

main()