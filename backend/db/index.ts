import { SQLDatabase } from "encore.dev/storage/sqldb";

export default new SQLDatabase("finance_db", {
  migrations: "./migrations",
});
