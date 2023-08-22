// Remember to set type: module in package.json or use .mjs extension
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import lodash from 'lodash';

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { DataBaseSchema } from '../types/database-schema';


class LowWithLodash<T> extends Low<T> {
    chain: lodash.ExpChain<T> = lodash.chain(this).get('data');
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultData: DataBaseSchema = {servers:[]};
let db: LowWithLodash<DataBaseSchema>;

export function initDB() {

console.log('DB initialized');
 // db.json file path
 const file = join(__dirname, '../state/db.json');

 // Configure lowdb to write data to JSON file
const adapter = new JSONFile<DataBaseSchema>(file);
db = new LowWithLodash(adapter, defaultData);
db.read().then();
}

export function getDB() {
    return db;
}
