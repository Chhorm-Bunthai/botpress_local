import { Controller, Post, Body } from "@nestjs/common";
import { TelegramService } from "./telegram.service";
import axios from "axios";
import axiosRetry from "axios-retry";
import { WhitelistService } from "src/whitelist/whitelist.service";

// Configure axios to automatically retry requests on HTTP 429 or transient network errors.
axiosRetry(axios, {
  retries: 10, // Maximum number of retries
  retryCondition: (error) => {
    // Retry for HTTP status 429 (rate limited) or for network errors.
    return (
      error.response?.status === 429 ||
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.code === "ECONNABORTED" // This will catch timeout errors
    );
  },
  retryDelay: (retryCount, error) => {
    // If the server sent a "Retry-After" header, use that value (converted to ms).
    if (
      error.response &&
      error.response.headers &&
      error.response.headers["retry-after"]
    ) {
      return parseInt(error.response.headers["retry-after"], 10) * 1000;
    }
    // Otherwise, use an exponential delay.
    return axiosRetry.exponentialDelay(retryCount);
  },
});
@Controller("telegram-webhook")
export class TelegramController {
  private readonly botpressUrl = process.env.BOTPRESS_URL ?? "";

  constructor(
    private readonly telegramService: TelegramService,
    private readonly whitelistService: WhitelistService
  ) {}

  @Post()
  async handleWebhook(@Body() update: any): Promise<void> {
    const chatId =
      update.message?.chat?.id || update.callback_query?.message?.chat?.id;
    if (!chatId) {
      console.error("No chat ID found in the update:", update);
      return;
    }
    console.log("this is update getting from tg", update);

    const botpressPayload = this.buildBotpressPayload(update);
    console.log("this is update logic from telegram", update.message);

    if (update.message?.contact) {
      try {
        console.log("Attempting to whitelist user with:", {
          url: `${process.env.NGROK_URL}/whitelist/user`,
        });

        await this.whitelistService.createUser({
          chatId: chatId,
          phoneNumber: update.message.contact.phone_number,
        });

        console.log("Successfully whitelisted user");
      } catch (error) {
        console.error("Failed to whitelist user:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: error.config,
        });
      }
    }

    await this.sendToBotpress(chatId, botpressPayload);
  }

  private buildBotpressPayload(update: any): any {
    if (update.message?.contact) {
      return {
        type: "text",
        text: update.message.contact.phone_number,
        includedContexts: ["global"],
        metadata: update.message.contact,
      };
    } else if (update.callback_query) {
      return {
        type: "text",
        text: update.callback_query.data,
        includedContexts: ["global"],
        metadata: update.callback_query,
      };
    } else if (update.message?.text) {
      return {
        type: "text",
        text: update.message.text,
        includedContexts: ["global"],
        metadata: update,
      };
    } else {
      // Optional: Add a safe fallback or logging
      console.warn("Unexpected update structure", update);
      return {
        type: "text",
        text: "Sorry, I did not understand that.",
        includedContexts: ["global"],
        metadata: update,
      };
    }
  }

  private async sendToBotpress(chatId: number, payload: any): Promise<void> {
    await this.telegramService.sendChatAction(chatId, "typing");
    let typingInterval = setInterval(async () => {
      await this.telegramService.sendChatAction(chatId, "typing");
    }, 3000);
    try {
      const response = await axios.post(
        `${this.botpressUrl}/api/v1/bots/wing-loan-flow-messenger/converse/${chatId}`,
        payload,
        { timeout: 4000 }
      );

      clearInterval(typingInterval);
      console.log("this is response", response);
      console.log("this is response.data", response.data);
      console.log("this is response.data.responses", response.data.responses);
      // Ensure that Botpress returns the expected responses array.
      if (response.data && Array.isArray(response.data.responses)) {
        for (const msg of response.data.responses) {
          console.log("this msg", msg);
          await this.handleBotpressMessage(chatId, msg);
        }
      } else {
        console.error(
          "Unexpected response structure from Botpress:",
          response.data
        );
      }
    } catch (error) {
      // Stop typing indicator when there's an error
      clearInterval(typingInterval);
      if (error.code === "ECONNABORTED") {
        console.error(
          `Botpress request timed out after ${error.config?.timeout || "unknown"}ms`
        );

        // Send a temporary failure message to the user
        await this.telegramService.sendMessage(
          chatId,
          "I'm having trouble processing your request right now. Please try again in a moment."
        );
      } else {
        console.error(
          "Error communicating with Botpress:",
          error.response?.data || error.message
        );
      }
    }
  }

  private async handleBotpressMessage(chatId: number, msg: any): Promise<void> {
    console.log("this is chatId in handleBotpressMessage", chatId);
    console.log("this is msg in handleBotpressMessage", msg);
    if (msg.type === "text") {
      await this.telegramService.sendMessage(chatId, msg.text);
    } else if (msg.type === "card") {
      await this.telegramService.sendQuickReplies(chatId, {
        text: msg.subtitle,
        actions: msg.actions,
      });
    } else if (msg.type === "dropdown") {
      await this.telegramService.sendDropdownMenu(chatId, {
        message: msg.message,
        options: msg.options,
      });
    } else {
      console.warn("Unknown message type:", msg.type);
    }
  }
}
