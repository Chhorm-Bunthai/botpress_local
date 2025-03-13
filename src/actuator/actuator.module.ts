import { Module } from "@nestjs/common";
import { ActuatorService } from "./actuator.service";
import { ActuatorController } from "./actuator.controller";

@Module({
  providers: [ActuatorService],
  controllers: [ActuatorController],
})
export class ActuatorModule {}
