'use server';

import { spinController } from '../../lib/controllers/game/spin.controller.js';

/**
 * Server Action sebagai entrypoint dari frontend Next.js App Router.
 * Fokus: Meneruskan data ke Controller
 */
export async function playSpinAction(payload) {
   return await spinController(payload);
}
