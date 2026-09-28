import { useEffect, useRef, useState } from 'react';
import { birthday } from './config';
export type Sound = keyof typeof birthday.soundEffects;
export function useAudio() {
 const ctx = useRef<AudioContext | null>(null);
 const timer = useRef<ReturnType<typeof setInterval> | null>(null);
 const audio = useRef<HTMLAudioElement | null>(null);
 const effects = useRef(new Set<HTMLAudioElement>());
 const [muted,setMuted] = useState(false);
 const [playing,setPlaying] = useState(false);
 const [audioError,setAudioError] = useState('');
 const mutedRef=useRef(muted); mutedRef.current=muted;
 function context() { const c=ctx.current ??= new AudioContext(); void c.resume(); return c; }
 function tone(frequency:number, duration:number, volume=.09, type:OscillatorType='sine') {
   if(mutedRef.current)return;
   try { const c=context(); const o=c.createOscillator();const g=c.createGain();o.type=type;o.frequency.setValueAtTime(frequency,c.currentTime);g.gain.setValueAtTime(volume,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+duration);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+duration);o.onended=()=>{o.disconnect();g.disconnect();}; } catch { /* Audio is optional. */ }
 }
 function sound(kind:Sound) {
   if(mutedRef.current)return;
   const path=birthday.soundEffects[kind];
   if(path){const a=new Audio(path);effects.current.add(a);a.onended=()=>effects.current.delete(a);void a.play().catch(()=>effects.current.delete(a));return;}
   const notes={pop:220,heart:660,blow:330,celebrate:880};tone(notes[kind],kind==='pop'?.1:.6,.07,kind==='pop'?'triangle':'sine');
 }
 function stopMusic(){if(timer.current)clearInterval(timer.current);timer.current=null;audio.current?.pause();setPlaying(false);}
 async function toggleMusic(){
   setAudioError('');
   if(playing){stopMusic();return;}
   setMuted(false);mutedRef.current=false;
   if(birthday.song){const a=audio.current??=new Audio(birthday.song);a.loop=true;a.volume=.35;a.muted=false;try{await a.play();setPlaying(true);}catch{setAudioError('The song could not be played. Please check the music file.');}return;}
   try{context();const melody=[523.25,659.25,783.99,659.25,587.33,698.46,880,783.99,659.25,587.33,523.25,392];let i=0;const tick=()=>tone(melody[i++%melody.length],1.4,.035);tick();timer.current=setInterval(tick,650);setPlaying(true);}catch{setAudioError('Music is unavailable in this browser.');}
 }
 function toggleMute(){const next=!muted;setMuted(next);mutedRef.current=next;if(audio.current)audio.current.muted=next;if(next){effects.current.forEach(a=>a.pause());effects.current.clear();void ctx.current?.suspend();}else if(playing)void ctx.current?.resume();}
 useEffect(()=>()=>{if(timer.current)clearInterval(timer.current);audio.current?.pause();effects.current.forEach(a=>a.pause());void ctx.current?.close();},[]);
 return {muted,playing,audioError,toggleMusic,toggleMute,sound,stopMusic};
}
export function useMicrophone(onBlow:()=>void) {
 const [status,setStatus]=useState<'idle'|'requesting'|'listening'|'error'>('idle');
 const [message,setMessage]=useState('');
 const stream=useRef<MediaStream|null>(null);const ctx=useRef<AudioContext|null>(null);const frame=useRef(0);const active=useRef(false);const generation=useRef(0);const callback=useRef(onBlow);callback.current=onBlow;
 function stop(){active.current=false;generation.current++;cancelAnimationFrame(frame.current);stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;void ctx.current?.close();ctx.current=null;setStatus('idle');}
 async function start(){
   if(active.current)return;
   active.current=true;const token=++generation.current;setStatus('requesting');setMessage('');
   try {
     if(!navigator.mediaDevices?.getUserMedia)throw new Error('UNAVAILABLE');
     const media=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
     if(token!==generation.current){media.getTracks().forEach(t=>t.stop());return;}
     stream.current=media;const c=ctx.current=new AudioContext();await c.resume();
     if(token!==generation.current)return;
     const source=c.createMediaStreamSource(media);const analyser=c.createAnalyser();analyser.fftSize=1024;source.connect(analyser);const data=new Uint8Array(analyser.fftSize);setStatus('listening');setMessage('Stay quiet for a moment, then blow toward your microphone.');
     const started=performance.now();let baseline=0;let samples=0;let loudSince=0;
     const tick=()=>{if(!active.current)return;analyser.getByteTimeDomainData(data);let sum=0;for(const n of data)sum+=((n-128)/128)**2;const rms=Math.sqrt(sum/data.length);const now=performance.now();
       if(now-started<900){baseline+=rms;samples++;}else{const threshold=Math.max(.065,(baseline/Math.max(samples,1))*2.6);if(rms>threshold){loudSince ||= now;if(now-loudSince>450){stop();callback.current();return;}}else loudSince=0;}
       if(now-started>20000){stop();setMessage('No blow detected. You can try again or use the button below.');return;}frame.current=requestAnimationFrame(tick);
     };tick();
   }catch(error){if(token!==generation.current)return;stop();setStatus('error');const denied=error instanceof DOMException&&error.name==='NotAllowedError';setMessage(denied?'Microphone access was denied. You can still blow out the candles with the button.':'The microphone is unavailable. Use the button to make your wish.');}
 }
 useEffect(()=>()=>{active.current=false;generation.current++;cancelAnimationFrame(frame.current);stream.current?.getTracks().forEach(t=>t.stop());void ctx.current?.close();},[]);
 return {status,message,start,stop};
}
