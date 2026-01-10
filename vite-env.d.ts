declare const process: {
  env: {
    [key: string]: string | undefined;
    API_KEY: string;
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
  }
};
