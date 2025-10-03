import { Injectable } from '@nestjs/common';

@Injectable()
export class NiggaService {
  getNigga(): string {
    return 'Hello niggaaa!';
  }
}
