import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { WhitelistModule } from "src/whitelist/whitelist.module";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const dbConfig = configService.get("database");
        console.log("Database config:", dbConfig);
        return {
          ...configService.get("database"),
          namingStrategy: new SnakeNamingStrategy(),
          entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
          migrations: [`${__dirname}/../migrations/*{.ts,.js}`],
        };
      },
      inject: [ConfigService],
    }),
    WhitelistModule,
  ],
})
export class DatabaseModule {}
