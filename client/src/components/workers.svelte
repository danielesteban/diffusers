<script lang="ts">
  import { onMount } from 'svelte';
  import Workers from 'state/workers';

  onMount(() => {
    Workers.refresh();
    const interval = setInterval(Workers.refresh, 30000);
    return () => (
      clearInterval(interval)
    );
  });

  // @ts-ignore
  const version: string = __VERSION__;
</script>

<div class="container">
  <div class="section">
    <h1>
      Get your GPU in the network!
    </h1>

    <div class="entry">
      Docker compose
<pre>services:
  client:
    image: ghcr.io/danielesteban/diffusers/worker:v{version}
    restart: always
    environment:
     - PIPELINES_DEPTH=True
     - PIPELINES_DIFFUSION=True
     - PIPELINES_UPSCALE=True
    volumes:
     - models:/home/worker/models
volumes:
  models:</pre>
    </div>

    <div class="entry">
      Windows GUI
      <div>
        <a
          class="link"
          href="https://github.com/danielesteban/diffusers/releases/download/v{version}/diffusers-worker-v{version}.exe"
          rel="noopener noreferrer"
          target="_blank"
        >
          diffusers-worker-v{version}.exe
        </a>
      </div>
    </div>
  </div>

  <div class="section">
    <h1>
      Available workers
    </h1>

    <div class="workers">
      <div>
        <div class:available={$Workers.depth}>{$Workers.depth}</div>
        Depth
      </div>
      <div>
        <div class:available={$Workers.diffusion}>{$Workers.diffusion}</div>
        Diffusion
      </div>
      <div>
        <div class:available={$Workers.upscale}>{$Workers.upscale}</div>
        Upscale
      </div>
    </div>
  </div>
</div>

<style>
  .container {
    width: 400px;
    box-sizing: border-box;
    background: #222;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 2rem;
  }
  .section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .entry {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .workers {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }
  .workers > div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .workers > div:nth-child(2) {
    justify-content: center;
  }
  .workers > div:nth-child(3) {
    justify-content: flex-end;
  }
  .workers > div > div {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    background: #633;
    border-radius: 0.5rem;
    font-size: 0.8em;
  }
  .workers > div > div.available {
    background: #363;
  }
  .link {
    color: #aaa;
    text-decoration: underline;
  }
  pre {
    margin: 0.25rem 0 0;
    padding: 1rem;
    border-radius: 0.5rem;
    background: #111;
    color: #999;
    font-family: inherit;
    font-weight: initial;
    font-size: inherit;
    line-height: inherit;
    user-select: all;
  }
</style>
