import { verbose } from "sqlite3";

const sqlite3 = verbose();
// const dbConnection = __dirname + "/x-ui.db";
const dbConnection = "/etc/x-ui/x-ui.db";

export const db = new sqlite3.Database(dbConnection, sqlite3.OPEN_READWRITE);
