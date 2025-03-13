import { config } from "dotenv";
import { DataSource } from "typeorm";

config();
export const connectionSource = new DataSource({
  url: process.env.DATABASE_URL,
  type: process.env.DATABASE_TYPE as "postgres",
  entities: [`dist/**/*.entity{ .ts,.js}`],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  migrationsTableName: "migrations",
});
