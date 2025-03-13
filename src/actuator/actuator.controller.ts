import { Controller, Get, VERSION_NEUTRAL } from "@nestjs/common";

@Controller({
  version: VERSION_NEUTRAL,
  path: "actuator",
})
export class ActuatorController {
  @Get("health/liveness")
  healthLiveness() {
    return {
      status: "UP",
      message: "Liveness check passed",
    };
  }

  @Get("health/readiness")
  healthReadiness() {
    return {
      status: "UP",
      message: "Readiness check passed",
    };
  }
}
