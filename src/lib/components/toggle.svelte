<script>
  import { cesiumConfig } from '../stores';
  export let component;
  export let cc;

  let on = cc.sats.enabledComponents.includes(component);
  $: classes = on ? 'dropdown-item is-active px-0' : 'dropdown-item px-0';

  const toggle = () => {
    on = !on;
    if (on) {
      cc.sats.enableComponent(component);
      cesiumConfig.update((c) => {
        c.enabledComponents = cc.sats.enabledComponents;
        return c;
      });
    } else {
      cc.sats.disableComponent(component);
      cesiumConfig.update((c) => {
        c.enabledComponents = cc.sats.enabledComponents;
        return c;
      });
    }
  };
</script>

<button class={classes} on:click={toggle}>
  <div class="w-full">
    {(!on ? 'Show ' : 'Hide ') + component}
  </div>
</button>

<style>
  button {
    width: 100%;
    border-radius: 0;
    background-color: white;
  }
</style>
