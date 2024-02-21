import { Client } from "../models/client";
import { RequestHandler } from "express";
import { Traffic } from "../models/traffic";
import { addClientSchema } from "../schema";
import { resetServer } from "../lib/resetServer";

export class ClientController {
  static list: RequestHandler = async function (req, res) {
    try {
      const data = await Client.find();
      res.status(200).json({ data });
    } catch (e) {
      res.status(500).json(e);
    }
  };

  static get: RequestHandler = async function (req, res) {
    try {
      const { id } = req.params as any;
      const data = await Client.findOne(id);
      res.status(200).json({ data });
    } catch (e) {
      res.status(500).json(e);
    }
  };

  static addClient: RequestHandler = async function (request, response) {
    try {
      const { totalGB, expiryTime, id, inboundId } = addClientSchema.parse(
        request.body,
      );
      const message = await Client.create({
        id,
        totalGB: totalGB || 0,
        inboundId,
        expiryTime: expiryTime || 0,
      });
      setTimeout(() => resetServer(), 20_000);

      return response.status(201).json({ message });
    } catch (error) {
      console.log(error);
      return response.status(404).json({ error });
    }
  };

  static remove: RequestHandler = async function (request, response) {
    try {
      const { id } = request.params as any;
      const message = await Client.remove(id);
      setTimeout(() => resetServer(), 20_000);
      return response.status(201).json({ message });
    } catch (error) {
      return response.status(404).json({ error });
    }
  };

  static recharge: RequestHandler = async function (request, response) {
    const { id: clientId } = request.params as any;

    try {
      const client = await Client.findOne(clientId);
      if (!client) throw "Client not found!";
      if (!(await Client.remove(clientId))) throw "Cannot remove client!";
      const { totalGB, expiryTime, inboundId } = addClientSchema.parse({
        ...request.body,
        id: client.id,
      });
      await Traffic.update(client.props.email, {
        down: 0,
        email: client.props.email,
        total: totalGB,
        enable: 1,
        expiry_time: expiryTime,
        up: 0,
        inbound_id: inboundId,
      });
      let message = await Client.create({
        id: client.id,
        totalGB: totalGB || 0,
        inboundId,
        expiryTime: expiryTime || 0,
      });
      setTimeout(() => resetServer(), 20_000);
      if (message === "client created") message = "client recharged";
      return response.status(201).json({ message });
    } catch (error) {
      return response.status(404).json({ error });
    }
  };
}
