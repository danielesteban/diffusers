import { match, MatchFunction } from 'path-to-regexp';
import { ComponentType } from 'svelte';
import { writable, Unsubscriber } from 'svelte/store';
import User from 'state/user';

// @ts-ignore
export const basename: string = __BASENAME__;
const { location } = document;
const { history } = window;

let isAuth = false;
let authSubscription: Unsubscriber;
let routes: { component: ComponentType; match: MatchFunction; requires: 'auth' | 'unauth' | 'none'; }[] = [];

const { subscribe, set } = writable<{
  component: ComponentType;
  path: string;
  params: Record<string, string>;
  requires: 'auth' | 'unauth' | 'none';
}>();

const update = (url = location.pathname) => {
  let component;
  let path = '';
  let params = {};
  let requires: 'auth' | 'unauth' | 'none' = 'none';
  for (let i = 0, l = routes.length; i < l; i++) {
    const route = routes[i];
    const matches = route.match(url);
    if (matches) {
      component = route.component;
      path = matches.path.slice(basename.length);
      params = matches.params;
      requires = route.requires;
      break;
    }
  }
  if (
    (requires === 'auth' && !isAuth)
    || (requires === 'unauth' && isAuth)
  ) {
    component = undefined;
  }
  if (!component) {
    history.replaceState({ from: path }, '', basename + (isAuth ? '' : 'auth'));
    update();
    return;
  }
  set({ component, path, params, requires });
};

window.addEventListener('popstate', () => update());

export default {
  subscribe,
  map(paths: { path: string; component: ComponentType; requires?: 'auth' | 'unauth' | 'none'; }[]) {
    if (!paths.find(({ path }) => path === 'auth')) {
      throw new Error('Must provide an auth route');
    }
    routes = paths.map(({ path, component, requires = 'none' }) => ({
      component,
      match: match(basename + path, { decode: decodeURIComponent }),
      requires,
    }));
    if (authSubscription) {
      authSubscription();
    }
    authSubscription = User.subscribe(($User) => {
      isAuth = !!$User;
      if (history.state && history.state.from) {
        history.replaceState({}, '', basename + history.state.from);
      }
      update();
    });
  },
  push(path: string) {
    path = basename + path;
    if (location.pathname !== path) {
      history.pushState({}, '', path);
      update();
    }
  },
  replace(path: string) {
    path = basename + path;
    if (location.pathname !== path) {
      history.replaceState({}, '', path);
      update();
    }
  },
};
