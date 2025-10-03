//  src/common/pipes/trim-string.pipe.ts （自訂管道，去除字串前後空白）

import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimStringPipe implements PipeTransform {
  transform(value: any) {
    return typeof value === 'string' ? value.trim() : value;
  }
}
