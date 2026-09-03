import { defineConfig } from "cypress";
import { Client } from "pg";

function queryTestDb(query, config) {
  const client = new Client(config.env.db);

  return new Promise((resolve, reject) => {
    client
      .connect()
      .then(() => client.query(query))
      .then((res) => {
        client.end();
        resolve(res.rows); // postgres returns rows object
      })
      .catch((err) => {
        client.end();
        reject(err);
      });
  });
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
        queryDb: (query) => {
          return queryTestDb(query, config);
        },
      });
    },
  },
});
