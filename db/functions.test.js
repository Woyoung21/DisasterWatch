const db = require("./client");
const {
  insertUser,
  insertEvent,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  getEventById,
  getEventsByUserId,
  updateEvent,
  deleteEvent,
  getAllEvents,
} = require("./functions");
const { seedData } = require("./seedData");

describe("Database Inserts and Management", () => {
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

  test("getUserById returns the correct user", async () => {
    const user = { id: 3, type: "authority", name: "Alice Manager" };
    await insertUser(user);
    const returnedUser = await getUserById(user.id);
    expect(returnedUser).toBeDefined();
    expect(returnedUser.name).toBe(user.name);
  });

  test("getAllUsers returns all inserted users", async () => {
    const users = [
      { id: 4, type: "user", name: "User One" },
      { id: 5, type: "authority", name: "User Two" },
    ];
    for (const user of users) {
      await insertUser(user);
    }
    const allUsers = await getAllUsers();
    expect(allUsers.length).toBe(users.length);
  });

  test("updateUser updates a user's info", async () => {
    const user = { id: 6, type: "user", name: "Bob" };
    await insertUser(user);
    await updateUser({ id: user.id, name: "Bobby", type: "authority" });
    const updatedUser = await getUserById(user.id);
    expect(updatedUser.name).toBe("Bobby");
    expect(updatedUser.type).toBe("authority");
  });

  test("deleteUser removes a user", async () => {
    const user = { id: 7, type: "user", name: "Charlie" };
    await insertUser(user);
    await deleteUser(user.id);
    const returnedUser = await getUserById(user.id);
    expect(returnedUser).toBeUndefined();
  });

  test("getEventById returns the correct event", async () => {
    const user = { id: 8, type: "user", name: "Danielle" };
    await insertUser(user);
    const event = {
      id: 200,
      users_id: user.id,
      lat: 34.052235,
      long: -118.243683,
      data: { description: "Concert" },
      authority: "Security",
      severity: "Low",
    };
    await insertEvent(event);
    const returnedEvent = await getEventById(event.id);
    expect(returnedEvent).toBeDefined();
    expect(returnedEvent.authority).toBe(event.authority);
  });

  test("getEventsByUserId returns all events for a user", async () => {
    const user = { id: 9, type: "user", name: "Eve" };
    await insertUser(user);
    const events = [
      {
        id: 300,
        users_id: user.id,
        lat: 51.507351,
        long: -0.127758,
        data: { description: "Parade" },
        authority: "Police",
        severity: "Medium",
      },
      {
        id: 301,
        users_id: user.id,
        lat: 48.856613,
        long: 2.352222,
        data: { description: "Festival" },
        authority: "Local Authority",
        severity: "Low",
      },
    ];
    for (const event of events) {
      await insertEvent(event);
    }
    const userEvents = await getEventsByUserId(user.id);
    expect(userEvents.length).toBe(events.length);
  });

  test("updateEvent updates an event's details", async () => {
    const user = { id: 10, type: "user", name: "Frank" };
    await insertUser(user);
    const event = {
      id: 400,
      users_id: user.id,
      lat: 35.689487,
      long: 139.691711,
      data: { description: "Marathon" },
      authority: "Police",
      severity: "Low",
    };
    await insertEvent(event);
    await updateEvent({
      id: event.id,
      lat: 36.0,
      data: { description: "Updated Marathon" },
      severity: "Medium",
    });
    const updatedEvent = await getEventById(event.id);
    expect(parseFloat(updatedEvent.lat)).toBeCloseTo(36.0);
    expect(updatedEvent.severity).toBe("Medium");
    expect(updatedEvent.data).toEqual({ description: "Updated Marathon" });
  });

  test("deleteEvent removes an event", async () => {
    const user = { id: 11, type: "user", name: "Grace" };
    await insertUser(user);
    const event = {
      id: 500,
      users_id: user.id,
      lat: 55.755825,
      long: 37.617298,
      data: { description: "Meeting" },
      authority: "Admin",
      severity: "High",
    };
    await insertEvent(event);
    await deleteEvent(event.id);
    const deletedEvent = await getEventById(event.id);
    expect(deletedEvent).toBeUndefined();
  });

  test("getAllEvents returns all inserted events", async () => {
    const user = { id: 12, type: "user", name: "Hannah" };
    await insertUser(user);
    const events = [
      {
        id: 600,
        users_id: user.id,
        lat: 40.73061,
        long: -73.935242,
        data: { description: "Conference" },
        authority: "Organizer",
        severity: "Medium",
      },
      {
        id: 601,
        users_id: user.id,
        lat: 34.052235,
        long: -118.243683,
        data: { description: "Workshop" },
        authority: "Admin",
        severity: "Low",
      },
    ];
    for (const event of events) {
      await insertEvent(event);
    }
    const allEvents = await getAllEvents();
    expect(allEvents.length).toBe(events.length);
    expect(allEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: events[0].id,
          authority: events[0].authority,
        }),
        expect.objectContaining({
          id: events[1].id,
          authority: events[1].authority,
        }),
      ])
    );
  });
});
