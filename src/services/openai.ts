import { config, OPENAI_CHAT_URL } from '@/lib/config';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `You are Splatt Space's travel assistant: friendly, concise and practical.
You ONLY answer questions related to travel: destinations, itineraries, tourism, local tips, packing and planning.
If a user asks about anything unrelated to travel, politely decline and remind them you can only help with travel questions.
When recommending destinations, give concrete reasons and, where useful, suggest spots that would make a great 3D capture.`;

const DEMO_REPLIES = [
  'In demo mode I cannot reach OpenAI, but here is a tip: golden hour light makes the best Gaussian-splat captures. Try a slow, full circle around your subject.',
  'Demo mode reply: for a first 3D capture, pick a statue, a fountain or a small building. Walk around it twice, keeping the camera steady and the subject centred.',
  'Demo mode reply: Lisbon, Kyoto and Cusco are all fantastic for capture walks, with textured streets and strong shadows that splats render beautifully.',
];

class OpenAIService {
  readonly isConfigured = Boolean(config.openaiApiKey);

  private async makeRequest(messages: ChatMessage[]): Promise<string> {
    if (!config.openaiApiKey) {
      // Keep the chat usable without a key so the screen can be demoed.
      await new Promise((resolve) => setTimeout(resolve, 500));
      return DEMO_REPLIES[Math.floor(Math.random() * DEMO_REPLIES.length)];
    }

    const response = await fetch(OPENAI_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  getTravelRecommendation(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    return this.makeRequest([
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ]);
  }

  chat(messages: ChatMessage[]): Promise<string> {
    return this.makeRequest(messages);
  }
}

export const openaiService = new OpenAIService();
