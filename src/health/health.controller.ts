import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  MongooseHealthIndicator,
  DiskHealthIndicator,
  MemoryHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { AppService } from '../app.service';

/**
 * Health controller provides endpoints for monitoring system health
 * Used by container orchestration, load balancers, and monitoring systems
 */
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly mongooseHealth: MongooseHealthIndicator,
    private readonly diskHealth: DiskHealthIndicator,
    private readonly memoryHealth: MemoryHealthIndicator,
    private readonly appService: AppService,
  ) {}

  /**
   * Main health check endpoint following standard Kubernetes patterns
   * Verifies critical subsystems: database, disk, and memory
   */
  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.healthCheckService.check([
      // Database health check
      async () => this.mongooseHealth.pingCheck('database'),

      // Disk usage check - 90% threshold
      async () =>
        this.diskHealth.checkStorage('disk', {
          path: '/',
          thresholdPercent: 0.9,
        }),

      // Memory health checks - 300MB thresholds
      async () => this.memoryHealth.checkHeap('memory_heap', 300 * 1024 * 1024),
      async () => this.memoryHealth.checkRSS('memory_rss', 300 * 1024 * 1024),
    ]);
  }

  /**
   * Lightweight liveness probe that returns quickly without checking dependencies
   * Used for container orchestration to determine if process is running
   */
  @Get('liveness')
  liveness() {
    const { name, version } = this.appService.getInfo();

    return {
      status: 'ok',
      service: name,
      version: version,
      timestamp: new Date().toISOString(),
    };
  }
}
