import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { TelegramModule } from "src/telegram/telegram.module";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [TelegramModule, HttpModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
