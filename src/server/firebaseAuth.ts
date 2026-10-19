import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import type { RequestHandler } from "express";
import firebaseConfig from "../../firebase-applet-config.json";

const allowedTiers = new Set([
  "Founding Member",
  "Professional Allocator",
  "Institutional Desk",
  "Institutional Alpha",
  "Sovereign Advisory",
  "Sovereign Desk"
]);

declare global {
  namespace Express {
    interface Request {
      firebaseClaims?: DecodedIdToken;
    }
  }
}

function getFirebaseAdminAuth() {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (serviceAccountJson) {
      initializeApp({
        credential: cert(JSON.parse(serviceAccountJson)),
        projectId
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      initializeApp({ credential: applicationDefault(), projectId });
    } else {
      throw new Error(
        "Configure FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS for server-side Firebase token verification."
      );
    }
  }

  return getAuth();
}

export const requireTerminalAccess: RequestHandler = async (req, res, next) => {
  const authorization = req.header("Authorization") || "";
  const match = /^Bearer ([^\s]+)$/.exec(authorization);
  if (!match) {
    res.status(401).json({ error: "A Firebase ID token is required." });
    return;
  }

  let adminAuth: ReturnType<typeof getAuth>;
  try {
    adminAuth = getFirebaseAdminAuth();
  } catch (error) {
    console.error("Firebase Admin authentication is not configured:", error);
    res.status(503).json({ error: "API authentication is not configured." });
    return;
  }

  let claims: DecodedIdToken;
  try {
    claims = await adminAuth.verifyIdToken(match[1], true);
  } catch (error) {
    console.warn("Rejected API request with an invalid Firebase ID token:", error);
    res.status(401).json({ error: "Firebase ID token is invalid or expired." });
    return;
  }

  if (claims.terminalAccess !== true || typeof claims.tier !== "string" || !allowedTiers.has(claims.tier)) {
    res.status(403).json({ error: "This account is not provisioned for terminal API access." });
    return;
  }

  req.firebaseClaims = claims;
  next();
};

export const requireFirebaseAdmin: RequestHandler = (req, res, next) => {
  if (req.firebaseClaims?.admin !== true) {
    res.status(403).json({ error: "Firebase administrator clearance is required." });
    return;
  }
  next();
};
