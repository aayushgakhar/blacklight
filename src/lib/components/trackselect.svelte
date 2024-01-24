<script>
  import Select from 'svelte-select';
  // import { cesiumConfig } from '../stores';
  import { onMount } from 'svelte';

  export let cc;
  export let init;

  var satellites = cc.sats.satellites;
  let items = satellites.map(
    (/** @type {{ props: { name: any; }; }} */ option) => {
      return {
        value: option.props.name,
        label: `${option.props.name} ${option.props.satnum}`,
      };
    }
  );

  let value;
  let justValue;
  onMount(() => {
    // value = $cesiumConfig.trackedSatellite;
    // // console.log('value', value);
    // cc.sats.enabledSatellitesByName = [
    //   ...cc.sats.enabledSatellitesByName,
    //   value,
    // ];
    // cc.sats.trackedSatellite = value;
    // console.log(cc.sats.trackedSatellite);
  });

  $: {
    init = false;
    if (justValue) {
      // console.log('justValue', justValue);
      cc.sats.enabledSatellitesByName = [
        ...cc.sats.enabledSatellitesByName,
        justValue,
      ];
      cc.sats.trackedSatellite = justValue;
      // console.log(cc.sats.trackedSatellite);
      // cesiumConfig.update((c) => {
      //   c.trackedSatellite = cc.sats.trackedSatellite;
      //   return c;
      // });
    } else {
      cc.sats.trackedSatellite = '';
      // cesiumConfig.update((c) => {
      //   c.trackedSatellite = cc.sats.trackedSatellite;
      //   return c;
      // });
    }
  }
  function customFilter(needle, option) {
    if (needle.length >= 3) {
      const label = option.label.toLowerCase();
      return label.includes(needle.toLowerCase());
    }
    return false;
  }
  let loadOptions = (needle) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(items.filter((option) => customFilter(needle, option)));
      }, 100);
    });
  };
  let filterText;
</script>

<Select
  class='w-96'
  {loadOptions}
  {items}
  closeListOnChange={false}
  bind:justValue
  bind:filterText
  placeholder="please type"
>
  <div slot="empty">{filterText.length>=3?'No options':'loading(type 3 chars)'}</div>
</Select>
