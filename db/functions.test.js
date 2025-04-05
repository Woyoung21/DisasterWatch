const db = require("./client");
const { insertUser, insertEvent } = require("./functions");
const { seedData } = require("./seedData");

describe("Database Inserts", () => {
  // Clear tables before running tests (order matters due to FK constraints)
  beforeAll(async () => {
    await db.query("DELETE FROM events");
    await db.query("DELETE FROM users");
  });

  // Clean up after each test to ensure isolation
  afterEach(async () => {
    await db.query("DELETE FROM events");
    await db.query("DELETE FROM users");
  });

  // Final cleanup
  afterAll(async () => {
    await db.query("DELETE FROM events");
    await db.query("DELETE FROM users");

    // Restore the database to its original state
    try {
      await seedData();
      console.log("Data restored successfully.");
    } catch (err) {
      console.error(err);
    }
  });

  test("insertUser should add a user to the database", async () => {
    const user = { id: 1, type: "user", name: "John Doe" };
    await insertUser(user);

    const result = await db.query("SELECT * FROM users WHERE id = $1", [
      user.id,
    ]);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].name).toBe(user.name);
    expect(result.rows[0].type).toBe(user.type);
  });

  test("insertEvent should add an event to the database", async () => {
    // Insert a user first due to the FK constraint
    const user = { id: 2, type: "user", name: "Jane Smith" };
    await insertUser(user);

    const event = {
      id: 100,
      users_id: user.id,
      lat: 40.712776,
      long: -74.005974,
      // time_created and time_updated default automatically
      // time_expiry will default to 1 day later if not provided
      data: { description: "Traffic accident" },
      authority: "Police",
      severity: "High",
    };
    await insertEvent(event);

    const result = await db.query("SELECT * FROM events WHERE id = $1", [
      event.id,
    ]);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].authority).toBe(event.authority);
    expect(result.rows[0].severity).toBe(event.severity);
    // Check that JSON data inserted equals what we passed in
    expect(result.rows[0].data).toEqual(event.data);
  });
});
