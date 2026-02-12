
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { X, Mic, Volume2, Shield, Loader2, ArrowLeft } from 'lucide-react';

interface VoiceAssistantScreenProps {
  onBack: () => void;
}

const VoiceAssistantScreen: React.FC<VoiceAssistantScreenProps> = ({ onBack }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Initializing Secure Channel...');
  const [transcription, setTranscription] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  // Fix: Manual decode implementation following guidelines
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Fix: Manual decodeAudioData implementation following guidelines
  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  // Fix: Manual encode implementation following guidelines
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const startSession = async () => {
    try {
      setStatus('Connecting to Dispatch...');
      // Fix: Followed GoogleGenAI initialization guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('Hands-Free Active');
            setIsActive(true);
            
            const source = inputContext.createMediaStreamSource(stream);
            const scriptProcessor = inputContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              // CRITICAL: Solely rely on sessionPromise resolves
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev + ' ' + message.serverContent?.outputTranscription?.text);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error('Live API Error:', e),
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are the GVBH Dispatch Assistant. Help the driver manage their schedule, report delays, or ask about member mobility needs hands-free. Be concise and professional.',
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error(e);
      setStatus('Connection Failed');
    }
  };

  useEffect(() => {
    startSession();
    return () => {
      if (sessionRef.current) sessionRef.current.close();
      audioContextRef.current?.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[120] bg-gray-900 flex flex-col items-center justify-between p-12 text-center overflow-hidden">
      {/* Visualizer Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
         <div className={`w-96 h-96 bg-sky-500 rounded-full blur-[100px] transition-all duration-700 ${isActive ? 'scale-150 animate-pulse' : 'scale-50'}`} />
      </div>

      <div className="relative z-10 w-full flex justify-between items-center">
         <button onClick={onBack} className="p-3 bg-white/10 rounded-2xl text-white backdrop-blur-md">
            <ArrowLeft size={24}/>
         </button>
         <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
            <Shield size={14} className="text-sky-400" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Secure Audio Link</span>
         </div>
         <div className="w-12" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-12">
        <div className={`w-40 h-40 rounded-[60px] bg-white flex items-center justify-center shadow-[0_0_80px_rgba(255,255,255,0.2)] transition-all duration-500 ${isActive ? 'scale-110' : 'scale-90 opacity-50'}`}>
           {isActive ? (
             <div className="flex items-end gap-1.5 h-12">
                {[1,2,3,4,5,6].map(i => (
                   <div 
                     key={i} 
                     className="w-1.5 bg-sky-500 rounded-full animate-bounce" 
                     style={{ height: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random()}s` }} 
                   />
                ))}
             </div>
           ) : (
             <Loader2 size={40} className="text-sky-500 animate-spin" />
           )}
        </div>
        
        <div className="space-y-4">
           <h2 className="text-3xl font-black text-white tracking-tight">{status}</h2>
           <p className="text-sky-200/60 font-medium max-w-xs mx-auto text-sm leading-relaxed px-4">
             "Tell me my next pickup location" or "I'm delayed 5 minutes due to traffic"
           </p>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-sm">
         <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl mb-8">
            <p className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em] mb-4">Transcription</p>
            <p className="text-white/80 text-sm font-medium leading-relaxed italic min-h-[40px]">
               {transcription || 'Awaiting input...'}
            </p>
         </div>
         
         <button 
           onClick={onBack}
           className="w-full bg-red-500 text-white font-black py-5 rounded-[28px] shadow-2xl shadow-red-500/20 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3"
         >
           <X size={20} /> End Hands-Free Mode
         </button>
      </div>
    </div>
  );
};

export default VoiceAssistantScreen;
