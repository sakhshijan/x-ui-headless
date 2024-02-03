import { RequestHandler } from "express";
import { Inbound } from "../models/inbound";

export class InboundController {
  static list: RequestHandler = async function (req, res) {
    try {
      const data = await Inbound.find();
      res.status(200).json({ data });
    } catch (e) {
      res.status(500).json(e);
    }
  };

  static get: RequestHandler = async function (req, res) {
    try {
      const { id } = req.params as any;
      const data = await Inbound.findOne(id);
      res.status(200).json({ data });
    } catch (e) {
      res.status(500).json(e);
    }
  };
}
