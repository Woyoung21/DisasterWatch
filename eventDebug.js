const debug = {
  connections: new Map(),
  stats: {
    dbNotificationsReceived: 0,
    wsMessagesSent: 0,
    activeConnections: 0,
  },

  logConnection(ws, req) {
    const id =
      Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    ws.id = id;
    this.connections.set(id, {
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
      userId: null,
      connected: new Date(),
      messagesSent: 0,
    });
    this.stats.activeConnections = this.connections.size;
    console.log(
      `[WS:${id}] New connection (${this.stats.activeConnections} active)`
    );
  },

  logDisconnection(ws) {
    if (ws.id && this.connections.has(ws.id)) {
      const conn = this.connections.get(ws.id);
      console.log(
        `[WS:${ws.id}] Disconnected - User:${
          conn.userId || "unknown"
        }, Messages sent:${conn.messagesSent}`
      );
      this.connections.delete(ws.id);
      this.stats.activeConnections = this.connections.size;
    }
  },

  trackSubscription(ws, userId) {
    if (ws.id && this.connections.has(ws.id)) {
      const conn = this.connections.get(ws.id);
      conn.userId = userId;
      console.log(`[WS:${ws.id}] Subscribed with userId: ${userId}`);
    }
  },

  logDbNotification(payload) {
    this.stats.dbNotificationsReceived++;
    console.log(
      `[DB] Notification #${this.stats.dbNotificationsReceived}:`,
      JSON.stringify(payload).substring(0, 100) +
        (JSON.stringify(payload).length > 100 ? "..." : "")
    );
  },

  trackMessageSent(ws, data) {
    this.stats.wsMessagesSent++;
    if (ws.id && this.connections.has(ws.id)) {
      const conn = this.connections.get(ws.id);
      conn.messagesSent++;
    }
    console.log(
      `[WS:OUT:${ws.id}] Message sent:`,
      JSON.stringify(data).substring(0, 100) +
        (JSON.stringify(data).length > 100 ? "..." : "")
    );
  },

  getStats() {
    return {
      ...this.stats,
      connections: Array.from(this.connections.entries()).map(([id, conn]) => ({
        id,
        ...conn,
      })),
    };
  },
};

module.exports = debug;
