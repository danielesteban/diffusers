<script lang="ts">
  import Link from 'components/link.svelte';
  import User from 'state/user';
  
  let isSending = false;
  let hasError = false;
  let hasSent = false;

  let email = '';
  const submit = (e: SubmitEvent) => {
    e.preventDefault();
    if (!email) {
      return;
    }
    hasError = false;
    isSending = true;
    User.recover(email)
      .then(() => {
        hasSent = true;
      })
      .catch(() => {
        hasError = true;
      })
      .finally(() => {
        isSending = false;
      });
  };
</script>

<form on:submit={submit} class="auth">
  <div class="header">
    Setup a new password
  </div>
  {#if hasSent}
    <div class="result">
      Check your email
    </div>
  {:else}
    <div class="fields">
      <input
        bind:value={email}
        type="email"
        placeholder="Email"
        autocomplete="username"
      />
    </div>
    <button
      disabled={isSending}
      type="submit"
    >
      Next
    </button>
    <div class="alt">
      <div>
        <Link to="">
          Have you remembered it?
        </Link>
      </div>
    </div>
    {#if hasError}
      <div class="error">
        Error requesting recovery
      </div>
    {/if}
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
  .alt {
    color: #666;
  }
  .error {
    color: #ebb;
  }
  .result {
    color: #beb;
  }
</style>
