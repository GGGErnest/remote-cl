import { Request, Response, NextFunction } from "express";
import { getDB } from "../logic/database.js";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { WSInputMessage } from "../types/ws-types.js";

const { sign, verify } = jwt;

const tokenExpirationTime = "1m";

// Middleware for checking if user is authenticated
export function checkReqAuth(req: Request, res: Response, next: NextFunction){
  const authHeader = req.headers.authorization;

  const accessTokenSecret = getDB().chain.get("authentication").value().secret;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    verify(token, accessTokenSecret, (err: VerifyErrors | null, user) => {
      if (err?.name === 'TokenExpiredError' ) {
        return res.status(403).json({ message: "TokenExpiredError" });
      }

      if(err?.name === 'JsonWebTokenError') {
        return res.status(403).json({ message: "JsonWebTokenError" });
      }

      if(err) {
        res.sendStatus(403);
      }

      next();
    });
  } else {
    res.sendStatus(401);
  }
};

export function checkWSMessageAuth(message: WSInputMessage): boolean {
    const accessTokenSecret = getDB().chain.get("authentication").value().secret;
  
    if (message.accessToken) {
      try {
        verify(message.accessToken, accessTokenSecret);
        return true;
      } catch (err: any) {
        console.warn("Auth validation result", err);
        switch (err.name) {
          case "TokenExpiredError":
            broadcast({
              type: "AuthError",
              output: "TokenExpired",
            } as WSAuthErrorMessage);
            break;
          case "JsonWebTokenError":
            broadcast({
              type: "AuthError",
              output: "JsonWebTokenError",
            } as WSAuthErrorMessage);
            break;
          default:
            break;
        }
  
        return false;
      }
    }
    return false;
}


function refreshAccessToken(req: Request, res: Response) {
    console.warn("Refresh Token endpoint was called");
    const { token } = req.body;
    const accessTokenSecret = getDB().chain.get("authentication").value().secret;
  
    if (!token) {
      return res.sendStatus(401);
    }
  
    const refreshTokens = getDB()
      .chain.get("authentication")
      .value().refreshTokens;
  
    if (!refreshTokens.includes(token)) {
      return res.sendStatus(403);
    }
  
    const refreshTokenSecret = getDB()
      .chain.get("authentication")
      .value().refreshAuthToken;
  
    verify(
      token,
      refreshTokenSecret,
      (errors: VerifyErrors | null, user: any) => {
        if (errors) {
          return res.sendStatus(403);
        }
  
        const accessToken = sign({ username: user.username }, accessTokenSecret, {
          expiresIn: tokenExpirationTime,
        });
  
        res.json({
          message: "Access token was refreshed",
          accessToken,
        });
      }
    );
}