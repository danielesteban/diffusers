<script>
  import Route, { basename } from 'state/route';

  export let to;

  $:href = basename + to;

  const onClick = (e) => {
    if (!e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      Route.push(to);
    }
  };
</script>

<a
  on:click={onClick}
  {href}
>
  <slot></slot>
</a>
