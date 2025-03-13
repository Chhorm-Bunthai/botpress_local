import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Whitelist } from "./entities/whitelist.entity";
import { CreateWhiteListDto } from "./dto/create-whitelist.dto";
import { User } from "./entities/user.entity";
import { normalizedPhoneNumber } from "src/helpers/utils";

interface ValidationError {
  field: string;
  message: string;
}

@Injectable()
export class WhitelistService {
  private readonly logger = new Logger(WhitelistService.name);
  constructor(
    @InjectRepository(Whitelist)
    private readonly whitelistRepository: Repository<Whitelist>,
    @InjectRepository(User)
    private readonly userRepoSitory: Repository<User>
  ) {}

  async getWhitelist(): Promise<Whitelist[]> {
    try {
      const result = await this.whitelistRepository.find();
      this.logger.log(`Retrieved ${result.length} whitelist records`);
      return result;
    } catch (error) {
      this.logger.error("Error retrieving whitelist from database", error);
      throw error;
    }
  }

  async saveRecord(record: CreateWhiteListDto): Promise<void> {
    try {
      // Set default values for min_amount and max_amount if not provided
      const min_amount = record.minAmount || 0;
      const max_amount = record.maxAmount || record.maxLimit;

      const whitelistEntry = this.whitelistRepository.create({
        phone_number: record.phoneNumber,
        max_limit: record.maxLimit,
        industry: record.industry,
        min_amount: min_amount,
        max_amount: max_amount,
      });

      await this.whitelistRepository.save(whitelistEntry);
      this.logger.log(`Record saved successfully: ${record.phoneNumber}`);
    } catch (error) {
      this.logger.error("Error saving record to database", error);
      throw error;
    }
  }

  async saveRecords(records: CreateWhiteListDto[]): Promise<void> {
    for (const record of records) {
      const validationErrors = this.validateRecord(record);
      if (validationErrors.length > 0) {
        this.logValidationErrors(record, validationErrors);
        continue;
      }

      await this.saveRecord(record);
    }
  }

  async getUser(query: any): Promise<any> {
    console.log("ChatID", JSON.stringify(query, null, 2));
    try {
      if (!query || !query.chatId) {
        return null;
      }

      const chatIdValue = parseInt(query.chatId);
      if (isNaN(chatIdValue)) {
        this.logger.warn(`Could not parse chatId: ${query.chatId}`);
        return null; // Return null for invalid chat IDs
      }

      const user = await this.userRepoSitory.findOne({
        where: { chat_id: chatIdValue },
      });

      // Log but don't throw error if user not found
      if (!user) {
        this.logger.log(`No user found with chat_id: ${query.chatId}`);
        return null;
      }

      this.logger.log(`Retrieved user with chat_id: ${query.chatId}`);
      console.log("result", user);
      return user;
    } catch (error) {
      this.logger.error("Error retrieving user from database", error);
      // Return null instead of rethrowing error
      return null;
    }
  }
  async findByPhoneNumber(phoneNumber: string): Promise<any> {
    console.log("phoneNumber", phoneNumber);
    try {
      const user = await this.userRepoSitory.findOne({
        where: { phone_number: phoneNumber },
      });
      console.log("result fund by findByPhoneNumber", user);
      return user;
    } catch (error) {
      this.logger.error(
        "Error retrieving whitelist record from Neon database",
        error
      );
      throw error;
    }
  }

  async createUser(user: any): Promise<any> {
    const normalizedNumber = normalizedPhoneNumber(user.phoneNumber);
    try {
      // Create new user entity
      const newUser = this.userRepoSitory.create({
        chat_id: user.chatId,
        phone_number: normalizedNumber,
      });

      // Save to database
      const result = await this.userRepoSitory.save(newUser);

      this.logger.log(`User created successfully with chat_id: ${user.chatId}`);
      this.logger.log(`User created successfully with result: ${result}`);
      return result;
    } catch (error) {
      this.logger.error("Error creating user in database", error);
      throw error;
    }
  }

  private validateRecord(record: CreateWhiteListDto): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!this.isValidPhoneNumber(record.phoneNumber)) {
      errors.push({
        field: "phone_number",
        message: "Phone number is missing or invalid",
      });
    }

    if (!this.isValidMaxLimit(record.maxAmount)) {
      errors.push({
        field: "max_limit",
        message: "Max limit is not a valid number",
      });
    }

    if (!this.isValidIndustry(record.industry)) {
      errors.push({
        field: "industry",
        message: "Industry is missing or invalid",
      });
    }

    return errors;
  }

  private isValidPhoneNumber(phoneNumber: any): boolean {
    // Can be extended with phone number format validation
    return !!phoneNumber;
  }

  private isValidMaxLimit(maxLimit: any): boolean {
    return !isNaN(maxLimit) && maxLimit !== null && maxLimit !== undefined;
  }

  private isValidIndustry(industry: any): boolean {
    // Can be extended with allowed industry validation
    return !!industry;
  }

  private logValidationErrors(
    record: CreateWhiteListDto,
    errors: ValidationError[]
  ): void {
    const errorMessages = errors
      .map((err) => `${err.field}: ${err.message}`)
      .join(", ");
    this.logger.warn(
      `Skipping invalid record: ${JSON.stringify(record)}. Errors: ${errorMessages}`
    );
  }
}
