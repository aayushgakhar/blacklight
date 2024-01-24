<script>
    import Select from 'svelte-select';
    // import {cesiumConfig} from '../stores';

    export let cc;
    export let init;

    
    var satellites = cc.sats.satellites;
    let items = satellites.map((/** @type {{ props: { name: any; }; }} */ option) => {
        return { value: option.props.satnum, label: `${option.props.name} ${option.props.satnum}`}
    })


    let value;
    let justValue;
    let textvalue;

    $: {
        init = false;
        if(justValue){
            cc.sats.enabledSatellitesByNum = justValue;
            
            // cesiumConfig.update((c) => {
            //     c.enabledSatellitesByNum = justValue;
            //     return c;
            // });
        }else{
            cc.sats.enabledSatellitesByNum = [];
            // cesiumConfig.update((c) => {
            //     c.enabledSatellitesByNum = [];
            //     return c;
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

    function onSubmit(){
    //     var es = []
    // cc.sats.satellites.forEach((sat) => {
    //   if(sat.props.satnum != 45265 )es.push(sat.props.satnum);
    // });
    
    // console.log(es)
    // justValue = es
    // value = items.filter((item) => es.includes(item.value))
        var tv = textvalue.split(/\s+/);
        // console.log(textvalue);
        // console.log(tv);
        if (justValue)justValue.push(...tv);
        else justValue = tv;
        // get items with value in tv
        if (value)value = value.concat(items.filter((item) => tv.includes(item.value)))
        else value = items.filter((item) => tv.includes(item.value))
        console.log(value);
    }
    


</script>

<Select {loadOptions} items={items} multiple closeListOnChange={false} bind:justValue bind:value/>

<form on:submit|preventDefault={onSubmit}>
    <textarea class='bg-white mt-4' type='text' bind:value={textvalue} placeholder="write norad values, space separated or in new lines." cols='30' rows='10' />
    <button class="txt-white" type="submit">Submit</button>
</form>

<style>
    .bg-white {
        background-color: white;
        border: black solid 1px;
        padding: 10px;
    }
    .txt-white {
        color: white;
        background-color: black;

    }
</style>