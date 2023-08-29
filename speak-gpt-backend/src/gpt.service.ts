import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class ChatService {
    private openai: OpenAI;
    private conversationHistory: {
        role: 'function' | 'user' | 'system' | 'assistant'; // Possible roles in the conversation
        content: string; // Content of the message
    }[] = []

    constructor() {
        // Initialize the OpenAI instance with the provided API key
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        })
    }

    // Function to conduct a conversation with the GPT-3 model
    async chatWithGPT(content: string) {
        // Add user's message to the conversation history
        this.conversationHistory.push({
            role: 'user',
            content: content,
        })

        // Create a chat completion request using OpenAI API
        const chatCompletion = await this.openai.chat.completions.create({
            messages: [
                // Initial system message to set the assistant's behavior
                { role: 'system', content: 'you are a helpful assistant' },
                // Include the conversation history in the request
                ...this.conversationHistory,
            ],
            model: "gpt-3.5-turbo", // Specify the GPT-3 model
        })

        // Add assistant's response to the conversation history
        this.conversationHistory.push({
            role: 'assistant',
            content: chatCompletion.choices[0].message.content,
        })

        // Return the content of the assistant's response
        return chatCompletion.choices[0].message.content;
    }
}
