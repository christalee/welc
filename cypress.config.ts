import { defineConfig } from "cypress";
import { Client } from "pg";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.testing' });

async function queryTestDb(query: string, config: Cypress.PluginConfigOptions) {
  const client = new Client(config.env.db);
  await client.connect();
  try {
    const result = await client.query(query);
    return result.rows;
  } catch (err) {
    console.error("Query failed: ", err);
    throw err;
  } finally {
    await client.end();
  }
}

export default defineConfig({
  allowCypressEnv: false,
  env: {
    db: {
      host: "localhost",
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    },
  },
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        async queryDb(query) {
          return await queryTestDb(query, config);
        },
      });
    },
  },
});
