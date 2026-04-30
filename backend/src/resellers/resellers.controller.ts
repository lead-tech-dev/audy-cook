import { Controller, Get } from '@nestjs/common';
import { RESELLERS_DATA } from './resellers.data';

@Controller()
export class ResellersController {
  @Get('resellers')
  list() {
    return RESELLERS_DATA;
  }

  @Get('whatsapp')
  whatsapp() {
    return { number: process.env.WHATSAPP_NUMBER || '352661299974' };
  }
}
