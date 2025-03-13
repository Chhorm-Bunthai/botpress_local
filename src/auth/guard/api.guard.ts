import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { Observable } from "rxjs";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private httpService: HttpService) {
    // Intercept all outgoing requests to attach API key
    this.httpService.axiosRef.interceptors.request.use((config) => {
      config.headers["apiKey"] = process.env.API_KEY;
      return config;
    });
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    // This guard doesn't block any requests, it just adds headers
    return true;
  }
}
