// Tipos mínimos del runtime Bun usados en Pulso.
// Declarados a mano para evitar la dependencia npm `bun-types`.

declare global {
  const Bun: {
    serve(opts: BunServeOptions): BunServer;
    build(opts: BunBuildOptions): Promise<BunBuildOutput>;
    file(path: string): BunFile;
    write(path: string, data: string | ArrayBuffer | Blob): Promise<number>;
    env: Record<string, string | undefined>;
  };
}

export interface BunServeOptions {
  port?: number;
  hostname?: string;
  development?: boolean;
  fetch(req: Request, server: BunServer): Response | Promise<Response>;
  websocket?: BunWebSocketHandler;
}

export interface BunServer {
  port: number;
  hostname: string;
  upgrade(req: Request, opts?: { data?: unknown }): boolean;
  publish(topic: string, message: string | ArrayBuffer): number;
  stop(closeActive?: boolean): void;
}

export interface BunWebSocketHandler {
  open?(ws: BunWebSocket): void;
  message?(ws: BunWebSocket, msg: string | Buffer): void;
  close?(ws: BunWebSocket, code: number, reason: string): void;
}

export interface BunWebSocket {
  data: unknown;
  readyState: number;
  send(data: string | ArrayBuffer): number;
  subscribe(topic: string): void;
  unsubscribe(topic: string): void;
  publish(topic: string, message: string | ArrayBuffer): number;
  close(code?: number, reason?: string): void;
}

export interface BunBuildOptions {
  entrypoints: string[];
  target?: "browser" | "bun" | "node";
  format?: "esm" | "cjs" | "iife";
  minify?: boolean;
  sourcemap?: "none" | "inline" | "external";
}

export interface BunBuildOutput {
  success: boolean;
  outputs: BunBuildArtifact[];
  logs: Array<{ message: string; level: string }>;
}

export interface BunBuildArtifact {
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
}

export interface BunFile {
  exists(): Promise<boolean>;
  text(): Promise<string>;
  json(): Promise<unknown>;
  arrayBuffer(): Promise<ArrayBuffer>;
  size: number;
  lastModified: number;
}

export {};
