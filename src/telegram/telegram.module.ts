import { Module } from "@nestjs/common";
import { TelegramService } from "./telegram.service";
import { TelegramController } from "./telegram.controller";
import { WhitelistModule } from "src/whitelist/whitelist.module";

@Module({
  imports: [WhitelistModule],
  providers: [TelegramService],
  controllers: [TelegramController],
  exports: [TelegramService],
})
export class TelegramModule {}
