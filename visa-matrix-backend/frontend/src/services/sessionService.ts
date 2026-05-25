/**
 * Session Management Service
 * Handles session tracking, validation, and active session management
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

const supabase = getSupabaseClient();

function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error("Supabase is not configured for session tracking.");
  }

  return supabase;
}

interface SessionData {
  id: string;
  user_id: string;
  token_hash: string;
  ip_address: string;
  user_agent: string;
  browser: string;
  os: string;
  device_type: string;
  last_activity_at: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Create a new session
 */
export async function createSession(
  userId: string,
  token: string
): Promise<SessionData> {
  try {
    const client = requireSupabase();
    const tokenHash = await hashToken(token);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    const { data, error } = await client
      .from("sessions")
      .insert([
        {
          user_id: userId,
          token_hash: tokenHash,
          ip_address: "N/A",
          user_agent: navigator.userAgent,
          browser: getBrowser(navigator.userAgent),
          os: getOS(navigator.userAgent),
          device_type: getDeviceType(navigator.userAgent),
          last_activity_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Create session error:", error);
    throw error;
  }
}

/**
 * Get active sessions for user
 */
export async function getActiveSessions(userId: string): Promise<SessionData[]> {
  try {
    const { data, error } = await requireSupabase()
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get active sessions error:", error);
    return [];
  }
}

/**
 * Update session activity
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  try {
    await requireSupabase()
      .from("sessions")
      .update({
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", sessionId);
  } catch (error) {
    console.error("Update session activity error:", error);
  }
}

/**
 * Invalidate session
 */
export async function invalidateSession(sessionId: string): Promise<void> {
  try {
    await requireSupabase()
      .from("sessions")
      .update({
        is_active: false,
      })
      .eq("id", sessionId);
  } catch (error) {
    console.error("Invalidate session error:", error);
    throw error;
  }
}

/**
 * Invalidate all sessions for user
 */
export async function invalidateAllSessions(userId: string): Promise<void> {
  try {
    await requireSupabase()
      .from("sessions")
      .update({
        is_active: false,
      })
      .eq("user_id", userId)
      .eq("is_active", true);
  } catch (error) {
    console.error("Invalidate all sessions error:", error);
    throw error;
  }
}

/**
 * Check if session is valid
 */
export async function isSessionValid(sessionId: string): Promise<boolean> {
  try {
    const { data } = await requireSupabase()
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .single();

    return !!data;
  } catch (error) {
    console.error("Session check error:", error);
    return false;
  }
}

/**
 * Get login history
 */
export async function getLoginHistory(
  userId: string,
  limit: number = 10
): Promise<any[]> {
  try {
    const { data, error } = await requireSupabase()
      .from("login_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get login history error:", error);
    return [];
  }
}

/**
 * Helper: Hash token
 */
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Helper: Get browser from user agent
 */
function getBrowser(ua: string): string {
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  return "Unknown";
}

/**
 * Helper: Get OS from user agent
 */
function getOS(ua: string): string {
  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone")) return "iOS";
  return "Unknown";
}

/**
 * Helper: Get device type from user agent
 */
function getDeviceType(ua: string): string {
  if (/mobile/i.test(ua)) return "Mobile";
  if (/tablet/i.test(ua)) return "Tablet";
  return "Desktop";
}

/**
 * Log login attempt
 */
export async function logLoginAttempt(
  userId: string,
  email: string,
  status: "success" | "failed" | "locked" | "disabled",
  reason?: string
): Promise<void> {
  try {
    await requireSupabase().from("login_history").insert([
      {
        user_id: userId,
        email,
        login_status: status,
        reason,
        browser: getBrowser(navigator.userAgent),
        os: getOS(navigator.userAgent),
        device_type: getDeviceType(navigator.userAgent),
        user_agent: navigator.userAgent,
        ip_address: "N/A",
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    console.error("Log login attempt error:", error);
  }
}

/**
 * Check if account is locked
 */
export async function isAccountLocked(userId: string): Promise<boolean> {
  try {
    const { data, error } = await requireSupabase()
      .from("profiles")
      .select("is_locked, locked_until")
      .eq("id", userId)
      .single();

    if (error) throw error;

    if (data?.is_locked) {
      const lockedUntil = new Date(data.locked_until);
      if (lockedUntil > new Date()) {
        return true;
      }
      // Unlock if time has passed
      await requireSupabase()
        .from("profiles")
        .update({ is_locked: false, locked_until: null })
        .eq("id", userId);
    }

    return false;
  } catch (error) {
    console.error("Check account locked error:", error);
    return false;
  }
}

/**
 * Lock account temporarily
 */
export async function lockAccount(userId: string, minutes: number = 30): Promise<void> {
  try {
    const lockedUntil = new Date();
    lockedUntil.setMinutes(lockedUntil.getMinutes() + minutes);

    await requireSupabase()
      .from("profiles")
      .update({
        is_locked: true,
        locked_until: lockedUntil.toISOString(),
        failed_login_attempts: 0,
      })
      .eq("id", userId);
  } catch (error) {
    console.error("Lock account error:", error);
    throw error;
  }
}

/**
 * Increment failed login attempts
 */
export async function incrementFailedLoginAttempts(userId: string): Promise<number> {
  try {
    const { data, error } = await requireSupabase().rpc(
      "increment_failed_login_attempts",
      { user_id: userId }
    );

    if (error) throw error;

    // Lock account after 5 failed attempts
    if (data >= 5) {
      await lockAccount(userId, 30);
    }

    return data;
  } catch (error) {
    console.error("Increment failed login attempts error:", error);
    throw error;
  }
}

/**
 * Reset failed login attempts
 */
export async function resetFailedLoginAttempts(userId: string): Promise<void> {
  try {
    await requireSupabase()
      .from("profiles")
      .update({ failed_login_attempts: 0 })
      .eq("id", userId);
  } catch (error) {
    console.error("Reset failed login attempts error:", error);
    throw error;
  }
}
