<script>
  import { get } from 'svelte/store';
    import * as Cesium from 'c137.js';
    export let viewer;

    let sats = [11,12,20,22]

    async function getcsv1(url1, fl, scene, points) {
    return fetch(url1, {
      mode: 'no-cors',
    })
      .then((response) => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response;
      })
      .then((response) => response.text())
      .then((data) => {
        // console.log(data);
        const arr = [];
        const lines = data.split(/\r?\n/);
        var len = fl ? lines.length : lines.length;
        var size =2
        var color = fl ? Cesium.Color.WHITE : Cesium.Color.WHITE.withAlpha(0.5);
        // const points = scene.primitives.add(
        //   new Cesium.PointPrimitiveCollection()
        // );

        for (let i = 1; i < len; i++) {
          if (lines[i]) {
            var str = lines[i];
            const temp = str.split(',');
            var x = parseFloat(temp[1]) * 1000;

            var y = parseFloat(temp[2]) * 1000;
            var z = parseFloat(temp[3]) * 1000;
            var coor = Cesium.Cartesian3.fromElements(x, y, z);
            arr.push(coor);
            // points.add({
            //   position: coor,
            //   color: color,
            //   pixelSize: size,
            // });
          }

          //   const tle = lines.splice(i - 3, i).join("\n");
          //   this.addFromTle(tle, tags);
        }

        const points1 = arr.map((position) => {
          var point_= new Cesium.Entity({
            position: position,
            point: {
              pixelSize: 5,
              color: Cesium.Color.YELLOW,
            },
          });
          viewer.entities.add(point_);
          return point_;
        });


        // points.add({
        //   position : new Cesium.Cartesian3(1.0, 2.0, 3.0),
        //   color : Cesium.Color.YELLOW
        // });
        // points.add({
        //   position : new Cesium.Cartesian3(4.0, 5.0, 6.0),
        //   color : Cesium.Color.CYAN
        // });

        // const points = arr.map((position) => {

        //   return new Cesium.Entity({
        //     position: position,
        //     point: {
        //       pixelSize: size,
        //       color:color ,
        //     },
        //   });
        // });
        // return points;
        return points1;
        console.log(points1)
      })
      .catch((error) => {
        console.log(error);
      });
  }

    let on = sats.map(x => false)
    $: classes = on.map(x => (on ? "dropdown-item is-active px-0" : "dropdown-item px-0"))
    let points = {}
    let points1 = {}

    const toggle = async (i) => {
        on[i] = !on[i];
        on = on;

        if(on[i]){
            // if(points[i] === undefined){
            //     points[i] = viewer.scene.primitives.add(
            //         new Cesium.PointPrimitiveCollection()
            //     );
            // }
            if(points1[i] === undefined){
                points1[i] = await getcsv1(
                `data/ch_${sats[i]}.csv`,
                false,
                viewer.scene, points[i]
                );
            }
            // console.log(points1[i])
            else points1[i].forEach((point) => {
      viewer.entities.add(point);
    });
            // points[i] = await getcsv1(
            //     `data/ch_${sats[i]}.csv`,
            //     false,
            //     viewer.scene, points[i]
            //     );
        }
        else{
            // points[i].removeAll();
            points1[i].forEach((point) => {
      viewer.entities.remove(point);
    });
            
        }
    }
</script>

{#each sats as sat, i }
<button class={classes[i]} on:click={()=>{toggle(i)}}>
    <div class='w-full'>
        {(!on[i] ? "Show " : "Hide ")+ sat}
    </div>
</button>
{/each}

<style>
    button {
        width: 100%;
        border-radius: 0;
        background-color: white;
    }
</style>