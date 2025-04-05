/**
 * Event data models for both server and client use
 * Uses UMD pattern for compatibility in Node.js and browser environments
 */

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    // Node. Export as module
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.EventModels = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  /**
   * EventRecord class - represents the record data structure
   */
  class EventRecord {
    constructor({
      id = null,
      users_id = null,
      lat = null,
      long = null,
      time_created = null,
      time_updated = null,
      time_expiry = null,
      data = {},
      authority = null,
      severity = "low",
    } = {}) {
      this.id = id;
      this.users_id = users_id;
      this.lat = lat;
      this.long = long;
      this.time_created = time_created;
      this.time_updated = time_updated;
      this.time_expiry = time_expiry;
      this.data = data;
      this.authority = authority;
      this.severity = severity;
    }

    // Check if event has expired
    isExpired() {
      if (!this.time_expiry) return false;
      return new Date(this.time_expiry) < new Date();
    }

    // Get coordinates as a simple object
    getCoordinates() {
      return { lat: this.lat, long: this.long };
    }

    // Validate required fields
    isValid() {
      return this.id !== null && this.lat !== null && this.long !== null;
    }

    // Convert to plain object
    toObject() {
      return {
        id: this.id,
        users_id: this.users_id,
        lat: this.lat,
        long: this.long,
        time_created: this.time_created,
        time_updated: this.time_updated,
        time_expiry: this.time_expiry,
        data: this.data,
        authority: this.authority,
        severity: this.severity,
      };
    }

    // Create from raw object
    static fromObject(obj) {
      return new EventRecord(obj || {});
    }
  }

  /**
   * EventPayload class - represents the complete notification payload
   */
  class EventPayload {
    constructor({ operation = null, record = null } = {}) {
      this.operation = operation;

      // If record is already an EventRecord instance, use it
      // Otherwise create a new EventRecord from the data
      this.record =
        record instanceof EventRecord ? record : new EventRecord(record || {});
    }

    // Operation type helper methods
    isInsert() {
      return this.operation === "INSERT";
    }

    isUpdate() {
      return this.operation === "UPDATE";
    }

    isDelete() {
      return this.operation === "DELETE";
    }

    isTest() {
      return this.operation === "TEST";
    }

    // Convert to plain object
    toObject() {
      return {
        operation: this.operation,
        record: this.record.toObject(),
      };
    }

    // Parse from JSON string
    static fromJSON(jsonString) {
      try {
        const data = JSON.parse(jsonString);
        return new EventPayload({
          operation: data.operation,
          record: data.record,
        });
      } catch (e) {
        throw new Error(`Failed to parse EventPayload: ${e.message}`);
      }
    }

    // Create from raw object
    static fromObject(obj) {
      return new EventPayload(obj || {});
    }
  }

  // Return the public API
  return {
    EventRecord,
    EventPayload,
  };
});
