import { defineConfig } from "cypress";
import { Client } from "pg";

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
      user: "welc_test",
      password: "test_pw",
      database: "welc_test",
      port: 5432,
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
