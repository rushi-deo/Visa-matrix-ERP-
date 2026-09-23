import type { ConfirmationManager } from '../../security/confirmation/manager.js';

export const ConfirmationManagerToken = Symbol('ConfirmationManager');

export type ConfirmationManagerService = ConfirmationManager;
