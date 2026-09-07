/**
 * Central registry for platform event handlers.
 *
 * The registry uses a map of event name to handler set, allowing multiple
 * independent consumers to subscribe to the same event without collisions.
 */
export class EventRegistry {
  constructor() {
    this.handlers = new Map();
  }

  /**
   * Registers a handler for a given event name.
   *
   * @param {string} eventName
   * @param {Function} handler
   * @returns {this}
   */
  register(eventName, handler) {
    this.assertEventName(eventName);
    this.assertHandler(handler);

    const current = this.handlers.get(eventName) ?? new Set();
    if (current.has(handler)) {
      throw new Error(`Handler already registered for event "${eventName}"`);
    }

    current.add(handler);
    this.handlers.set(eventName, current);
    return this;
  }

  /**
   * Removes a single handler from an event name without affecting others.
   *
   * @param {string} eventName
   * @param {Function} handler
   * @returns {boolean}
   */
  removeHandler(eventName, handler) {
    this.assertEventName(eventName);
    this.assertHandler(handler);

    const current = this.handlers.get(eventName);
    if (!current) {
      return false;
    }

    const removed = current.delete(handler);
    if (current.size === 0) {
      this.handlers.delete(eventName);
    }

    return removed;
  }

  /**
   * Unregisters all handlers for an event name.
   *
   * @param {string} eventName
   * @returns {boolean}
   */
  unregister(eventName) {
    this.assertEventName(eventName);
    return this.handlers.delete(eventName);
  }

  /**
   * Returns all handlers currently registered for an event name.
   *
   * @param {string} eventName
   * @returns {ReadonlyArray<Function>}
   */
  getHandlers(eventName) {
    this.assertEventName(eventName);
    return Object.freeze([...(this.handlers.get(eventName) ?? new Set())]);
  }

  /**
   * Removes all registered handlers.
   *
   * @returns {this}
   */
  clear() {
    this.handlers.clear();
    return this;
  }

  /**
   * Validates event names used in the registry.
   *
   * @private
   * @param {unknown} eventName
   */
  assertEventName(eventName) {
    if (typeof eventName !== 'string' || !eventName.trim()) {
      throw new TypeError('eventName must be a non-empty string');
    }
  }

  /**
   * Validates event handlers used in the registry.
   *
   * @private
   * @param {unknown} handler
   */
  assertHandler(handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('handler must be a function');
    }
  }
}

/**
 * Singleton registry used by the platform event subscriber.
 *
 * @type {EventRegistry}
 */
export const eventRegistry = Object.freeze(new EventRegistry());

export default eventRegistry;
