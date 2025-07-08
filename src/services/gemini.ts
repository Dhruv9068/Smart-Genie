import { GEMINI_API_KEY, GEMINI_API_URL } from '../utils/constants';

export class GeminiService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = GEMINI_API_KEY;
    this.apiUrl = GEMINI_API_URL;
  }

  async generateContent(prompt: string, language: string = 'en'): Promise<string> {
    try {
      const systemPrompt = `You are SchemeGenie, a helpful AI assistant that helps people discover and apply for government benefit schemes worldwide. 
      
      Always respond in ${language === 'en' ? 'English' : `the language code: ${language}`}.
      
      Provide clear, helpful, and accurate information about:
      - Government benefit schemes and social programs
      - Eligibility criteria and requirements
      - Application processes and documentation
      - Deadlines and important dates
      - Contact information and resources
      
      Keep responses conversational, supportive, and actionable.`;

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nUser question: ${prompt}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Gemini API Error:', error);
      return 'I apologize, but I\'m experiencing technical difficulties. Please try again later.';
    }
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    const prompt = `Please translate the following text to ${targetLanguage}. Only return the translation, no explanations:

    ${text}`;

    return this.generateContent(prompt, targetLanguage);
  }

  async analyzeEligibility(userProfile: any, schemes: any[], language: string = 'en'): Promise<string> {
    const prompt = `Based on this user profile:
    - Age: ${userProfile.age}
    - Income: ${userProfile.income}
    - Education: ${userProfile.education}
    - Employment: ${userProfile.employment}
    - Family Size: ${userProfile.familySize}
    - Location: ${userProfile.location}
    - Country: ${userProfile.country}

    And these available schemes:
    ${schemes.map(scheme => `
    - ${scheme.title}: ${scheme.description}
      Eligibility: ${scheme.eligibility.join(', ')}
      Benefits: ${scheme.benefits.join(', ')}
    `).join('\n')}

    Please analyze which schemes this user is eligible for and provide personalized recommendations with reasons why they qualify.`;

    return this.generateContent(prompt, language);
  }
}

export const geminiService = new GeminiService();