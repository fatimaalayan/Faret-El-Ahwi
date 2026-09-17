import buttonPressAudio from './button_press.wav';
import fireIgnitionAudio from './fire_ignition.wav';
import boilingLoopAudio from './boiling_loop.wav';
import coffeeOverflowAudio from './coffee_overflow.wav';
import roundLossStingAudio from './round_loss_sting.wav';

export const audioAssets = {
  buttonPress: buttonPressAudio,
  fireIgnition: fireIgnitionAudio,
  boilingLoop: boilingLoopAudio,
  coffeeOverflow: coffeeOverflowAudio,
  roundLossSting: roundLossStingAudio,
};

export type SoundKey = keyof typeof audioAssets;
