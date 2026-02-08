
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

class TTSService {
  private audioContext: AudioContext | null = null;
  private isSpeaking = false;
  private isMuted = localStorage.getItem('voice_muted') === 'true';

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
    }
    return this.audioContext;
  }

  private decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  }

  private async withRetry<T>(fn: () => Promise<T>, maxRetries = 4): Promise<T> {
    let delay = 1500;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        const errStr = typeof error === 'object' ? (JSON.stringify(error) + (error.message || '')) : String(error);
        const lowerErr = errStr.toLowerCase();
        const isQuotaError = lowerErr.includes('429') || lowerErr.includes('exhausted') || lowerErr.includes('limit');
        
        if (isQuotaError && i < maxRetries - 1) {
          console.warn(`[TTS] Rate limit, backing off ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }
        throw error;
      }
    }
    return await fn();
  }

  public async speak(text: string) {
    if (this.isSpeaking || this.isMuted) return;
    this.isSpeaking = true;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await this.withRetry<GenerateContentResponse>(() => ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      }));

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const ctx = this.initAudioContext();
        if (ctx.state === 'suspended') await ctx.resume();
        
        const audioBuffer = await this.decodeAudioData(this.decodeBase64(base64Audio), ctx);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => { this.isSpeaking = false; };
        source.start(0);
      } else {
        this.isSpeaking = false;
      }
    } catch (error) {
      console.error("TTS Mission Failure:", error);
      this.isSpeaking = false;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('voice_muted', muted.toString());
    if (muted) this.stop();
    window.dispatchEvent(new CustomEvent('voice-mute-change', { detail: { muted } }));
  }

  public getMuted() { return this.isMuted; }

  public stop() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isSpeaking = false;
  }
}

export const ttsService = new TTSService();
