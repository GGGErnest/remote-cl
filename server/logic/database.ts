// Remember to set type: module in package.json or use .mjs extension
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import lodash from "lodash";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { DataBaseSchema } from "../types/database-schema";

class LowWithLodash<T> extends Low<T> {
  chain: lodash.ExpChain<T> = lodash.chain(this).get("data");
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultData: DataBaseSchema = {
   authentication:{refreshAuthToken:'DefaultR3FreshTo3ken*s',refreshTokens:[],secret:'Tok3nsSe@crets*2md77621ma99912m3m*&^43@'},
   users:{admin:{username:'ernesto',password:'Acceso891123*'}},
   servers: [] };
let db: LowWithLodash<DataBaseSchema>;

function cleanUpTerminalsWhenStartingTheServer() {
  // clean up terminals from all servers since all are gone after a server restart
  const servers = db.chain.get("servers").value();
  servers.forEach((server) => {
    server.runningShells = {};
  });

  db.write();

  console.log("DB initialized");
}

export function initDB() {
  // db.json file path
  const file = join(__dirname, "../state/db.json");

  // Configure lowdb to write data to JSON file
  const adapter = new JSONFile<DataBaseSchema>(file);
  db = new LowWithLodash(adapter, defaultData);
  db.read().then(() => cleanUpTerminalsWhenStartingTheServer());
}

export function getDB() {
  return db;
}
