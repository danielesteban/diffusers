<script lang="ts">
  import Route from 'state/route';
  import User from 'state/user';
  
  export let session:string;

  let isSending = false;
  let hasError = false;

  let password = '';
  let confirmPassword = '';
  const submit = (e: SubmitEvent) => {
    e.preventDefault();
    if (
      !password
      || password !== confirmPassword
    ) {
      return;
    }
    hasError = false;
    isSending = true;
    User.update({ password }, session)
      .then(() => Route.replace(''))
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
  <div class="fields">
    <input
      bind:value={password}
      type="password"
      placeholder="Password"
      autocomplete="new-password"
    />
    <input
      bind:value={confirmPassword}
      type="password"
      placeholder="Confirm password"
      autocomplete="new-password"
    />
  </div>
  <button
    disabled={isSending}
    type="submit"
  >
    Save
  </button>
  {#if hasError}
    <div class="error">
      Error saving password
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
  .error {
    color: #ebb;
  }
</style>
