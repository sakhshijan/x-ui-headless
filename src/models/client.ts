import { Inbound } from "./inbound";
import { Traffic } from "./traffic";

export type TClient = {
  traffics?: Traffic;
  email?: string;
  enable?: boolean;
  expiryTime?: number;
  flow?: string;
  id: string;
  reset?: number;
  subId?: string;
  tgId?: string;
  totalGB?: number;
  inboundId: number;
};

export class Client {
  constructor(
    public id: string,
    public props: TClient,
  ) {}

  async get(): Promise<Client> {
    return Client.findOne(this.id);
  }

  static async create({
    inboundId,
    ...props
  }: Pick<TClient, "inboundId" | "totalGB" | "expiryTime" | "id">) {
    const inbound = new Inbound(inboundId);
    return inbound.addClient({ ...props });
  }

  static async find() {
    return await Inbound.getAllClients();
  }

  static async findOne(id: string) {
    const clients = await Inbound.getAllClients();
    const client = clients.find(({ id: _id }) => _id === id);
    if (!client) return null;
    client.props.traffics = await Traffic.findOne(client.props.email);
    return client;
  }

  static async remove(id: string) {
    return await Inbound.removeClient(id);
  }

  async remove() {
    return await Inbound.removeClient(this.id);
  }

  static parse(d: any) {
    return new Client(d.id, d);
  }
}
