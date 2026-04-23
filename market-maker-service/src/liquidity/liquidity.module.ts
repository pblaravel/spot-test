import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LiquidityService } from './liquidity.service';
import { LiquidityController } from './liquidity.controller';

@Module({
  imports: [HttpModule.register({ timeout: 10000, maxRedirects: 3 })],
  controllers: [LiquidityController],
  providers: [LiquidityService],
  exports: [LiquidityService],
})
export class LiquidityModule {}
