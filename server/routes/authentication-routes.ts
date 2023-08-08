import { Request, Response, NextFunction, Express } from "express";
import crypto from "crypto";

let singleAuthToken = "";

// Middleware for checking if user is authenticated
export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log("Single Token ", singleAuthToken);
  console.log("Token ", token);


  if (singleAuthToken !== token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

function logout(req: Request, res: Response) {
  req.session.token = "";
  res.status(200).json({ message: "Logged out successfully", result: true });
}

function login(req: Request, res: Response) {
  const password = req.body.password;

  // For this example, we're assuming the password is "password123".
  // In a real scenario, you would check the password against a stored, hashed password.
  if (password === "password123") {
    const token = crypto.randomBytes(64).toString("hex"); // Generate a random token
    singleAuthToken = token; // Save the token

    res
      .status(200)
      .json({ message: "Logged in successfully", token: token, result: true });
  } else {
    res.status(401).json({ message: "Incorrect password", result: false });
  }
}

function userLogin(req: Request, res: Response) {
  res.status(200).json({ message: "User is in", result: true });
}

export function registerAuthRoutes(app: Express) {
  // app.use("/logout", checkAuth);
  // app.use("/userLogin", checkAuth);

  app.post("/logout", logout);
  app.post("/login", login);
  app.get("/userLogin", userLogin);
}
