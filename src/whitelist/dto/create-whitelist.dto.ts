import { IsString, IsNumber, IsOptional, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateWhiteListDto {
  @ApiProperty({ description: "Phone number in E.164 format" })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: "Maximum transaction limit" })
  @IsNumber()
  @Min(0)
  maxLimit: number;

  @ApiProperty({ description: "Industry category", required: false })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiProperty({ description: "Minimum transaction amount allowed" })
  @IsNumber()
  @Min(0)
  minAmount: number;

  @ApiProperty({ description: "Maximum transaction amount allowed" })
  @IsNumber()
  @Min(0)
  maxAmount: number;
}
