import type { BunWebSocket, BunWebSocketHandler } from "../../bun.d.ts";

const TOPIC = "pulso:live";

export const wsHandler: BunWebSocketHandler = {
  open(ws: BunWebSocket) {
    ws.subscribe(TOPIC);
    ws.send(JSON.stringify({ type: "hello", topic: TOPIC }));
  },
  message(ws: BunWebSocket, msg: string | Buffer) {
    const text = typeof msg === "string" ? msg : msg.toString("utf8");
    ws.publish(TOPIC, text);
  },
  close(ws: BunWebSocket) {
    ws.unsubscribe(TOPIC);
  },
};
