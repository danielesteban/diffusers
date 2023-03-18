import { writable } from 'svelte/store';
import { request } from 'state/server';

export type Jobs = Record<string, {
  depth: number;
  diffusion: number;
  upscale: number;
}>;

const { subscribe, set } = writable<Jobs>({});

let controller: AbortController;

export default {
  subscribe,
  refresh() {
    if (controller) {
      controller.abort();
    }
    controller = new AbortController();
    return request<Record<string, number[]>>({
      endpoint: 'jobs',
      signal: controller.signal,
    })
      .then((data) => (
        set(
          Object.keys(data).reduce((jobs, date) => {
            const [depth, diffusion, upscale] = data[date];
            jobs[date] = { depth, diffusion, upscale };
            return jobs;
          }, {} as Jobs)
        )
      ))
      .catch((e) => {
        if (e.name !== 'AbortError') {
          throw e;
        }
      });
  },
};
