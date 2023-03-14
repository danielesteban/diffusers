import { writable } from 'svelte/store';
import { request } from 'state/server';

export type Workers = {
  depth: number;
  diffusion: number;
  upscale: number;
};

const { subscribe, set } = writable<Workers>({
  depth: 0,
  diffusion: 0,
  upscale: 0,
});

let controller: AbortController;

export default {
  subscribe,
  refresh() {
    if (controller) {
      controller.abort();
    }
    controller = new AbortController();
    return request<Workers>({
      endpoint: 'workers',
      signal: controller.signal,
    })
      .then(set)
      .catch((e) => {
        if (e.name !== 'AbortError') {
          throw e;
        }
      });
  },
};
