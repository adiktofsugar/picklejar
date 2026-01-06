import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { DB } from "./db-types";

export function createDb(db: D1Database) {
  return new Kysely<DB>({
    dialect: new D1Dialect({ database: db }),
  });
}
