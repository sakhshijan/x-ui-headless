import { db } from "../lib/db";
import Sql from "sql-bricks";

export type TTraffic = {
  id: number;
  inbound_id: number;
  enable: 0 | 1;
  email: string;
  up: number;
  down: number;
  expiry_time: number;
  total: number;
  reset: number;
};

export class Traffic {
  constructor(
    public id: number,
    public props?: TTraffic,
  ) {}

  static async find() {
    return new Promise((resolve, reject) => {
      db.all(Sql.select().from("client_traffics").toString(), (error, data) => {
        if (error) return reject(error);
        return resolve(data);
      });
    });
  }

  static async create(
    props: Pick<TTraffic, "email" | "inbound_id" | "expiry_time" | "total">,
  ) {
    const sql = Sql.insertInto("client_traffics", {
      ...props,
      up: 0,
      down: 0,
      enable: 1,
    }).toString();
    return new Promise((resolve, reject) => {
      db.exec(sql, (error) =>
        error ? reject(error) : resolve("traffic created"),
      );
    });
  }

  static async update(email: string, props: Omit<TTraffic, "id" | "reset">) {
    const sql = Sql.update("client_traffics", props)
      .where({ email })
      .toString();
    return new Promise((resolve, reject) => {
      db.exec(sql, (error) =>
        error ? reject(error) : resolve("traffic updated"),
      );
    });
  }

  static async remove(email: string) {
    const sql = Sql.delete("client_traffics").where({ email }).toString();
    return new Promise((resolve, reject) => {
      db.exec(sql, (error) =>
        error ? reject(error) : resolve("traffic deleted"),
      );
    });
  }

  static async findOne(email: string): Promise<Traffic | null> {
    const sql = Sql.select()
      .from("client_traffics")
      .where({ email })
      .toString();
    return new Promise((resolve, reject) => {
      db.get(sql, (error, data: TTraffic) => {
        if (error) return reject(error);
        if (!data) return resolve(null);
        return resolve(new Traffic(data.id, data));
      });
    });
  }
}
