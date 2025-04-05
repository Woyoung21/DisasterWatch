// Browser code for real-time event updates
class EventService {
  constructor() {
    this.callbacks = {
      onConnect: [],
      onEvent: [],
      onError: [],
      onMessage: [], // Added for raw message debugging
      onClose: [],
    };
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.connect();
  }

  connect() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${window.location.host}/ws`;
    this.log("system", `Connecting to ${url}`);

    try {
      this.socket = new WebSocket(url);
    } catch (err) {
      this.log("error", `Failed to create WebSocket: ${err.message}`);
      return this.scheduleReconnect();
    }

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.log("connect", "Connection established");

      // Subscribe with user ID
      const subscribeMsg = {
        type: "subscribe",
      };
      this.log("send", `Sending subscription: ${JSON.stringify(subscribeMsg)}`);

      try {
        this.socket.send(JSON.stringify(subscribeMsg));
      } catch (err) {
        this.log("error", `Failed to send subscription: ${err.message}`);
      }

      this.callbacks.onConnect.forEach((cb) => cb());
    };

    this.socket.onmessage = (event) => {
      // handler is usually overwritten
      this.log("receive", `Raw message: ${event.data}`);

      try {
        const data = JSON.parse(event.data);
        this.callbacks.onMessage.forEach((cb) => cb(event.data));

        if (data.type === "event_update") {
          // Create an event payload object from the data
          const eventPayload = new EventModels.EventPayload({
            operation: data.operation,
            record: data.data,
          });

          this.log(
            "event",
            `Event received: ${eventPayload.operation}`,
            eventPayload.record
          );

          // Now we can use helper methods
          if (eventPayload.isInsert()) {
            // Handle insert operation
          } else if (eventPayload.isUpdate()) {
            // Handle update operation
          } else if (eventPayload.isDelete()) {
            // Handle delete operation
          }

          this.callbacks.onEvent.forEach((cb) => cb(eventPayload));
        } else {
          this.log("message", `Other message type: ${data.type || "unknown"}`);
        }
      } catch (err) {
        this.log("error", `Error processing message: ${err.message}`);
      }
    };

    this.socket.onerror = (error) => {
      this.log("error", `WebSocket error: ${error.message || "Unknown error"}`);
      this.callbacks.onError.forEach((cb) => cb(error));
    };

    this.socket.onclose = (event) => {
      const reason = event.reason ? `Reason: ${event.reason}` : "";
      const code = `Code: ${event.code}`;
      const wasClean = event.wasClean ? "(clean close)" : "(unclean close)";

      this.log("close", `Connection closed ${wasClean}. ${code} ${reason}`);
      this.callbacks.onClose.forEach((cb) => cb(event));

      this.scheduleReconnect();
    };
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.log("system", "Max reconnection attempts reached. Giving up.");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 30000);

    this.log(
      "system",
      `Scheduling reconnect attempt ${this.reconnectAttempts} in ${Math.round(
        delay / 1000
      )}s`
    );
    setTimeout(() => this.connect(), delay);
  }

  log(type, message, data) {
    console.log(`[WebSocket:${type}]`, message, data || "");
    const event = { type, message, data, timestamp: new Date() };
    this.callbacks.onMessage.forEach((cb) => cb(event));
  }

  on(event, callback) {
    // Map the event name to the actual callback array name
    const callbackKey = "on" + event.charAt(0).toUpperCase() + event.slice(1);

    if (this.callbacks[callbackKey]) {
      this.callbacks[callbackKey].push(callback);
    } else {
      console.error(
        `Invalid event type: ${event}, no matching callback array found`
      );
    }
    return this;
  }

  // New method to replace all handlers for an event
  setHandler(event, callback) {
    // Map the event name to the actual callback array name
    const callbackKey = "on" + event.charAt(0).toUpperCase() + event.slice(1);

    if (this.callbacks[callbackKey]) {
      // Replace all handlers with just this one
      this.callbacks[callbackKey] = [callback];
    } else {
      console.error(
        `Invalid event type: ${event}, no matching callback array found`
      );
    }
    return this;
  }

  // Optional: Method to clear all handlers for an event
  clearHandlers(event) {
    const callbackKey = "on" + event.charAt(0).toUpperCase() + event.slice(1);
    if (this.callbacks[callbackKey]) {
      this.callbacks[callbackKey] = [];
    }
    return this;
  }

  close() {
    if (this.socket) {
      this.socket.close();
    }
  }
}
