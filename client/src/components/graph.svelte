<script lang="ts">
  export let data: Record<string, Record<string, number>>;
  export let field: string;

  let canvas: HTMLCanvasElement;
  $: if (canvas && canvas.parentNode && data) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error();
    }
    const days = 29;
    const width = (canvas.parentNode as HTMLElement).getBoundingClientRect().width - 2;
    const height = 64;
    const size = width / days;
    canvas.width = width;
    canvas.height = height;

    const max = Object.keys(data).reduce((max, key) => Math.max(max, (data[key] && data[key][field]) || 0), 0);
    const ratio = (height - 10) / max;
    let time = new Date();
    for (let i = days - 1; i >= 0; i -= 1) {
      const year = time.getUTCFullYear();
      const month = time.getUTCMonth();
      const date = time.getUTCDate();
      const day = time.getUTCDay();
      const hours = time.getUTCHours();
      const key = `${year}${month < 9 ? '0' : ''}${month + 1}${date < 10 ? '0' : ''}${date}`;
      time = new Date(Date.UTC(year, month, date - 1, hours));
      if (day === 1) {
        ctx.fillStyle = '#444';
        ctx.fillRect(
          size * i, 0,
          size, height
        );
      }
      const value = data[key] && data[key][field];
      if (value) {
        const h = value * ratio;
        ctx.fillStyle = '#393';
        ctx.fillRect(
          size * i, height - h,
          size, h
        );
      }
      if (i > 0) {
        ctx.beginPath();
        ctx.lineWidth = 0.1;
        ctx.strokeStyle = '#000';
        ctx.moveTo(size * i, 0);
        ctx.lineTo(size * i, height);
        ctx.stroke();
      }
    }
  }
</script>

<div>
  <canvas bind:this={canvas} />
</div>

<style>
  canvas {
    border: 1px solid #111;
    border-radius: 0.25rem;
  }
</style>