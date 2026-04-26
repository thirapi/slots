import { SpinGameUseCase } from '../../use-cases/game/spin-game.use-case.js';
import { RngService } from '../../services/game/rng.service.js';

/**
 * Controller berupa fungsi sesuai Clean Architecture rules.
 * 
 * Melakukan validasi ringan dan memanggil Use Case.
 */
export async function spinController(requestBody) {
  try {
    const { bet, currentGlobalMulti = 0, currentFreeSpins = 0 } = requestBody;

    if (typeof bet !== 'number' || bet <= 0) {
       return { success: false, error: 'Invalid bet amount' };
    }

    // Dependency Injection
    const rngService = new RngService();
    // Use Case dipanggil via Class
    const spinUseCase = new SpinGameUseCase(rngService);

    // Memanggil Use Case (business logic & engine)
    const result = spinUseCase.execute(bet, currentGlobalMulti, currentFreeSpins);

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error("Spin error:", error);
    return {
      success: false,
      error: 'Internal Server Error'
    };
  }
}
