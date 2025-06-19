import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthenticationClientModule } from 'nestjs-authentication-module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { LoggingInterceptor } from './interceptors';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        API_PREFIX: Joi.string().default('api'),
        MONGODB_URI: Joi.string().required(),
        JWKS_URL: Joi.string().optional(),
        JWT_PUBLIC_KEY: Joi.string().when('JWKS_URL', {
          is: Joi.exist(),
          then: Joi.string().optional(),
          otherwise: Joi.string().required(),
        }),
        JWT_ISSUER: Joi.string().required(),
        JWT_AUDIENCE: Joi.string().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    AuthenticationClientModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        if (configService.get('JWKS_URL')) {
          return {
            jwksUrl: configService.get<string>('JWKS_URL'),
            issuer: configService.get<string>('JWT_ISSUER') as string,
            audience: configService.get<string>('JWT_AUDIENCE') as string,
          };
        }
        return {
          publicKey: configService.get<string>('JWT_PUBLIC_KEY'),
          issuer: configService.get<string>('JWT_ISSUER') as string,
          audience: configService.get<string>('JWT_AUDIENCE') as string,
        };
      },
    }),
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
