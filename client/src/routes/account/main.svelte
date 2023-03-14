<script lang="ts">
  import User from 'state/user';
  let name = $User!.name;

  let hasError = false;
  let isSaving = false;
  const submit = (e: SubmitEvent) => {
    e.preventDefault();
    hasError = false;
    isSaving = true;
    User.update({ name }, $User!.session)
      .catch(() => {
        hasError = true;
      })
      .finally(() => {
        isSaving = false;
      });
  };
</script>

<div class="account">
  <div>
    <h1>Account</h1>
    <form on:submit={submit}>
      <input type="text" autocomplete="off" bind:value={name} />
      <button disabled={isSaving} type="submit">
        Save
      </button>
      {#if hasError}
        <div class="error">
          Error saving
        </div>
      {/if}
    </form>
  </div>
</div>

<style>
  .account {
    display: grid;
    grid-template-columns: 1fr auto;
  }
  .account > div {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 2rem;
  }
  form {
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .error {
    color: #ebb;
  }
</style>
