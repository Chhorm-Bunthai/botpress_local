import { registerAs } from "@nestjs/config";

export default registerAs("database", () => {
  return {
    logging: false,
    synchronize: false,
    autoLoadEntities: true,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    username: process.env.DATABASE_USERNAME,
    type: "postgres",
    ssl:
      process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: false }
        : false,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT as string, 10),
  };
});
