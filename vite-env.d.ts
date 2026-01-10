

declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
    readonly SUPABASE_URL?: string;
    readonly SUPABASE_ANON_KEY?: string;
    [key: string]: string | undefined;
  }
}