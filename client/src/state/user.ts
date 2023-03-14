import { writable } from 'svelte/store';
import { baseURL, request } from 'state/server';

export type User = {
  name: string;
  session: string;
};

const key = '::session::';

let initial: User | null = null;
const stored = localStorage.getItem(key) || null;
if (stored) {
  try {
    initial = JSON.parse(stored);
  } catch (e) {
    initial = null;
  }
}

const { subscribe, set: setStore } = writable<User | null>(initial);

const set = (user: User | null) => {
  if (user) {
    setStore(user);
    localStorage.setItem(key, JSON.stringify(user));
  } else {
    setStore(null);
    localStorage.removeItem(key);
  }
};

if (initial) {
  request<User>({
    endpoint: 'user',
    session: initial.session,
  })
    .then(set)
    .catch(() => set(null));
}

export default {
  subscribe,
  async login(email: string, password: string) {
    const user = await request<User>({
      body: { email, password },
      endpoint: 'user',
      method: 'PUT',
    });
    set(user);
  },
  logout() {
    set(null);
  },
  recover(email: string) {
    return request<void>({
      body: { email },
      endpoint: 'user/recover',
      method: 'POST',
    });
  },
  async register(email: string, name: string, password: string) {
    const user = await request<User>({
      body: { email, name, password },
      endpoint: 'user',
      method: 'POST',
    });
    set(user);
  },
  async update(update: { name?: string; password?: string; }, session: string) {
    const user = await request<User>({
      body: update,
      endpoint: 'user',
      method: 'PATCH',
      session,
    });
    set(user);
  },
  loginWithGoogle() {
    const w = 512;
    const h = 512;
    const left = (window.screen.width / 2) - w / 2;
    const top = (window.screen.height / 2) - h / 2;
    const win = window.open(
      `${baseURL}user/google`,
      'loginWithGoogle',
      `width=${w},height=${h},top=${top},left=${left}`
    );
    return new Promise<void>((resolve, reject) => {
      if (!win) {
        reject();
        return;
      }
      const { origin: serverOrigin } = new URL(baseURL);
      let watcher = setInterval(() => {
        if (!win) {
          if (watcher) {
            window.removeEventListener('message', onMessage);
            clearInterval(watcher);
            reject();
          }
          return;
        }
        win.postMessage(true, serverOrigin);
      }, 100);
      const onMessage = ({ origin, data: { user } }: { origin: string; data: { user: User; }; }) => {
        if (origin === serverOrigin) {
          window.removeEventListener('message', onMessage);
          clearInterval(watcher);
          watcher = 0;
          if (!user) {
            reject();
            return;
          }
          set(user);
          resolve();
        }
      };
      window.addEventListener('message', onMessage, false);
    });
  },
};
