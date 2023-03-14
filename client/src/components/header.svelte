<script lang="ts">
  import Link from 'components/link.svelte';
  import Logout from 'icons/logout.svelte';
  import User from 'state/user';
</script>

<div class="header">
  <div class="brand">
    <Link to="">diffusers</Link>
  </div>
  {#if $User}
    <div class="user">
      <Link to="account">{$User.name}</Link>
      <button on:click={User.logout}>
        <Logout />
      </button>
    </div>
  {/if}
</div>
  
<style>
  .header {
    height: 3rem;
    display: flex;
    align-items: center;
    background: #111;
    padding: 0 2rem;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.5);
    position: relative;
    z-index: 1;
  }
  .brand {
    font-size: 1.375rem;
  }
  .user {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .user > button {
    padding: 0.25rem 0.5rem;
  }
</style>
