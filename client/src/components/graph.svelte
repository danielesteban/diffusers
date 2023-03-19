<script lang="ts">
  export let data: Record<string, Record<string, number>>;
  export let fields: string[];

  const days = 29;

  let tooltip = {
    enabled: false,
    text: [''],
    x: 0,
  };

  let graph: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let values: Record<string, string>[];
  $: if (graph && canvas && data) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error();
    }
    const width = graph.getBoundingClientRect().width - 2;
    const height = 64;
    const size = width / days;
    canvas.width = width;
    canvas.height = height;

    const max = Object.keys(data).reduce((max, key) => {
      if (data[key]) {
        max = Math.max(max, Object.keys(data[key]).reduce((total, field) => (
          total + data[key][field]
        ), 0));
      }
      return max;
    }, 0);
    const ratio = (height - 10) / max;
    let time = new Date();
    values = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const year = time.getUTCFullYear();
      const month = time.getUTCMonth();
      const date = time.getUTCDate();
      const day = time.getUTCDay();
      const hours = time.getUTCHours();
      const key = `${year}${month < 9 ? '0' : ''}${month + 1}${date < 10 ? '0' : ''}${date}`;
      time = new Date(Date.UTC(year, month, date - 1, hours));
      if (day === 1) {
        ctx.fillStyle = '#333';
        ctx.fillRect(
          size * i, 0,
          size, height
        );
      }
      if (data[key]) {
        let offset = height;
        ctx.fillStyle = '#363';
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = '#000';
        fields.forEach((field) => {
          const value = data[key][field];
          const h = Math.floor(value * ratio);
          const x = size * i;
          const y = offset - h;
          if (h === 0) {
            return;
          }
          ctx.fillRect(x, y, size, h);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + size, y);
          ctx.stroke();
          offset -= h;
        });
      }
      values[i] = {
        date: `${month < 9 ? '0' : ''}${month + 1}/${date < 10 ? '0' : ''}${date}`,
      };
      fields.forEach((field) => {
        values[i][field] = `${data[key] && data[key][field] || 0}`;
      });
      if (i > 0) {
        ctx.lineWidth = 0.1;
        ctx.strokeStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(size * i, 0);
        ctx.lineTo(size * i, height);
        ctx.stroke();
      }
    }
  }

  const pointerenter = () => {
    tooltip = { ...tooltip, enabled: true };
  };
  const pointerleave = () => {
    tooltip = { ...tooltip, enabled: false };
  };
  const pointermove = (e: PointerEvent) => {
    const rect = graph.getBoundingClientRect();
    const width = rect.width - 2;
    const size = width / days;
    const i = Math.min(Math.max(Math.floor((e.clientX - rect.x + 1) / size), 0), days - 1);
    if (!values[i]) {
      return;
    }
    const text = [
      values[i].date,
      ...fields.map((field) => `${field}: ${values[i][field]}`),
    ];
    tooltip = { ...tooltip, x: (i + 0.5) * size, text };
  };
</script>

<div bind:this={graph} class="graph">
  <canvas
    bind:this={canvas}
    on:pointerenter={pointerenter}
    on:pointerleave={pointerleave}
    on:pointermove={pointermove}
  />
  {#if tooltip.enabled}
    <div
      class="tooltip"
      style="left: {tooltip.x}px"
    >
      {#each tooltip.text as line, index}
        <div class:date={index === 0}>
          {line}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  canvas {
    border: 1px solid #111;
    border-radius: 0.25rem;
  }
  .graph {
    position: relative;
  }
  .tooltip {
    position: absolute;
    top: 100%;
    background: rgba(0, 0, 0, .4);
    padding: 0.25rem;
    border-radius: 0.25rem;
    transform: translate(-50%, 0);
    white-space: nowrap;
    text-transform: capitalize;
    line-height: 1rem;
    z-index: 1;
  }
  .date {
    color: #999;
  }
</style>
