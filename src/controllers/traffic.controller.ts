import { RequestHandler } from "express";
import { Traffic } from "../models/traffic";

export class TrafficController {
  static list: RequestHandler = async function (req, res) {
    try {
      const data = await Traffic.find();
      res.status(200).json({ data });
    } catch (e) {
      res.status(500).json(e);
    }
  };

  static get: RequestHandler = async function (req, res) {
    try {
      const { email } = req.params as any;
      const data = await Traffic.findOne(email);
      res.status(200).json({ data });
    } catch (e) {
      res.status(500).json(e);
    }
  };

  static resetTraffic: RequestHandler = async function (req, res) {
    try {
      const { email } = req.params as any;
      const {
        props: { ...data },
      } = await Traffic.findOne(email);
      const message = await Traffic.update(email, {
        ...data,
        down: 0,
        up: 0,
      });
      res
        .status(200)
        .json({ message: message ? "traffic refreshed" : message });
    } catch (e) {
      res.status(500).json(e);
    }
  };
}
