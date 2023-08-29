import { TextToSpeechService } from './text-to-speech.service';
import { Module } from '@nestjs/common';
import { TextToSpeechController } from './text-to-speech.controller';
import { ChatService } from './gpt.service';

@Module({
  imports: [],
  controllers: [TextToSpeechController],
  providers: [TextToSpeechService, ChatService],
})
export class AppModule {}
