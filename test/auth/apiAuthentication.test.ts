import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

describe("API authentication boundary", () => {
  let server: Server;
  let baseUrl: string;
  let previousVercelValue: string | undefined;

  beforeAll(async () => {
    previousVercelValue = process.env.VERCEL;
    process.env.VERCEL = "1";
    const { app } = await import("../../server");
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
    if (previousVercelValue === undefined) {
      delete process.env.VERCEL;
    } else {
      process.env.VERCEL = previousVercelValue;
    }
  });

  it("keeps health checks public", async () => {
    const response = await fetch(`${baseUrl}/api/v1/health`);
    expect(response.status).toBe(200);
  });

  it("keeps read-only market data public", async () => {
    const response = await fetch(`${baseUrl}/api/macro/live-pulse`);
    expect(response.status).toBe(200);
  });

  it("rejects unauthenticated writes", async () => {
    const response = await fetch(`${baseUrl}/api/macro/pulse/inject-alert`, { method: "POST" });
    expect(response.status).toBe(401);
  });

  it("rejects unauthenticated intelligence and internal data reads", async () => {
    const intelligenceResponse = await fetch(`${baseUrl}/api/intelligence/institutional-briefs`);
    const strategyResponse = await fetch(`${baseUrl}/api/liquidity/debt-buyback`);
    const internalResponse = await fetch(`${baseUrl}/api/v1/validation/telemetry`);

    expect(intelligenceResponse.status).toBe(401);
    expect(strategyResponse.status).toBe(401);
    expect(internalResponse.status).toBe(401);
  });

  it("does not expose process-local SSE on Vercel", async () => {
    const response = await fetch(`${baseUrl}/api/macro/stream`);
    expect(response.status).toBe(501);
  });
});
