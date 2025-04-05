require("dotenv").config();
const { insertUser, insertEvent } = require("./functions");

async function seedData() {
  try {
    console.log("Starting sample data seeding...");

    // Insert sample users required by events
    const users = [
      { id: 1, type: "user", name: "John Doe" },
      { id: 2, type: "user", name: "Jane Smith" },
      // ...add more users if needed
    ];

    for (const user of users) {
      console.log(`Inserting user with id ${user.id}`);
      await insertUser(user);
    }

    // Insert sample events
    const events = [
      {
        id: 101,
        users_id: 1,
        lat: 40.712776,
        long: -74.005974,
        data: { description: "Traffic accident at 5th Ave" },
        authority: "Police",
        severity: "High",
      },
      {
        id: 102,
        users_id: 2,
        lat: 40.73061,
        long: -73.935242,
        data: { description: "Road construction on Broadway" },
        authority: "Construction Dept",
        severity: "Medium",
      },
      {
        id: 103,
        users_id: 1,
        lat: 40.758896,
        long: -73.98513,
        data: { description: "Parade causing delays" },
        authority: "City Council",
        severity: "Low",
      },
      // ...add more events as needed
    ];

    for (const event of events) {
      console.log(`Inserting event with id ${event.id}`);
      await insertEvent(event);
    }

    console.log("Seeding completed successfully.");
  } catch (err) {
    console.error("Error during seeding:", err);
    throw err;
  }
}

exports.seedData = seedData;

// How to run:
//
// module.exports = { seedData };
// const { seedData } = require("./db/seedData");

// (async () => {
//     try {
//         await seedData();
//         console.log("Data restored successfully.");
//     } catch (err) {
//         console.error(err);
//     }
// })();
