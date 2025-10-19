import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const createNotConfiguredClient = (): SupabaseClient => {
  const error = {
    message:
      "Supabase belum dikonfigurasi. Set VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY untuk mengaktifkan fitur backend.",
  } as const;

  const createQueryBuilder = () => {
    const builder: any = {
      select: async () => ({ data: [], error }),
      order: () => builder,
      eq: () => builder,
      single: async () => ({ data: null, error }),
      maybeSingle: async () => ({ data: null, error }),
      insert: async () => ({ data: null, error }),
      update: async () => ({ data: null, error }),
      delete: async () => ({ data: null, error }),
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
