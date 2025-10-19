import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const createNotConfiguredClient = (): SupabaseClient => {
  const error = {
    message:
      "Supabase belum dikonfigurasi. Set VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY untuk mengaktifkan fitur backend.",
  } as const;

  const createQueryBuilder = () => {
    let result: { data: unknown; error: typeof error } = { data: [], error };

    const builder: any = {
      select: () => builder,
      order: () => builder,
      eq: () => builder,
      insert: () => {
        result = { data: null, error };
        return builder;
      },
      update: () => {
        result = { data: null, error };
        return builder;
      },
      delete: () => {
        result = { data: null, error };
        return builder;
      },
      single: async () => ({ data: null, error }),
      maybeSingle: async () => ({ data: null, error }),
      then(onFulfilled: (value: { data: unknown; error: typeof error }) => unknown) {
        return Promise.resolve(result).then(onFulfilled);
      },
      catch(onRejected?: (reason: typeof error) => unknown) {
        return Promise.resolve(result).catch(onRejected);
      },
      finally(onFinally?: () => void) {
        return Promise.resolve().finally(onFinally);
      },
    };

    return builder;
  };

  return {
    auth: {
      async getUser() {
        return { data: { user: null }, error };
      },
      onAuthStateChange() {
        return {
          data: {
            subscription: {
              unsubscribe() {
                /* noop */
              },
            },
          },
        };
      },
      async signOut() {
        return { error };
      },
      async signUp() {
        return { data: null, error };
      },
      async signInWithPassword() {
        return { data: null, error };
      },
    },
    from() {
      return createQueryBuilder();
    },
  } as unknown as SupabaseClient;
};

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️  Supabase environment variables not found. Backend features are disabled.");
}

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : createNotConfiguredClient();
