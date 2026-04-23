import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SpotExchangeController } from './spot-exchange.controller';
import { SpotExchangeService } from './spot-exchange.service';

@Module({
  imports: [HttpModule],
  controllers: [SpotExchangeController],
  providers: [SpotExchangeService],
  exports: [SpotExchangeService],
})
export class SpotExchangeModule {} 