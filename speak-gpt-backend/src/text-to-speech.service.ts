import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TextToSpeechService {
  private client: TextToSpeechClient;

  constructor() {
    // Initialize the TextToSpeechClient
    this.client = new TextToSpeechClient();
  }

  // Function to synthesize speech using the Text-to-Speech API
  async synthesizeSpeech(requestBody) {
    // Call the Text-to-Speech API to synthesize speech based on the provided request body
    const [response] = await this.client.synthesizeSpeech(requestBody);

    // Return the audio content from the response
    return response.audioContent;
  }
}
