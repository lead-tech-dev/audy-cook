import { Module } from '@nestjs/common';
import { ResellersController } from './resellers.controller';

@Module({ controllers: [ResellersController] })
export class ResellersModule {}
