import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TossService } from './toss.service';

@Module({
  imports: [ConfigModule],
  providers: [TossService],
  exports: [TossService],
})
export class TossModule {}
