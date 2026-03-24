import sound1 from '../assets/sounds/keystroke1.mp3';
import sound2 from '../assets/sounds/keystroke2.mp3';
import sound3 from '../assets/sounds/keystroke3.mp3';
import sound4 from '../assets/sounds/keystroke4.mp3';

const keyStrokeSounds = [
  new Audio(sound1),
  new Audio(sound2),
  new Audio(sound3),
  new Audio(sound4),
];


const useKeyboardSound = () => {
  const palyRandomKeyStrokeSound = () => {
    const randomSound = keyStrokeSounds[Math.floor(Math.random() * keyStrokeSounds.length)];
    randomSound.currentTime = 0;
    randomSound.play().catch(err => console.log('Audio play failed', err));
  }

  return { palyRandomKeyStrokeSound }
}

export default useKeyboardSound;
