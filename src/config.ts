export type Memory = { photo: string; caption: string; label: string };

// Base URL — "/" in local dev, "/aishu-birthday-wish/" on GitHub Pages.
// Every asset path below is prefixed with this so images load in both.
const B = import.meta.env.BASE_URL;

// Put personal assets in public/assets/, then edit ONLY this file.
export const birthday = {
  friendName: 'Aishwarya', // Real name (kept for reference).
  nickName: 'kuutukaari', // Shown on the opening AND final "Happy Birthday" screens. ♡
  memories: [
    { photo: `${B}assets/1.jpg`, caption: 'The day it all started. Still my favorite chaos.', label: 'Where it began' },
    { photo: `${B}assets/4.jpg`, caption: 'That look. Yeah, that one — my favorite.', label: 'Just us' },
    { photo: `${B}assets/5.jpg`, caption: 'No reason. Just us being ridiculous, as always.', label: 'A random good day' },
    { photo: `${B}assets/6.jpg`, caption: 'Caught you off guard — worth it every single time.', label: 'Peak us' },
    { photo: `${B}assets/7.jpg`, caption: 'Us, walking into every next memory. ♡', label: 'One for the books' },
  ] as [Memory, Memory, Memory, Memory, Memory],
  finalFavoritePhoto: `${B}assets/collage.jpg`, // A collage of all our favorite moments.
  personalMessage:
    'Thank you for every laugh, every 2am talk, and every little moment in between. ' +
    'You make the ordinary days feel special just by being you. ' +
    'I hope this year is as wonderful and warm as you are. Here’s to us. ♡',
  song: `${B}assets/our-song.mp3`, // Drop your mp3 at public/assets/our-song.mp3. Empty ('') uses a gentle built-in melody.
  soundEffects: { pop: '', heart: '', blow: '', celebrate: '' }, // Optional files; empty uses synthesized sounds.
};
