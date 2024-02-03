import express from "express";
import { Client } from "../models/client";
import { ClientController } from "../controllers/client.controller";
import { TrafficController } from "../controllers/traffic.controller";
import { InboundController } from "../controllers/inbound.controller";

const root = express.Router();

root.get("/ping", (req, res) => res.status(200).json("pong"));

root.post("/clients", ClientController.addClient);
root.get("/clients", ClientController.list);
root.get("/clients/:id", ClientController.get);
root.post("/clients/:id", ClientController.recharge);
root.delete("/clients/:id", ClientController.remove);

root.get("/inbounds", InboundController.list);
root.get("/inbounds/:id", InboundController.get);

root.get("/traffics", TrafficController.list);
root.get("/traffics/:email", TrafficController.get);
root.patch("/traffics/:email/reset", TrafficController.resetTraffic);

root.get("/test", async (req, res) => {
  res.json(await Client.findOne(req.query.id as any));
});

export default root;
