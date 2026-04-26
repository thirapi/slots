import { SYMBOLS, SPECIALS, SYMBOL_KEYS } from '../../entities/game.model.js';
import crypto from 'crypto';

export class RngService {
  /**
   * Menggunakan cryptographically secure RNG minimal walau belum seeded.
   */
  getRandomNumber() {
    return crypto.randomInt(0, 1000000) / 1000000;
  }

  getRandomSymbol() {
    const rand = this.getRandomNumber();
    
    // Probabilitas disesuaikan agar lebih realistis sesuai request user
    if (rand < 0.01) {
       // Multiplier 1%
       return { ...SPECIALS.MULTIPLIER, value: this.getRandomMulti(), uuid: this.getRandomNumber() };
    }
    if (rand < 0.015) {
       // Scatter biasa 0.5% (ditambahkan 0.005 ke atas 0.01)
       return { ...SPECIALS.SCATTER, uuid: this.getRandomNumber() };
    }
    if (rand < 0.016) {
       // Super scatter 0.1% (ditambahkan 0.001 ke 0.015)
       return { ...SPECIALS.SUPER_SCATTER, uuid: this.getRandomNumber() };
    }
    
    // Sisa probabilitas dibagi rata untuk simbol standard (atau bisa di-weight juga)
    const randomBase = SYMBOLS[SYMBOL_KEYS[Math.floor(this.getRandomNumber() * SYMBOL_KEYS.length)]];
    return { ...randomBase, uuid: this.getRandomNumber() };
  }

  getRandomMulti() {
    const vals = [2, 3, 4, 5, 8, 10, 15, 25, 50, 100, 250, 500];
    return vals[Math.floor(this.getRandomNumber() * vals.length)];
  }
}
