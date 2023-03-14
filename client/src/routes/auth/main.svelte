<script lang="ts">
  import Link from 'components/link.svelte';
  import Google from 'icons/google.svelte';
  import User from 'state/user';

  const loginWithGoogle = () => (
    User.loginWithGoogle()
      .catch(() => {})
  );

  let isSending = false;
  let isSignUp = false;
  let hasError = false;

  let email = '';
  let name = '';
  let password = '';
  let confirmPassword = '';
  const submit = (e: SubmitEvent) => {
    e.preventDefault();
    if (
      !email
      || (isSignUp && !name)
      || !password
      || (isSignUp && password !== confirmPassword)
    ) {
      return;
    }
    hasError = false;
    isSending = true;
    (isSignUp ? (
      User.register(email, name, password)
    ) : (
      User.login(email, password)
    ))
      .catch(() => {
        hasError = true;
      })
      .finally(() => {
        isSending = false;
      });
  };
  const toggle = () => {
    isSignUp = !isSignUp;
  };
</script>

<form on:submit={submit} class="auth">
  <div class="header">
    Sign {#if isSignUp}up{:else}in{/if}
  </div>
  <div>
    <button
      class="google"
      type="button"
      on:click={loginWithGoogle}
    >
      <Google />
      Sign in with Google
    </button>
  </div>
  <div class="fields">
    <input
      bind:value={email}
      type="email"
      placeholder="Email"
      autocomplete="username"
    />
    {#if isSignUp}
      <input
        bind:value={name}
        type="text"
        placeholder="Name"
        autocomplete="off"
      />
    {/if}
    <input
      bind:value={password}
      type="password"
      placeholder="Password"
      autocomplete={isSignUp ? 'new-password' : 'current-password'}
    />
    {#if isSignUp}
      <input
        bind:value={confirmPassword}
        type="password"
        placeholder="Confirm password"
        autocomplete="new-password"
      />
    {/if}
  </div>
  <button
    disabled={isSending}
    type="submit"
  >
    Sign {#if isSignUp}up{:else}in{/if}
  </button>
  <div class="alt">
    <div>
      <Link to="forgot">
        Forgot your password?
      </Link>
    </div>
    <div class="spacer" />
    <div>
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-missing-attribute -->
      <a on:click={toggle}>
        {#if isSignUp}Already have an account?{:else}Need an account?{/if}
      </a>
    </div>
  </div>
  {#if hasError}
    <div class="error">
      Error signing {#if isSignUp}up{:else}in{/if}
    </div>
  {/if}
</form>

<style>
  .auth, .fields {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }
  .fields {
    gap: 0.5rem;
    padding: 1rem 0;
    border-top: 1px solid #333;
    border-bottom: 1px solid #333;
  }
  .auth button, .fields > input {
    width: 12rem;
  }
  .header {
    font-size: 2em;
    line-height: 2em;
  }
  .google {
    background: #393;
    gap: 0.25rem;
  }
  .alt {
    display: flex;
    gap: 1rem;
    color: #666;
    margin: 1rem 0;
    text-align: center;
  }
  .spacer {
    width: 1px;
    background: #333;
  }
  .error {
    color: #ebb;
  }
</style>
