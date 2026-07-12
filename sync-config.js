/* ============================================================
   Cloud sync configuration (optional)

   Leave both values empty and the app runs fully local, exactly
   as before — no account UI is shown, nothing leaves the browser.

   To enable accounts + cross-device sync, create a free Supabase
   project and paste its URL and anon (public) key here. Full
   setup steps are in README.md under "Accounts & sync".
   The anon key is safe to commit: it is public by design, and
   row-level security keeps each user's data private.
   ============================================================ */

const SYNC_CONFIG = {
  url: '',      // e.g. 'https://abcdefgh.supabase.co'
  anonKey: '',  // the long 'anon public' key from Project Settings → API
};
