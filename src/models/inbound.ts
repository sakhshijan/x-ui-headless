import { db } from "../lib/db";
import Sql from "sql-bricks";
import { Client, TClient } from "./client";
import crypto from "crypto";
import { Traffic } from "./traffic";

export type TInbound = {
  id: number;
  user_id: number;
  up: number;
  down: number;
  total: number;
  remark: string;
  enable: 1 | 0;
  expiry_time: number;
  listen: string;
  port: number;
  protocol: "vless" | "vmess";
  settings: { clients: TClient[] };
  stream_settings: string;
  sniffing: string;
  tag: string;
};

export class Inbound {
  constructor(
    public id: number,
    public props?: TInbound,
  ) {}

  async get() {
    const inbound = await Inbound.findOne(this.id);
    if (!inbound) throw "Inbound not founded!";
    this.props = inbound.props;
    return this;
  }

  async addClient(
    props: Pick<TClient, "totalGB" | "expiryTime" | "id">,
  ): Promise<string | null | undefined> {
    const inbound = await this.get();
    const subId = crypto.randomBytes(8).toString("hex");
    const client: Omit<TClient, "traffics"> = {
      ...props,
      id: props.id,
      subId,
      email: props.id,
      flow: "",
      inboundId: inbound.id,
      enable: true,
      tgId: "",
      reset: 0,
    };
    inbound.props.settings.clients.push(client);
    await Traffic.create({
      email: client.email,
      inbound_id: inbound.id,
      expiry_time: client.expiryTime,
      total: client.totalGB,
    });
    const sql = Sql.update("inbounds", {
      settings: JSON.stringify(inbound.props.settings),
    })
      .where({ id: inbound.id })
      .toString();
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        err ? reject(err) : resolve("client created");
      });
    });
  }

  async getClients() {
    const inbound = await this.get();
    if (!inbound) return null;
    return inbound.props.settings.clients;
  }

  static async removeClient(
    clientId: string,
  ): Promise<string | null | undefined> {
    const client = await Client.findOne(clientId);
    if (!client) return;
    const inbound = new Inbound(client.props.inboundId);
    await inbound.get();
    inbound.props.settings.clients = inbound.props.settings.clients.filter(
      ({ id }) => id !== clientId,
    );
    const sql = Sql.update("inbounds", {
      settings: JSON.stringify(inbound.props.settings),
    })
      .where({ id: inbound.id })
      .toString();
    await Traffic.remove(client.props.email);
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        err ? reject(err) : resolve("client deleted");
      });
    });
  }

  static async getAllClients(): Promise<Client[]> {
    const inbounds = await Inbound.find();
    return inbounds
      .map((inbound) => inbound.props.settings.clients)
      .flat()
      .map(Client.parse);
  }

  static async find(): Promise<Inbound[]> {
    return new Promise((resolve, reject) => {
      db.all(Sql.select().from("inbounds").toString(), (error, data: any[]) => {
        if (error) return reject(error);
        return resolve(data.map(this.parse));
      });
    });
  }

  static async findOne(id: number): Promise<Inbound | null> {
    return new Promise((resolve, reject) => {
      db.get(
        Sql.select().from("inbounds").where({ id }).toString(),
        (error, data: any) => {
          if (error) return reject(error);
          if (!data) return resolve(null);
          return resolve(Inbound.parse(data));
        },
      );
    });
  }

  static parse(d: any) {
    const { id, ...rest } = d;
    const settings = JSON.parse(rest.settings);
    return new Inbound(id, {
      ...rest,
      settings: {
        ...settings,
        clients: settings.clients.map((client: TClient) => ({
          ...client,
          inboundId: id,
        })),
      },
      stream_settings: JSON.parse(rest.stream_settings),
      sniffing: JSON.parse(rest.sniffing),
    });
  }
}
