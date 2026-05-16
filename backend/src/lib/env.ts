export interface Env {
  port: number;
  host: string;
  dataDir: string;
}

export function loadEnv(): Env {
  const port = Number(Bun.env.PORT ?? 4040);
  const host = Bun.env.HOST ?? "0.0.0.0";
  const dataDir = Bun.env.DATA_DIR ?? "./data";
  return { port, host, dataDir };
}
