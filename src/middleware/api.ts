import { RequestHandler } from "express";

export const API: RequestHandler = function (req, res, next) {
  const api = req.headers["X-API"] || req.headers["x-api"];
  const API = process.env.API_KEY;

  // console.log(crypto.randomBytes(64).toString("base64url"));
  if (!api || api !== API)
    return res.status(401).json({ message: "Api key is missing or is wrong!" });

  next();
};
