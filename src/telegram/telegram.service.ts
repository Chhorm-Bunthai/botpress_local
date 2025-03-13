import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { Telegraf } from "telegraf";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
@Injectable()
export class TelegramService implements OnApplicationBootstrap {
  public bot: Telegraf;
  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>("TELEGRAM_BOT_TOKEN");
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN is not defined");
    }
    this.bot = new Telegraf(token);
  }
  async onApplicationBootstrap() {
    await this.setupWebhook();
    const webhookUrl = this.configService.get<string>("TELEGRAM_WEBHOOK_URL");
    if (!webhookUrl) {
      throw new Error("TELEGRAM_WEBHOOK_URL is not defined");
    }
  }
  private async setupWebhook() {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await this.bot.telegram.deleteWebhook();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const webhookUrl = `${this.configService.get("TELEGRAM_WEBHOOK_URL")}/telegram-webhook`;
    await this.bot.telegram.setWebhook(webhookUrl);

    try {
      const webhookInfo = await this.bot.telegram.getWebhookInfo();
      console.log("this is webhook info", webhookInfo);
    } catch (err) {
      if (err.response?.error_code === 429) {
        console.log("Rate limited, waiting before retry...");
        const retryAfter =
          (err.response.parameters.retry_after || 1) * 1000 + 500;
        await new Promise((resolve) => setTimeout(resolve, retryAfter));
        return this.setupWebhook();
      }
      console.error("Webhook setup failed:", err.message);
    }
  }

  async sendMessage(chatId: number, text: string): Promise<void> {
    console.log("this is chatId in sendMessage", chatId);
    console.log("this is text in sendMessage", text);
    await axios.post(
      `${process.env.TELEGRAM_URL}${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      { chat_id: chatId, text: text }
    );
  }

  async sendQuickReplies(
    chatId: number,
    payload: { text: string; actions: any[] }
  ): Promise<void> {
    const inlineKeyboard = payload.actions.map((action) =>
      action.action === "Open URL" && action.url
        ? [
            {
              text: action.title,
              url: action.url,
            },
          ]
        : [
            {
              text: action.title,
              callback_data: action.payload || action.text,
            },
          ]
    );

    await axios.post(
      `${process.env.TELEGRAM_URL}${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: payload.text,
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      }
    );
  }

  async sendDropdownMenu(
    chatId: number,
    payload: {
      message: string;
      options: { label: string; value: string }[];
    }
  ): Promise<void> {
    // For one button per row, set chunkSize to 1
    const chunkSize = 1;
    const keyboard: { text: string; request_contact?: boolean }[][] = [];

    for (let i = 0; i < payload.options.length; i += chunkSize) {
      const chunk = payload.options.slice(i, i + chunkSize);
      const row = chunk.map((opt) =>
        opt.value === "request_contact"
          ? { text: opt.label, request_contact: true }
          : { text: opt.label }
      );
      keyboard.push(row);
    }

    await axios.post(
      `${process.env.TELEGRAM_URL}${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: payload.message,
        reply_markup: {
          keyboard: keyboard,
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      }
    );
  }

  async sendChatAction(chatId: number, action: string): Promise<void> {
    await this.bot.telegram.sendChatAction(chatId, "typing");
  }

  async getUserInfo(userId: number, botToken?: string): Promise<any> {
    try {
      // Use provided token or fall back to default
      const token = botToken || process.env.WALLET_TELEGRAM_BOT_TOKEN;

      // Make request to Telegram API
      const response = await axios.post(
        `https://api.telegram.org/bot${token}/getChat`,
        { chat_id: userId }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Error fetching user info:",
        error.response?.data || error.message
      );
      throw error;
    }
  }
}
