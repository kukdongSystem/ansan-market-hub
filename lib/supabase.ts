import { createClient, type User } from '@supabase/supabase-js';

const supabaseUrl = 'https://gyhokcewvfmgsirqluwc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5aG9rY2V3dmZtZ3NpcnFsdXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTM1NTEsImV4cCI6MjA5MTQ2OTU1MX0.Xb0jyRyKlvdBhhVs0pEbdmWdYQOoTnOzXcsw0teRxJE';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * `auth.signInWithPassword`가 일부 브라우저에서 Promise가 영구 대기되는 경우가 있어
 * Auth REST API + setSession으로 동일 결과를 얻습니다. fetch는 Abort로 반드시 끊습니다.
 */
export async function signInWithPasswordDirect(
  email: string,
  password: string,
  timeoutMs = 18000
): Promise<{ user: User | null; error: Error | null }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      }
    );

    let json: Record<string, unknown> = {};
    try {
      json = (await res.json()) as Record<string, unknown>;
    } catch {
      /* empty body */
    }

    if (!res.ok) {
      const desc =
        (json.error_description as string) ||
        (json.msg as string) ||
        (json.message as string) ||
        (json.error as string) ||
        `HTTP ${res.status}`;
      return { user: null, error: new Error(String(desc)) };
    }

    const access_token = json.access_token as string | undefined;
    const refresh_token = json.refresh_token as string | undefined;
    if (!access_token || !refresh_token) {
      return {
        user: null,
        error: new Error('세션 토큰을 받지 못했습니다.'),
      };
    }

    const setSessionMs = 12000;
    const sessionRace = Promise.race([
      supabase.auth.setSession({ access_token, refresh_token }),
      new Promise<{ data: { session: null }; error: Error }>((_, reject) =>
        setTimeout(
          () => reject(new Error('SET_SESSION_TIMEOUT')),
          setSessionMs
        )
      ),
    ]);

    const { data, error } = await sessionRace;

    if (error) {
      return { user: null, error };
    }

    const user = data.session?.user ?? (json.user as User | undefined) ?? null;
    return { user, error: null };
  } catch (e: unknown) {
    const name =
      e && typeof e === 'object' && 'name' in e
        ? String((e as { name: string }).name)
        : '';
    if (name === 'AbortError') {
      return { user: null, error: new Error('TIMEOUT') };
    }
    if (e instanceof Error && e.message === 'SET_SESSION_TIMEOUT') {
      return {
        user: null,
        error: new Error('TIMEOUT'),
      };
    }
    return {
      user: null,
      error: e instanceof Error ? e : new Error('네트워크 오류'),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
