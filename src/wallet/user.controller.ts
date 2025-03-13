import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller("user-profile")
export class UserController {
  private updateData: any = {};
  constructor(private readonly userService: UserService) {}

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
