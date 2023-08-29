import { ChatService } from './gpt.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Endpoint to communicate with GPT-3 model
  @Post('talk')
  async talkToGPT(@Body('content') content: string) {
    // Call the chatWithGPT method from the ChatService to interact with the model
    return this.chatService.chatWithGPT(content);
  }
}
