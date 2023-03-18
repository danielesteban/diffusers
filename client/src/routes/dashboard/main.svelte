<script lang="ts">
  import { onMount } from 'svelte';
  import Graph from 'components/graph.svelte';
  import Edit from 'icons/edit.svelte';
  import Plus from 'icons/plus.svelte';
  import Trash from 'icons/trash.svelte';
  import Clients from 'state/clients';

  onMount(Clients.refresh);
  const update = (id: string, key: string) => ({ target }: any) => {
    if (key === 'origin') {
      try {
        target.value = new URL(target.value).origin;
      } catch (e) {
        return;
      }
    }
    Clients.update(id, { [key]: target.value });
  };

  let isEditing = false;
  const toggleEdit = () => {
    isEditing = !isEditing;
  };
</script>

<div>
  <h1>
    Applications
    <div>
      {#if $Clients.length > 0}
        <button
          on:click={toggleEdit}
        >
          <Edit />
        </button>
      {/if}
      {#if (isEditing || $Clients.length === 0) && $Clients.length < 16}
      <button
        on:click={Clients.create}
      >
        <Plus />
      </button>
    {/if}
    </div>
  </h1> 
  <div class="clients">
    {#each $Clients as client (client.id)}
      <div class="client">
        <div class="meta">
          <div><input type="text" value={client.name} on:change={update(client.id, 'name')} /></div>
          <div class="key">{client.key}</div>
          <div><input type="text" value={client.origin} on:change={update(client.id, 'origin')} /></div>
        </div>
        <div class="jobs">
          <Graph
            data={client.jobs}
            fields={['depth', 'diffusion', 'upscale']}
          />
        </div>
        {#if isEditing}
          <div class="actions">
            <button
              on:click={() => Clients.remove(client.id)}
            >
              <Trash />
            </button>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  h1 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2rem;
  }
  h1 > div {
    display: flex;
    gap: 0.5rem;
  }
  h1 > div > button, .actions > button {
    padding: 0.25rem 0.5rem;
  }
  .clients {
    background: rgba(64, 64, 64, .1);
  }
  .client {
    display: grid;
    grid-template-columns: 1fr auto auto;
  }
  .client:nth-child(even) {
    background: rgba(64, 64, 64, .1);
  }
  .meta {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem 2rem;
  }
  .jobs {
    display: flex;
    align-items: center;
    padding: 0 2rem;
  }
  .actions {
    display: flex;
    padding: 1rem 2rem 1rem 0;
    align-items: center;
  }
  .client input[type="text"] {
    border: 0;
    margin: 0;
    padding: 0;
    background: transparent;
    width: 100%;
  }
  .key {
    user-select: all;
  }
</style>
