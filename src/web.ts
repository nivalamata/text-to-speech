import { WebPlugin } from '@capacitor/core';
import {
  TextToSpeechPlugin,
  SpeechSynthesisVoice,
  TTSOptions,
} from './definitions';

export class TextToSpeechWeb extends WebPlugin implements TextToSpeechPlugin {
  private speechSynthesis: SpeechSynthesis | null = null;

  constructor() {
    super({
      name: 'TextToSpeech',
      platforms: ['web'],
    });
    if ('speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
    }
  }

  public async speak(options: TTSOptions): Promise<void> {
    if (!this.speechSynthesis) {
      this.throwUnsupportedError();
    }
    await this.stop();
    const speechSynthesis = this.speechSynthesis;
    const utterance = this.createSpeechSynthesisUtterance(options);
    return new Promise((resolve, reject) => {
      utterance.onend = () => {
        resolve();
      };
      utterance.onerror = (event: any) => {
        reject(event);
      };
      speechSynthesis.speak(utterance);
    });
  }

  public async stop(): Promise<void> {
    if (!this.speechSynthesis) {
      this.throwUnsupportedError();
    }
    this.speechSynthesis.cancel();
  }

  public async getSupportedLanguages(): Promise<{ languages: string[] }> {
    const voices = this.getSpeechSynthesisVoices();
    const languages = voices.map(voice => voice.lang);
    const filteredLanguages = languages.filter((v, i, a) => a.indexOf(v) == i);
    return { languages: filteredLanguages };
  }

  public async getSupportedVoices(): Promise<{
    voices: SpeechSynthesisVoice[];
  }> {
    const voices = this.getSpeechSynthesisVoices();
    return { voices };
  }

  public async openInstall(): Promise<void> {
    this.throwUnimplementedError();
  }

  public async setPitchRate(_options: { pitchRate: number }): Promise<void> {
    this.throwUnimplementedError();
  }

  public async setSpeechRate(_options: { speechRate: number }): Promise<void> {
    this.throwUnimplementedError();
  }

  private createSpeechSynthesisUtterance(
    options: TTSOptions,
  ): SpeechSynthesisUtterance {
    const voices = this.getSpeechSynthesisVoices();
    const utterance = new SpeechSynthesisUtterance();
    const { text, locale, speechRate, volume, voice, pitchRate } = options;
    if (voice) {
      utterance.voice = voices[voice];
    }
    if (volume) {
      utterance.volume = volume >= 0 && volume <= 1 ? volume : 1;
    }
    if (speechRate) {
      utterance.rate = speechRate >= 0.1 && speechRate <= 10 ? speechRate : 1;
    }
    if (pitchRate) {
      utterance.pitch = pitchRate >= 0 && pitchRate <= 2 ? pitchRate : 2;
    }
    if (locale) {
      utterance.lang = locale;
    }
    utterance.text = text;
    return utterance;
  }

  private getSpeechSynthesisVoices(): SpeechSynthesisVoice[] {
    if (!this.speechSynthesis) {
      this.throwUnsupportedError();
    }
    return this.speechSynthesis.getVoices();
  }

  private throwUnsupportedError(): never {
    throw new Error('Not supported on this device.');
  }

  private throwUnimplementedError(): never {
    throw new Error('Not implemented on web.');
  }
}

const TextToSpeech = new TextToSpeechWeb();

export { TextToSpeech };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(TextToSpeech);
