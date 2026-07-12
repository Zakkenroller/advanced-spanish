/* ============================================================
   Cloud sync — optional accounts via Supabase magic-link login.

   Loaded after app.js, so it can see `state`, `save()`, and the
   render functions. If SYNC_CONFIG is empty or the Supabase
   library failed to load, every entry point is a no-op and the
   app behaves exactly as a local-only build.

   Model: the whole `state` blob is one row per user. On sign-in,
   whichever side was written most recently wins (last-write-wins);
   afterwards every local save() schedules a debounced push.
   ============================================================ */

let sb = null;         // supabase client
let sbUser = null;     // current auth user
let sbPushTimer = null;
let sbStatus = 'off';  // off | signedout | syncing | synced | error

function syncEnabled() {
  return typeof SYNC_CONFIG !== 'undefined' && !!SYNC_CONFIG.url && !!SYNC_CONFIG.anonKey
    && typeof supabase !== 'undefined';
}

// Decide direction on sign-in. serverRow: { state, updated_at } or null.
function resolveSyncDirection(localUpdatedAt, serverRow) {
  if (!serverRow) return 'push';
  const serverTime = new Date(serverRow.updated_at).getTime();
  return serverTime > (localUpdatedAt || 0) ? 'pull' : 'push';
}

/* ---------- called from app.js ---------- */

// save() calls this on every state change
function syncQueuePush() {
  if (!sbUser) return;
  clearTimeout(sbPushTimer);
  sbPushTimer = setTimeout(syncPushNow, 1500);
}

// the reset button calls this before wiping localStorage
async function syncReset() {
  if (!sbUser) return;
  clearTimeout(sbPushTimer);
  try { await sb.from('progress').delete().eq('user_id', sbUser.id); } catch {}
}

/* ---------- sync engine ---------- */

async function syncPushNow() {
  if (!sbUser) return;
  setSyncStatus('syncing');
  const { error } = await sb.from('progress').upsert({
    user_id: sbUser.id,
    state,
    updated_at: new Date().toISOString(),
  });
  setSyncStatus(error ? 'error' : 'synced');
}

function adoptRemoteState(remote) {
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, remote);
  save();
  renderHome();
}

async function handleSignedIn() {
  setSyncStatus('syncing');
  const { data, error } = await sb.from('progress')
    .select('state, updated_at').eq('user_id', sbUser.id).maybeSingle();
  if (error) { setSyncStatus('error'); return; }
  if (resolveSyncDirection(state._updatedAt, data) === 'pull') {
    adoptRemoteState(data.state);
    setSyncStatus('synced');
  } else {
    await syncPushNow();
  }
}

/* ---------- account UI ---------- */

function setSyncStatus(s) {
  sbStatus = s;
  renderAccountUi();
}

function renderAccountUi() {
  const area = document.getElementById('account-area');
  if (!area) return;
  if (!syncEnabled()) { area.innerHTML = ''; return; }

  if (!sbUser) {
    area.innerHTML = '<button class="btn ghost small" id="signin-btn">☁️ Sign in to sync</button>';
    document.getElementById('signin-btn').addEventListener('click', openAuthModal);
    return;
  }
  const dot = { syncing: '🟡', synced: '🟢', error: '🔴' }[sbStatus] || '⚪';
  const label = { syncing: 'syncing…', synced: 'synced', error: 'sync error — will retry on next save' }[sbStatus] || '';
  area.innerHTML = `
    <span class="stat" title="Signed in as ${escAttr(sbUser.email)} — ${escAttr(label)}">${dot} ${escAttr(shortEmail(sbUser.email))}</span>
    <button class="btn ghost small" id="signout-btn">Sign out</button>`;
  document.getElementById('signout-btn').addEventListener('click', async () => {
    clearTimeout(sbPushTimer);
    await sb.auth.signOut();
    sbUser = null;
    setSyncStatus('signedout');
  });
}

function shortEmail(email) {
  return email.length > 22 ? email.slice(0, 19) + '…' : email;
}
function escAttr(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

function openAuthModal() {
  document.getElementById('auth-modal').classList.remove('hidden');
  document.getElementById('auth-status').textContent = '';
  document.getElementById('auth-email').focus();
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.add('hidden');
}

async function sendMagicLink() {
  const email = document.getElementById('auth-email').value.trim();
  const status = document.getElementById('auth-status');
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    status.textContent = 'That doesn’t look like an email address.';
    return;
  }
  status.textContent = 'Sending…';
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: location.origin + location.pathname },
  });
  status.textContent = error
    ? `Couldn’t send the link: ${error.message}`
    : '✅ Check your email and open the link on this device.';
}

/* ---------- init ---------- */

document.addEventListener('DOMContentLoaded', async () => {
  if (!syncEnabled()) return;
  sb = supabase.createClient(SYNC_CONFIG.url, SYNC_CONFIG.anonKey);

  document.getElementById('auth-send').addEventListener('click', sendMagicLink);
  document.getElementById('auth-cancel').addEventListener('click', closeAuthModal);
  document.getElementById('auth-email').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMagicLink();
  });

  setSyncStatus('signedout');

  // Fires on initial load (including the magic-link redirect) and on sign-in/out
  sb.auth.onAuthStateChange((event, session) => {
    const user = session ? session.user : null;
    if (user && (!sbUser || sbUser.id !== user.id)) {
      sbUser = user;
      closeAuthModal();
      handleSignedIn();
    } else if (!user) {
      sbUser = null;
      setSyncStatus('signedout');
    }
  });
});
