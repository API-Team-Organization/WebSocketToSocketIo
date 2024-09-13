import { Module } from '@nestjs/common';
import { ConversionGateway } from './conversion.gateway';

@Module({
  providers: [ConversionGateway]
})
export class ConversionModule {}
