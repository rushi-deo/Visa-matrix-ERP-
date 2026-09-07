import eventRegistry, { EventRegistry } from './event.registry.js';

/**
 * Platform event subscriber responsible for wiring handlers to the registry
 * and emitting events to those handlers.
 */
export class EventSubscriber {
  /**
   * @param {EventRegistry} [registry=eventRegistry]
   */
  constructor(registry = eventRegistry) {
    this.registry = registry;
  }

  /**
   * Subscribes a handler to an event name.
   *
   * @param {string} eventName
   * @param {Function} handler
   * @returns {this}
   */
  subscribe(eventName, handler) {
    this.registry.register(eventName, handler);
    return this;
  }

  /**
   * Unsubscribes all handlers for an event name.
   *
   * @param {string} eventName
   * @returns {boolean}
   */
  unsubscribe(eventName) {
    return this.registry.unregister(eventName);
  }

  /**
   * Subscribes a handler that will execute once and then be removed.
   *
   * @param {string} eventName
   * @param {Function} handler
   * @returns {this}
   */
  once(eventName, handler) {
    const wrapped = async (event) => {
      try {
        return await handler(event);
      } finally {
        this.registry.removeHandler(eventName, wrapped);
      }
    };

    this.registry.register(eventName, wrapped);
    return this;
  }

  /**
   * Emits an event to all registered handlers.
   *
   * @param {string} eventName
   * @param {unknown} event
   * @returns {Promise<Array<unknown>>}
   */
  async emit(eventName, event) {
    const handlers = this.registry.getHandlers(eventName);
    const results = [];

    for (const handler of handlers) {
      results.push(await handler(event));
    }

    return results;
  }
}

/**
 * Singleton subscriber for platform events.
 *
 * @type {EventSubscriber}
 */
export const eventSubscriber = Object.freeze(new EventSubscriber());

export default eventSubscriber;
