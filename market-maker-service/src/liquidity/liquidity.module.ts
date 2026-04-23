import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LiquidityService } from './liquidity.service';

@Module({
  imports: [HttpModule.register({ timeout: 10000, maxRedirects: 3 })],
  providers: [LiquidityService],
  exports: [LiquidityService],
})
export class LiquidityModule {}
