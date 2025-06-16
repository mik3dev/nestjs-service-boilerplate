import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationClientModule } from 'nestjs-authentication-module';
import { TodosModule } from './todos/todos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        API_PREFIX: Joi.string().default('api'),
        MONGODB_URI: Joi.string().required(),
        JWKS_URL: Joi.string().required(),
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
      useFactory: (configService: ConfigService) => ({
        jwksUrl: configService.get<string>('JWKS_URL'),
        issuer: configService.get<string>('JWT_ISSUER') as string,
        audience: configService.get<string>('JWT_AUDIENCE') as string,
      }),
    }),
    TodosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
