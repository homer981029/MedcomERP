import { Controller, Get } from '@nestjs/common';
import { NiggaService } from './nigga.service';

@Controller('Nigga')
export class NiggaController {
  constructor(private readonly niggaService: NiggaService) {}

  @Get()
  getNigga(): string {
    return this.niggaService.getNigga();
  }
}
