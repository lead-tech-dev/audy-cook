import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './checkout.dto';

@Controller()
export class CheckoutController {
  constructor(private readonly service: CheckoutService) {}

  @Post('checkout/session')
  async create(@Body() dto: CheckoutDto) {
    return this.service.createSession(dto);
  }

  @Get('checkout/status/:sessionId')
  async status(@Param('sessionId') sessionId: string) {
    return this.service.getStatus(sessionId);
  }
}
