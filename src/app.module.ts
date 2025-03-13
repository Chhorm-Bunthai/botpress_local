import { Module } from "@nestjs/common";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { ActuatorModule } from "./actuator/actuator.module";
import { ActuatorController } from "./actuator/actuator.controller";
import { TelegramModule } from "./telegram/telegram.module";
import { TelegramController } from "./telegram/telegram.controller";
import { WhitelistModule } from "./whitelist/whitelist.module";
import { DatabaseModule } from "./database/database.module";
import { DatabaseController } from "./database/database.controller";
import { DatabaseService } from "./database/database.service";
import databaseConfig from "./config/database.config";
import { UserModule } from "./wallet/user.module";
import { APP_GUARD } from "@nestjs/core";
import { ApiKeyGuard } from "./auth/guard/api.guard";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
      load: [databaseConfig],
    }),
    HttpModule,
    ActuatorModule,
    WhitelistModule,
    DatabaseModule,
    TelegramModule,
    UserModule,
  ],
  controllers: [ActuatorController, TelegramController, DatabaseController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    AppService,
    DatabaseService,
  ],
})
export class AppModule {}
