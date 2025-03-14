import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { Response } from "express";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import axios from "axios";

@Controller("user-profile")
export class UserController {
  private updateData: any = {};
  constructor(
    private readonly userService: UserService,
    private readonly httpService: HttpService
  ) {}

  @Post("telegram-webhook/user")
  async handleUserBotWebhook(@Body() update: any) {
    console.log("this is update from wallet", update);
    if (update.message && update.message.text === "/start") {
      this.userService.sendCardWithUrlButton(update.message.chat.id, {
        text: "Your Wallet is set and ready.\nYou can start using crypto in Telegram",
        buttonUrl: "https://t.me/wing_wallet_dev_bot/WalletApp",
        buttonText: "Open Wallet",
        imageUrl:
          "https://images.unsplash.com/photo-1621504450181-5d356f61d307?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      });
    }
    this.updateData = update;
    return this.userService.bot.handleUpdate(update);
  }

  @Get("image/:field")
  async getTelegramUserImage(
    @Param("field") field: string,
    @Res() res: Response
  ) {
    try {
      const fileInfoUrl = `https://api.telegram.org/bot${process.env.WALLET_TELEGRAM_BOT_TOKEN}/getFile?file_id=${field}`;
      const fileResponse = await axios.get(fileInfoUrl);
      const filePath = fileResponse.data.result.file_path;
      const photoUrl = `https://api.telegram.org/file/bot${process.env.WALLET_TELEGRAM_BOT_TOKEN}/${filePath}`;
      console.log("this is photoUrl", photoUrl);
      const imageResponse = await firstValueFrom(
        this.httpService.get(photoUrl, { responseType: "stream" })
      );
      console.log("this is image response", imageResponse);

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", imageResponse.headers["content-type"]);
      res.setHeader("Content-Length", imageResponse.headers["content-length"]);
      imageResponse.data.pipe(res);
    } catch (error) {
      console.error(
        "Error fetching telegram user image:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

  @Get()
  async getUserInfo(): Promise<any> {
    try {
      if (!this.hasValidUserData()) {
        return {
          success: false,
          error:
            "No user has interacted with the bot yet or user data is not available",
        };
      }
      const userData = await this.userService.getUserProfile(
        this.updateData.message.chat.id
      );
      return userData;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private hasValidUserData(): boolean {
    return Boolean(this.updateData?.message?.chat);
  }
}
