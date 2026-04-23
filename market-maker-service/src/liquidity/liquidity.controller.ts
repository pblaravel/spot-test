import { Controller, Get } from '@nestjs/common';
import { LiquidityService } from './liquidity.service';

@Controller('liquidity')
export class LiquidityController {
  constructor(private readonly liquidity: LiquidityService) {}

  @Get('account')
  getAccount() {
    return this.liquidity.getAccountState();
  }
}
