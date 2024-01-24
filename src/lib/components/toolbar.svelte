<script>
  // import {Icon} from 'svelte-fontawesome';
  import Toggle from './toggle.svelte';
  import 'bootstrap-icons/font/bootstrap-icons.css';
  // import 'bootstrap/dist/css/bootstrap.min.css';
  import Trackselect from './trackselect.svelte';
  import EnabledSelect from './enabledselect.svelte';
  import 'bulma/css/bulma.min.css';
  import {cesiumConfig, showUI} from '../stores';
  import ToggleSample from './toggleSample.svelte';
  
  export let cc;
  export let init = true;
  // export let viewer;

  
  let show = $cesiumConfig.showUI;
  function showclick() {
    show = !show;
    cesiumConfig.update((c) => {
      c.showUI = show;
      return c;
    });


  }
  let on3d = $cesiumConfig.sceneMode === '3D';
  var components = [
    'Label',
    'Orbit',
    // 'Orbit track',
    // 'Ground track',
    'Ellipsoid',
  ];
  let c1 = ''
  let c2 = ''
  function f1(){
    if(init)init = false;
    if(c1===''){
      c1 = 'is-active'
      c2 = ''
    }else{
      c1 = ''
    }
  }
  function f2(){
    if(init)init = false;
    if(c2===''){
      c2 = 'is-active'
      c1 = ''
    }else{
      c2 = ''
    }
  }
  function changeinit(){
    if(init)init = false;
  }
</script>

<div class="toolbar-container">
  {#if show}<div class='toolbar left-toolbar absolute'>
      <div style="display: inline-flex;">
        <a href='https://ssl.iiitd.edu.in/'>
        <img
          src="ssl.png"
          alt="Celestrak"
          width="300"
          height="100"
          />
          </a>
      </div>
      
    </div>
  {/if}
  <div class="toolbar right-toolbar absolute right-0 p-10 m-10">
    {#if show}
      <div class="dropdown {c1}">
        <div class="dropdown-trigger">
          <button
            class="button"
            aria-haspopup="true"
            aria-controls="dropdown-menu1"
            on:click={f1}
          >
            <!-- <FontAwesomeIcon icon="fa-solid fa-satellite" /> -->
            <span>Satellites</span>
            <span class="icon is-small">
              <i class="bi bi-caret-down-fill" />
            </span>
          </button>
        </div>
        <div class="dropdown-menu" id="dropdown-menu1" role="menu">
          <div class="dropdown-content w-96">
            <div class="dropdown-item w-96">
              <p>Track</p>
              <Trackselect cc={cc} {init} />
              <!-- <ToggleSample {viewer} /> -->
            </div>
            <div class="dropdown-divider" />
            <div class="dropdown-item">
              <p>Enabled</p>
              <EnabledSelect cc={cc} {init} />
            </div>
          </div>
        </div>
      </div>
      <div class="dropdown {c2}">
        <div class="dropdown-trigger">
          <button
            class="button"
            aria-haspopup="true"
            aria-controls="dropdown-menu2"
            on:click={f2}
          >
            <span>Components</span>
            <span class="icon is-small">
              <i class="bi bi-caret-down-fill" />
            </span>
          </button>
        </div>
        <div class="dropdown-menu" id="dropdown-menu2" role="menu">
          <div class="dropdown-content">
            {#each components as component}
            
              <Toggle component={component} cc={cc} />
            
            {/each}
          </div>
        </div>
      </div>
      <!-- <button
        class="button"
        on:click={() => {
          on3d = !on3d;
          if(cc!== undefined)
            cc.sceneMode = on3d ? '3D' : '2D';
          else{
            if(on3d){
              viewer.scene.morphTo3D();
            }else{
              viewer.scene.morphTo2D();
            }
          }
        }}
      >
        <i
          class={on3d
            ? 'bi bi-badge-3d-fill text-3xl'
            : 'bi bi-badge-3d text-3xl'}
        />
      </button> -->
    {/if}
    <button
      class="button p-2"
      on:click={showclick}
    >
      <i
        class={show ? 'bi bi-eye-fill text-3xl' : 'bi bi-eye-slash text-3xl'}
      />
    </button>
    {#if init}
    <button
      class="button p-2"
      on:click={changeinit}
    >
    {init ? 'start' : 'done'}
    
    </button>
    {:else}
    <a href='/'>
    <button
      class="button p-2"
      on:click={changeinit}
    >
    {init ? 'start' : 'done'}
    
    </button>
    </a>
    {/if}
  </div>
</div>

<style>
  .toolbar-container {
    width: 100%;
    position: fixed;
  }
  .toolbar {
    position: absolute;
    top: 0;
    /* left: 0; */
    z-index: 1000;
    width: auto;
  }
  .right-toolbar {
    top: 0;
    right: 0;
    padding: 18px;

  }

</style>
