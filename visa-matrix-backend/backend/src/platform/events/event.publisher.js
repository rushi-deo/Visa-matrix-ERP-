import { randomUUID } from 'node:crypto';
import {
  EVENT_ACTIONS,
  EVENT_MODULES,
  EVENT_PRIORITY,
  EVENT_STATUS,
  EVENT_VERSION,
} from './event.types.js';

/**
 * Structured event publisher that normalizes and validates platform events.
 *
 * This implementation is intentionally persistence-agnostic so it can serve as
 * the foundation for future event storage, queuing, and delivery pipelines.
 */
export class EventPublisher {
  /**
   * Creates a publisher with a structured logger interface.
   *
   * @param {Pick<Console, 'debug' | 'error' | 'info' | 'warn'>} [logger=console]
   */
  constructor(logger = console) {
    this.logger = logger;
  }

  /**
   * Publishes a single event by validating and normalizing it.
   *
   * @param {import('./event.types.js').PlatformEvent|Record<string, unknown>} event
   * @returns {Readonly<import('./event.types.js').PlatformEvent>}
   */
  publish(event) {
    const normalized = this.validate(event);
    this.logger.info('platform.event.publish', {
      eventId: normalized.id,
      module: normalized.module,
      action: normalized.action,
      status: normalized.status,
      priority: normalized.priority,
    });
    return normalized;
  }

  /**
   * Publishes a batch of events and returns their normalized forms.
   *
   * @param {Array<import('./event.types.js').PlatformEvent|Record<string, unknown>>} events
   * @returns {ReadonlyArray<Readonly<import('./event.types.js').PlatformEvent>>}
   */
  publishBatch(events) {
    if (!Array.isArray(events)) {
      throw new TypeError('events must be an array');
    }

    return Object.freeze(events.map((event) => this.publish(event)));
  }

  /**
   * Validates and normalizes an event payload.
   *
   * @param {import('./event.types.js').PlatformEvent|Record<string, unknown>} event
   * @returns {Readonly<import('./event.types.js').PlatformEvent>}
   */
  validate(event) {
    if (!event || typeof event !== 'object' || Array.isArray(event)) {
      throw new TypeError('event must be an object');
    }

    const now = this.createTimestamp();
    const normalized = Object.freeze({
      id: typeof event.id === 'string' && event.id.trim() ? event.id.trim() : this.createId(),
      version: typeof event.version === 'string' && event.version.trim() ? event.version.trim() : EVENT_VERSION,
      module: this.normalizeLookup(event.module, EVENT_MODULES, 'module'),
      action: this.normalizeLookup(event.action, EVENT_ACTIONS, 'action'),
      entityType: this.requireString(event.entityType, 'entityType'),
      entityId: this.requireIdentifier(event.entityId, 'entityId'),
      actorId: this.normalizeActorId(event.actorId),
      timestamp: this.normalizeTimestamp(event.timestamp, now),
      priority: this.normalizeLookup(event.priority, EVENT_PRIORITY, 'priority', EVENT_PRIORITY.NORMAL),
      status: this.normalizeLookup(event.status, EVENT_STATUS, 'status', EVENT_STATUS.PENDING),
      metadata: this.normalizeMetadata(event.metadata),
    });

    this.logger.debug('platform.event.validate', {
      eventId: normalized.id,
      module: normalized.module,
      action: normalized.action,
      status: normalized.status,
    });

    return normalized;
  }

  /**
   * Creates a unique event identifier.
   *
   * @returns {string}
   */
  createId() {
    return randomUUID();
  }

  /**
   * Creates an event timestamp in ISO 8601 format.
   *
   * @returns {string}
   */
  createTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Resolves a value against a frozen lookup table.
   *
   * @private
   * @param {unknown} value
   * @param {Readonly<Record<string, string>>} lookup
   * @param {string} fieldName
   * @param {string} [fallback]
   * @returns {string}
   */
  normalizeLookup(value, lookup, fieldName, fallback) {
    const values = Object.values(lookup);
    const raw = typeof value === 'string' ? value.trim() : '';

    if (raw && values.includes(raw)) {
      return raw;
    }

    if (fallback) {
      return fallback;
    }

    throw new TypeError(`${fieldName} must be one of the supported platform values`);
  }

  /**
   * Ensures a field is a non-empty string.
   *
   * @private
   * @param {unknown} value
   * @param {string} fieldName
   * @returns {string}
   */
  requireString(value, fieldName) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new TypeError(`${fieldName} must be a non-empty string`);
    }

    return value.trim();
  }

  /**
   * Ensures the identifier field is a stable primitive identifier.
   *
   * @private
   * @param {unknown} value
   * @param {string} fieldName
   * @returns {string|number}
   */
  requireIdentifier(value, fieldName) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    throw new TypeError(`${fieldName} must be a non-empty string or finite number`);
  }

  /**
   * Normalizes optional actor identifiers.
   *
   * @private
   * @param {unknown} value
   * @returns {string|number|null}
   */
  normalizeActorId(value) {
    if (value == null) {
      return null;
    }

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    throw new TypeError('actorId must be a non-empty string, finite number, or null');
  }

  /**
   * Normalizes timestamps into ISO 8601 strings.
   *
   * @private
   * @param {unknown} value
   * @param {string} fallback
   * @returns {string}
   */
  normalizeTimestamp(value, fallback) {
    if (typeof value === 'string' && value.trim()) {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.toISOString();
    }

    return fallback;
  }

  /**
   * Normalizes extensible metadata into a plain frozen object.
   *
   * @private
   * @param {unknown} value
   * @returns {Readonly<Record<string, unknown>>}
   */
  normalizeMetadata(value) {
    if (value == null) {
      return Object.freeze({});
    }

    if (typeof value !== 'object' || Array.isArray(value)) {
      throw new TypeError('metadata must be a plain object when provided');
    }

    return Object.freeze({ ...value });
  }
}

/**
 * Singleton event publisher used by the platform core.
 *
 * @type {EventPublisher}
 */
export const eventPublisher = Object.freeze(new EventPublisher());

export default eventPublisher;
