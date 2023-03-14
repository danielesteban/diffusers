<script lang="ts">
  import Header from 'components/header.svelte';
  import Workers from 'components/workers.svelte';
  import Route from 'state/route';

  import Auth from 'routes/auth/main.svelte';
  import Account from 'routes/account/main.svelte';
  import Dashboard from 'routes/dashboard/main.svelte';
  import Forgot from 'routes/auth/forgot.svelte';
  import Recovery from 'routes/auth/recovery.svelte';

  Route.map([
    { path: '', component: Dashboard, requires: 'auth' },
    { path: 'account', component: Account, requires: 'auth' },
    { path: 'auth', component: Auth, requires: 'unauth' },
    { path: 'forgot', component: Forgot, requires: 'unauth' },
    { path: 'recovery/:session', component: Recovery, requires: 'unauth' },
  ]);
</script>

<div class="main">
  <Header />
  <div class="layout">
    <svelte:component this={$Route.component} {...$Route.params} />
    <Workers />
  </div>
</div>

<style>
  .main {
    width: 100vw;
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr;
  }
  .layout {
    display: grid;
    grid-template-columns: 1fr auto;
    width: 100%;
    height: 100%;
    overflow-y: overlay;
  }
  :global(:root) {
    font-size: 16px;
    width: 100vw;
    height: 100%;
  }
  :global(body) {
    margin: 0;
    background: linear-gradient(to top, #000, #111, #222);
    color: #eee;
    cursor: default;
    user-select: none;
    overflow: hidden;
    font-family: 'Roboto Condensed', monospace;
    font-size: 0.75rem;
    line-height: 1em;
    width: 100vw;
    height: 100%;
    touch-action: none;
    -webkit-touch-callout: none;
    -webkit-text-size-adjust: none;
  }
  :global(a) {
    color: inherit;
    cursor: pointer;
    text-decoration: none;
    outline: none;
  }
  :global(canvas) {
    vertical-align: middle;
  }
  :global(button) {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #222;
    color: #eee;
    padding: 0.5rem 1rem;
    border: 1px solid #000;
    border-radius: 0.25rem;
    font-family: inherit;
    font-weight: inherit;
    cursor: pointer;
    outline: none;
  }
  :global(button:active) {
    transform: translate(0, 1px);
  }
  :global(button:disabled) {
    cursor: default;
    opacity: 0.3;
    transform: none;
  }
  :global(h1, h2, h3, h4, h5) {
    margin: 0;
    font-family: inherit;
    font-weight: 500;
    line-height: 1em;
  }
  :global(h1) {
    font-size: 1.375rem;
  }
  :global(input[type="email"], input[type="text"], input[type="password"]) {
    box-sizing: border-box;
    background-color: #222;
    padding: 0.5rem 1rem;
    border: 1px solid #000;
    border-radius: 0.25rem;
    color: inherit;
    font-family: inherit;
    font-weight: inherit;
    outline: none;
  }
  :global(
    input:-webkit-autofill,
    input:-webkit-autofill:hover, 
    input:-webkit-autofill:focus
  ) {
    -webkit-text-fill-color: #eee;
    transition: background-color 5000s ease-in-out 0s;
  }
  :global(::-webkit-scrollbar) {
    background-color: rgba(0, 0, 0, 0);
  }
  :global(::-webkit-scrollbar:hover) {
    background-color: rgba(0, 0, 0, 0);
  }
  :global(::-webkit-scrollbar:vertical) {
    width: 0.5rem;
  }
  :global(::-webkit-scrollbar-thumb:vertical) {
    background: #555;
  }
  :global(::-webkit-scrollbar-thumb:vertical:active) {
    background: #666;
  }
</style>
