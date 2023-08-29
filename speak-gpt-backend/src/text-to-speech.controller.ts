import { ChatService } from './gpt.service';
import { Body, Controller, Post, Res } from '@nestjs/common';
import { TextToSpeechService } from './text-to-speech.service';
import { Response } from 'express';

@Controller('text-to-speech')
export class TextToSpeechController {
  constructor(
    private readonly textToSpeechService: TextToSpeechService,
    private readonly chatService: ChatService,
  ) {
    // Empty constructor
  }

  @Post('synthesize')
  async synthesize(@Body('text') text: string, @Res() res: Response) {
    try {
      // Generate a response using the GPT service based on the provided text
      const gptResponse = await this.chatService.chatWithGPT(text);

      // Define the request for speech synthesis
      const request = {
        input: { text: gptResponse },
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Wavenet-F',
          ssmlGender: 'FEMALE',
        },
      };

      // Use the TextToSpeechService to synthesize speech
      const audioContent =
        await this.textToSpeechService.synthesizeSpeech(request);

      // Set the appropriate content type for the response
      res.setHeader('Content-Type', 'audio/mpeg');

      // Send the synthesized audio content as the response
      res.end(audioContent);
    } catch (error) {
      console.log(error);
      // If an error occurs, send a 500 status response with an error message
      res.status(500).send('An error occurred while synthesizing speech.');
    }
  }
}
