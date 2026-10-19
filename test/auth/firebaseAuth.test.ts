const mockVerifyIdToken = jest.fn();

jest.mock("firebase-admin/app", () => ({
  applicationDefault: jest.fn(),
  cert: jest.fn(),
  getApps: () => [{}],
  initializeApp: jest.fn()
}));

jest.mock("firebase-admin/auth", () => ({
  getAuth: () => ({ verifyIdToken: mockVerifyIdToken })
}));

import type { Request, Response } from "express";
import { requireFirebaseAdmin, requireTerminalAccess } from "../../src/server/firebaseAuth";

function createRequest(token = "valid-token"): Request {
  return {
    header: jest.fn().mockReturnValue(token ? `Bearer ${token}` : "")
  } as unknown as Request;
}

function createResponse() {
  const response = {
    status: jest.fn(),
    json: jest.fn()
  };
  response.status.mockReturnValue(response);
  return response as unknown as Response & typeof response;
}

describe("Firebase API authorization middleware", () => {
  beforeEach(() => {
    mockVerifyIdToken.mockReset();
  });

  it("accepts a verified terminal claim and attaches the decoded claims", async () => {
    const claims = { terminalAccess: true, tier: "Professional Allocator" };
    mockVerifyIdToken.mockResolvedValue(claims);
    const request = createRequest();
    const response = createResponse();
    const next = jest.fn();

    await requireTerminalAccess(request, response, next);

    expect(mockVerifyIdToken).toHaveBeenCalledWith("valid-token", true);
    expect(request.firebaseClaims).toEqual(claims);
    expect(next).toHaveBeenCalledTimes(1);
    expect(response.status).not.toHaveBeenCalled();
  });

  it("denies a valid Firebase user without terminal entitlement", async () => {
    mockVerifyIdToken.mockResolvedValue({ terminalAccess: false, tier: "Guest" });
    const request = createRequest();
    const response = createResponse();
    const next = jest.fn();

    await requireTerminalAccess(request, response, next);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("requires the explicit administrator claim for provider administration", () => {
    const response = createResponse();
    const next = jest.fn();
    const ordinaryUserRequest = {
      firebaseClaims: { terminalAccess: true, tier: "Institutional Desk" }
    } as unknown as Request;

    requireFirebaseAdmin(ordinaryUserRequest, response, next);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
