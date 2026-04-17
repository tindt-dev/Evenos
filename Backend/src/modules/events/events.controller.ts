import { Controller, Get, Param } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async listPublished() {
    return this.eventsService.listPublished();
  }

  @Get(':id')
  async getPublished(@Param('id') id: string) {
    return this.eventsService.getPublishedById(id);
  }
}
