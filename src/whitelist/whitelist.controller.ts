import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import * as XLSX from "xlsx";
import { WhitelistService } from "./whitelist.service";
import { CreateWhiteListDto } from "./dto/create-whitelist.dto";
import { normalizedPhoneNumber } from "src/helpers/utils";

@Controller("whitelist")
export class WhitelistController {
  constructor(private readonly whitelistService: WhitelistService) {}

  @Get()
  async getWhitelist() {
    return this.whitelistService.getWhitelist();
  }

  @Post()
  async addWhitelistRecord(
    @Body()
    record: CreateWhiteListDto
  ) {
    console.log("this is record dto", record);
    await this.whitelistService.saveRecord(record);
    return { message: "Record added successfully" };
  }

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadWhitelistExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException(
        `Please provide correct file name with extension`,
        400
      );
    }

    // Read the Excel file from memory
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    let rawData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    // Map the data to match your schema
    const whitelistData = rawData.map((row: any) => ({
      phoneNumber: row.PHONE_NUMBER?.toString().trim(),
      maxLimit: Number(row.MAX_LIMIT),
      industry: row.INDUSTRY?.toString().trim(),
      minAmount: row.MIN_AMOUNT ? Number(row.MIN_AMOUNT) : undefined,
      maxAmount: row.MAX_AMOUNT ? Number(row.MAX_AMOUNT) : undefined,
    }));

    console.log("this is whitelistData", whitelistData);
    // Save all records to database
    await this.whitelistService.saveRecords(
      whitelistData as CreateWhiteListDto[]
    );

    return { message: "Whitelist data uploaded successfully" };
  }

  @Get("user")
  async getUser(@Query() chatId: number) {
    const response = await this.whitelistService.getUser(chatId);
    // Handle null response gracefully
    if (!response) {
      return { found: false, message: "User not found" };
    }
    console.log("this is response", response);
    if (response.phone_number) {
      const normalizedPhone = normalizedPhoneNumber(response.phone_number);
      console.log("normalizedPhone", normalizedPhone);
      const whitelistEntry =
        await this.whitelistService.findByPhoneNumber(normalizedPhone);
      console.log("this is whitelistEntry", whitelistEntry);
      return {
        ...response,
        maxLimit: whitelistEntry?.max_limit,
        isWhitelist: !!whitelistEntry,
      };
    }
    return response;
  }

  @Post("user")
  async createUser(@Body() user: any) {
    console.log("create user body", user);
    return this.whitelistService.createUser(user);
  }
}
