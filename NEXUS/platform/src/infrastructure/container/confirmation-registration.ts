import type { ConfirmationManager } from '../../security/confirmation/manager.js';
import { createConfirmationManager } from '../../security/confirmation/manager.js';
import { ConfirmationManagerToken } from './confirmation-token.js';

export { ConfirmationManagerToken };

export const createConfirmationManagerService = (): ConfirmationManager =>
  createConfirmationManager();
