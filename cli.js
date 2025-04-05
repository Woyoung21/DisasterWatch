const dbFunctions = require("./db/functions");
const { argv } = require("process");

function displayUsage() {
  console.log("Usage:");
  console.log("  node cli.js insertUser <id> <type> <name> [create_time]");
  console.log(
    "  node cli.js insertEvent <id> <users_id> <lat> <long> [time_created] [time_updated] [time_expiry] [data] [authority] [severity]"
  );
  console.log("  node cli.js getUserById <id>");
  console.log("  node cli.js getAllUsers");
  console.log("  node cli.js updateUser <id> [type] [name]");
  console.log("  node cli.js deleteUser <id>");
  console.log("  node cli.js getEventById <id>");
  console.log("  node cli.js getEventsByUserId <users_id>");
  console.log(
    "  node cli.js updateEvent <id> [lat] [long] [time_created] [time_updated] [time_expiry] [data] [authority] [severity]"
  );
  console.log("  node cli.js deleteEvent <id>");
  console.log("  node cli.js -h | --help");
}

async function main() {
  const [, , command, ...args] = argv;

  if (command === "-h" || command === "--help") {
    displayUsage();
    return;
  }

  try {
    switch (command) {
      case "insertUser":
        const user = {
          id: parseInt(args[0]),
          type: args[1],
          name: args[2],
          create_time: args[3] ? new Date(args[3]) : undefined,
        };
        await dbFunctions.insertUser(user);
        console.log("User inserted:", user);
        break;

      case "insertEvent":
        const event = {
          id: parseInt(args[0]),
          users_id: parseInt(args[1]),
          lat: parseFloat(args[2]),
          long: parseFloat(args[3]),
          time_created: args[4] ? new Date(args[4]) : undefined,
          time_updated: args[5] ? new Date(args[5]) : undefined,
          time_expiry: args[6] ? new Date(args[6]) : undefined,
          data: args[7] ? JSON.parse(args[7]) : {},
          authority: args[8],
          severity: args[9],
        };
        await dbFunctions.insertEvent(event);
        console.log("Event inserted:", event);
        break;

      case "getUserById":
        const userId = parseInt(args[0]);
        const userResult = await dbFunctions.getUserById(userId);
        console.log("User:", userResult);
        break;

      case "getAllUsers":
        const allUsers = await dbFunctions.getAllUsers();
        console.log("All Users:", allUsers);
        break;

      case "updateUser":
        const updateUserId = parseInt(args[0]);
        const updatedUser = {
          id: updateUserId,
          type: args[1],
          name: args[2],
        };
        await dbFunctions.updateUser(updatedUser);
        console.log("User updated:", updatedUser);
        break;

      case "deleteUser":
        const deleteUserId = parseInt(args[0]);
        await dbFunctions.deleteUser(deleteUserId);
        console.log("User deleted with ID:", deleteUserId);
        break;

      case "getEventById":
        const eventId = parseInt(args[0]);
        const eventResult = await dbFunctions.getEventById(eventId);
        console.log("Event:", eventResult);
        break;

      case "getEventsByUserId":
        const eventsUserId = parseInt(args[0]);
        const eventsResult = await dbFunctions.getEventsByUserId(eventsUserId);
        console.log("Events for User ID:", eventsResult);
        break;

      case "updateEvent":
        const updateEventId = parseInt(args[0]);
        const updatedEvent = {
          id: updateEventId,
          lat: args[1] ? parseFloat(args[1]) : undefined,
          long: args[2] ? parseFloat(args[2]) : undefined,
          time_created: args[3] ? new Date(args[3]) : undefined,
          time_updated: args[4] ? new Date(args[4]) : undefined,
          time_expiry: args[5] ? new Date(args[5]) : undefined,
          data: args[6] ? JSON.parse(args[6]) : undefined,
          authority: args[7],
          severity: args[8],
        };
        await dbFunctions.updateEvent(updatedEvent);
        console.log("Event updated:", updatedEvent);
        break;

      case "deleteEvent":
        const deleteEventId = parseInt(args[0]);
        await dbFunctions.deleteEvent(deleteEventId);
        console.log("Event deleted with ID:", deleteEventId);
        break;

      default:
        console.log("Unknown command:", command);
        displayUsage();
        break;
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
