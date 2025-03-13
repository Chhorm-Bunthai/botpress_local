import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WhitelistController } from "./whitelist.controller";
import { WhitelistService } from "./whitelist.service";
import { Whitelist } from "./entities/whitelist.entity";
import { User } from "./entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Whitelist, User])],
  controllers: [WhitelistController],
  providers: [WhitelistService],
  exports: [WhitelistService],
})
export class WhitelistModule {}
