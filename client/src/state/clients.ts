import { writable } from 'svelte/store';
import { request } from 'state/server';
import type { User as UserType } from 'state/user';
import User from 'state/user';

type Client = {
  id: string;
  name: string;
  key: string;
  origin: string;
  createdAt: Date;
};

const { subscribe, set, update } = writable<Client[]>([]);

let user: UserType | null;
User.subscribe((value) => {
  user = value;
});

const controllers: Map<string, AbortController> = new Map();

const fetch = <T>({
  body,
  endpoint = 'clients',
  method = 'GET',
}: {
  body?: any;
  endpoint?: string;
  method?: string;
} = {}) => {
  if (!user) {
    throw new Error();
  }
  if (method !== 'POST') {
    const ongoing = controllers.get(`${method}:${endpoint}`);
    if (ongoing) {
      ongoing.abort();
    }
  }
  const controller = new AbortController();
  controllers.set(`${method}:${endpoint}`, controller);
  return request<T>({
    body,
    endpoint,
    method,
    signal: controller.signal,
    session: user.session,
  });
};

export default {
  subscribe,
  refresh() {
    controllers.forEach((controller) => controller.abort());
    controllers.clear();
    return fetch<Client[]>()
      .then(set)
      .catch((e) => {
        if (e.name !== 'AbortError') {
          throw e;
        }
      });
  },
  create() {
    return fetch<Client>({ endpoint: 'client', method: 'POST' })
      .then((client) => update((clients) => [client, ...clients]))
      .catch((e) => {
        if (e.name !== 'AbortError') {
          throw e;
        }
      });
  },
  remove(id: string) {
    return fetch<string>({ endpoint: `client/${id}`, method: 'DELETE' })
      .then(() => update((clients) => clients.filter((c) => c.id !== id)))
      .catch((e) => {
        if (e.name !== 'AbortError') {
          throw e;
        }
      });
  },
  update(id: string, data: { name?: string; origin?: string; }) {
    return fetch<string>({
      body: data,
      endpoint: `client/${id}`,
      method: 'PUT',
    })
      .then(() => update((clients) => clients.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            ...data,
          };
        }
        return c;
      })))
      .catch((e) => {
        if (e.name !== 'AbortError') {
          throw e;
        }
      });
  }
};
