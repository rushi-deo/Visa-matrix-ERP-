/**
 * @fileoverview Official platform event contract for Visa Matrix ERP.
 *
 * This module is the canonical source of truth for event structure and the
 * core vocabulary used across the platform. It intentionally contains no
 * runtime behavior, persistence logic, or framework dependencies.
 */

/**
 * Event contract version used across all producers and consumers.
 *
 * @type {string}
 */
export const EVENT_VERSION = '1.0.0';

/**
 * Canonical platform modules that can emit or receive events.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const EVENT_MODULES = Object.freeze({
  APPLICATIONS: 'applications',
  CUSTOMERS: 'customers',
  DOCUMENTS: 'documents',
  PAYMENTS: 'payments',
  INVOICES: 'invoices',
  COUNTRIES: 'countries',
  VISA_TYPES: 'visa_types',
  USERS: 'users',
  AUTH: 'auth',
  WORKFLOW: 'workflow',
  NOTIFICATIONS: 'notifications',
  TIMELINE: 'timeline',
  AI: 'ai',
  SYSTEM: 'system',
});

/**
 * Canonical event actions supported by the platform.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const EVENT_ACTIONS = Object.freeze({
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  VIEWED: 'viewed',
  ASSIGNED: 'assigned',
  UPLOADED: 'uploaded',
  DOWNLOADED: 'downloaded',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUBMITTED: 'submitted',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
  RESTORED: 'restored',
  IMPORTED: 'imported',
  EXPORTED: 'exported',
});

/**
 * Priority tiers for platform events.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const EVENT_PRIORITY = Object.freeze({
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
});

/**
 * Processing status values for platform events.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const EVENT_STATUS = Object.freeze({
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
});

/**
 * Canonical event payload shape used throughout the ERP.
 *
 * @typedef {Object} PlatformEvent
 * @property {string} id Unique event identifier.
 * @property {string} version Contract version for schema compatibility.
 * @property {string} module Source module namespace.
 * @property {string} action Action verb describing the change.
 * @property {string} entityType Domain entity type associated with the event.
 * @property {string|number} entityId Unique identifier of the affected entity.
 * @property {string|number|null} actorId Actor responsible for the event, or `null` when system-generated.
 * @property {string|Date} timestamp Event occurrence time as an ISO 8601 string or Date instance.
 * @property {string} priority Event priority classification.
 * @property {string} status Current event processing status.
 * @property {Record<string, unknown>} metadata Extensible context payload for downstream consumers.
 */

/**
 * Immutable bundle of the core platform event contract.
 *
 * @type {Readonly<{
 *   EVENT_VERSION: string,
 *   EVENT_MODULES: typeof EVENT_MODULES,
 *   EVENT_ACTIONS: typeof EVENT_ACTIONS,
 *   EVENT_PRIORITY: typeof EVENT_PRIORITY,
 *   EVENT_STATUS: typeof EVENT_STATUS
 * }>}
 */
export const PLATFORM_EVENT_TYPES = Object.freeze({
  EVENT_VERSION,
  EVENT_MODULES,
  EVENT_ACTIONS,
  EVENT_PRIORITY,
  EVENT_STATUS,
});

export default Object.freeze({
  EVENT_VERSION,
  EVENT_MODULES,
  EVENT_ACTIONS,
  EVENT_PRIORITY,
  EVENT_STATUS,
  PLATFORM_EVENT_TYPES,
});
