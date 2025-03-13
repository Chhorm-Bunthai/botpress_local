import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

/**
 * Config Module
 */
import databaseConfig from "./database.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
      load: [databaseConfig],
    }),
  ],
})
export class ConfigAppModule {}
