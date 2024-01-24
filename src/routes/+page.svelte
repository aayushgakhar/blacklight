<script>
  import 'cesium/Build/Cesium/Widgets/widgets.css'
  import * as Cesium from 'c137.js';
  import CesiumControllerWrapper from '$lib/components/cesiumControllerWrapper.svelte';
  import {onMount} from 'svelte';

  onMount( () =>{
    window.CESIUM_BASE_URL = '/cesium/';

  Cesium.Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMDM0YzE4Mi03YTYyLTRhMTctYjJjMS05NTIwNmEyNjI0ZTYiLCJpZCI6NzM4NzksImlhdCI6MTYzNzIzNzM2Nn0.gfdFhlx1UJgDQtsHnxfe-687BvpW0nMeEP2iXoRYeOo';
  });
</script>

<main>
  <CesiumControllerWrapper />
</main>