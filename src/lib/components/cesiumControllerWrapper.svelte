<script>
  import { onMount } from 'svelte';
  import 'cesium/Build/Cesium/Widgets/widgets.css';
  import * as Cesium from 'c137.js';
  import {
    SceneMode,
    Transforms,
    Matrix4,
    Cartesian3,
    Color,
    JulianDate,
    PolylineCollection,
  } from 'c137.js';
  import { CesiumController } from '../modules/CesiumController';
  import Toolbar from './toolbar.svelte';
  import { cesiumConfig } from '../stores';
  // import { PointsEntity } from '../modules/PointsEntity';
  import * as math from 'mathjs';
  import { escape_attribute_value } from 'svelte/internal';
  import { SatelliteManager } from '../modules/SatelliteManager';
  import * as satellite from 'satellite.js';

  let loaded = false;
  let data = null;
  let norm = false;
  let cc;
  let viewer;
  let init = true;
  let minimalUI = false;
  var points;
  const satUpdateIntervalTime = 50; //update interval in ms
  const orbitSteps = 44; //number of steps in predicted orbit
  var satellitesData = []; //currently displayed satellites TLE data (name, satrec)
  let displayedOrbit = undefined; //displayed orbit data [satrec, refresh time in seconds]
  let lastOrbitUpdateTime = JulianDate.now();
  let scene;
  let globe;
  let clock;
  let entities;
  let dataLoadingInProgress = false;
  let dataLoadingProgress = 0;
  let polylines;
  async function getcsv(url) {
    // fetch('https://www.space-track.org/ajaxauth/login', {
    //   method: 'POST',
    //   body: new URLSearchParams({
    //     identity: 'ardra20143@iiitd.ac.in',
    //     password: 'aog22594jalajasuresh'
    //   })
    // })
    // .then(response => response.json())
    // .then(result => {
    //   return fetch('https://www.space-track.org/basicspacedata/query/class/tle_latest/NORAD_CAT_ID/25544/orderby/TLE_LINE1%20ASC/format/json', {
    //     headers: {
    //       'Authorization': `Bearer ${result.token}`
    //     }
    //   })
    // })
    // .then(response => response.json())
    // .then(result => {
    //   data.items = result;
    // });

    // // Return the reactive data object
    // return {
    //   data
    // };
    return fetch(url, {
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

        for (let i = 1; i < lines.length; i++) {
          if (lines[i]) {
            var str = lines[i];
            str = str.padStart(5, '0');
            arr.push(str);
          }

          //   const tle = lines.splice(i - 3, i).join("\n");
          //   this.addFromTle(tle, tags);
        }
        return arr;
      })
      .catch((error) => {
        console.log(error);
      });
  }
  async function getcsv1(url1, fl, scene) {
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
        var size = fl ? 1 : 5;
        var color = fl ? Cesium.Color.WHITE : Cesium.Color.YELLOW;
        const points = scene.primitives.add(
          new Cesium.PointPrimitiveCollection()
        );

        for (let i = 1; i < len; i++) {
          if (lines[i]) {
            var str = lines[i];
            const temp = str.split(',');
            var x = parseFloat(temp[1]) * 1000;

            var y = parseFloat(temp[2]) * 1000;
            var z = parseFloat(temp[3]) * 1000;
            var coor = Cesium.Cartesian3.fromElements(x, y, z);
            arr.push(coor);
            points.add({
              position: coor,
              color: color,
              pixelSize: size,
            });
          }

          //   const tle = lines.splice(i - 3, i).join("\n");
          //   this.addFromTle(tle, tags);
        }

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

        return points;
      })
      .catch((error) => {
        console.log(error);
      });
  }
  async function getcsv2(url1, url2, viewer) {
    // const points = await fetch(url1, {
    //   mode: 'no-cors',
    // })
    //   .then((response) => {
    //     if (!response.ok) {
    //       throw Error(response.statusText);
    //     }
    //     return response;
    //   })
    //   .then((response) => response.text())
    //   .then((data) => {
    //     // console.log(data);
    //     const arr = [];
    //     const lines = data.split(/\r?\n/);

    //     for (let i = 1; i < lines.length; i += 100) {
    //       if(lines[i]){
    //       var x = 0,
    //         y = 0,
    //         z = 0;
    //       for (let j = 0; j < 100; j++) {
    //         if (lines[i]) {
    //           var str = lines[i];
    //           const temp = str.split(',');
    //           x += parseFloat(temp[1]) * 10;

    //           y += parseFloat(temp[2]) * 10;
    //           z += parseFloat(temp[3]) * 10;
    //         }
    //       }
    //       var coor = Cesium.Cartesian3.fromElements(x, y, z);
    //       arr.push(coor);
    //     }

    //       //   const tle = lines.splice(i - 3, i).join("\n");
    //       //   this.addFromTle(tle, tags);
    //     }

    //     return arr;
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });

    const ellipsoids = fetch(url2, {
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
        const property = new Cesium.SampledPositionProperty();
        const start = Cesium.JulianDate.fromDate(new Date());
        var lines = data.split(/\r?\n/);
        lines = lines.reverse();

        for (let i = 1; i < 289; i++) {
          if (lines[i]) {
            // console.log(lines[1])
            const time = Cesium.JulianDate.addSeconds(
              start,
              10 + 300 * (i - 1),
              new Cesium.JulianDate()
            );
            var str = lines[i];
            const temp = str.split(',');
            var mat = [];
            var pos = [];
            for (var j = 0; j < 3; j++) {
              var temp1 = [];
              for (var k = 0; k < 3; k++) {
                temp1.push(parseFloat(temp[3 * j + k + 1]));
              }
              mat.push(temp1);
              pos.push(parseFloat(temp[9 + j + 1]) * 1000);
            }

            var position = Cesium.Cartesian3.fromElements(
              pos[0],
              pos[1],
              pos[2]
            );
            property.addSample(time, position);
            // console.log(pos)
            const covarianceMatrix = mat;

            var eigen = math.eigs(covarianceMatrix);
            // console.log(eigen, covarianceMatrix);
            var eigenValues = eigen.values; // array of eigenvalues
            var ev = eigenValues.map((x) => Math.sqrt(x) * 1000);
            // console.log(eigen)
            var eigenVectors = eigen.vectors; // 3x3 matrix of eigenvectors
            var evcts = [];
            for (var j = 0; j < 3; j++) {
              // var temp1 = [];
              for (var k = 0; k < 3; k++) {
                evcts.push(eigenVectors[j][k]);
              }
            }
            evcts = eigenVectors.flat();
            // console.log(evcts);

            //             var normalizedEvcts = evcts.map((value, index) => value / ev[index]);
            // console.log(normalizedEvcts);
            // console.log(eigenVectors);
            // [
            //   ...eigenVectors[0],
            //   ...eigenVectors[1],
            //   ...eigenVectors[2],
            // ];
            var orientationMatrix = Cesium.Matrix3.fromRowMajorArray(evcts);
            var orientation =
              Cesium.Quaternion.fromRotationMatrix(orientationMatrix);
            // console.log(orientation);
            var ellipsoidEntity = viewer.entities.add({
              position: position,
              orientation: orientation,
              ellipsoid: {
                radii: Cesium.Cartesian3.fromArray(ev),
                material: Cesium.Color.RED.withAlpha(0.5),
              },
            });
            arr.push(ellipsoidEntity);
          }
        }
        return arr;
      })
      .catch((error) => {
        console.log(error);
      });
    return ellipsoids;
  }

  const deleteSatellites = () => {
    satellitesData = [];
    displayedOrbit = undefined;
    polylines.removeAll();
    viewer.entities.removeAll();
    // scene.primitives.remove(polylines);
  };

  async function point() {
    Cesium.Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMDM0YzE4Mi03YTYyLTRhMTctYjJjMS05NTIwNmEyNjI0ZTYiLCJpZCI6NzM4NzksImlhdCI6MTYzNzIzNzM2Nn0.gfdFhlx1UJgDQtsHnxfe-687BvpW0nMeEP2iXoRYeOo';
    // Camera.DEFAULT_VIEW_RECTANGLE = Rectangle.fromDegrees(-60, -40, 60, 80); //sets default view
    // viewer = new Cesium.Viewer('cesiumContainerInit', {
    //   // animation: !minimalUI,
    //   baseLayerPicker: false,
    //   // fullscreenButton: !minimalUI,
    //   // fullscreenElement: document.body,
    //   geocoder: false,
    //   homeButton: false,
    //   sceneModePicker: false,
    //   navigationHelpButton: false,
    //   navigationInstructionsInitiallyVisible: false,
    //   shouldAnimate: true,
    //   // selectionIndicator: false,
    //   infoBox:false,
    //   // timeline: !minimalUI,
    //   // vrButton: !minimalUI,
    //   contextOptions: {
    //     webgl: {
    //       alpha: true,
    //     },
    //   },
    //   terrainProvider: Cesium.createWorldTerrain(),
    //   // Use OpenStreetMaps
    //   // imageryProvider: new Cesium.createWorldImagery({
    //   //   style: Cesium.IonWorldImageryStyle.AERIAL,
    //   //   source: new Cesium.TileMapServiceImageryProvider({
    //   //     url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'),
    //   //   }),
    //   // }),
    // });
    // viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    // viewer.scene.globe.showGroundAtmosphere = false;
    // const layers = viewer.scene.imageryLayers;
    // var provider = new Cesium.TileMapServiceImageryProvider({
    //   url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'),
    // });
    // layers.removeAll();
    // layers.addImageryProvider(provider);
    scene = viewer.scene;
    globe = viewer.scene.globe;
    clock = viewer.clock;
    entities = viewer.entities;
    // viewer.homeButton.viewModel.duration = 1;
    viewer.clock.multiplier = 20;

    polylines = new PolylineCollection(); //collection for displaying orbits
    // scene.primitives.add(polylines);

    globe.nightFadeInDistance = 40000000;
    globe.nightFadeOutDistance = 10000000;

    //camera lock functions
    const disableCamIcrf = () => {
      //locks camera on the globe
      scene.postUpdate.removeEventListener(cameraIcrf);
      viewer.camera.lookAtTransform(Matrix4.IDENTITY);
    };
    const enableCamIcrf = () => {
      //locks camera in space
      scene.postUpdate.addEventListener(cameraIcrf);
    };

    const addSatelliteMarker = ([satName, satrec]) => {
      const posvel = satellite.propagate(
        satrec,
        JulianDate.toDate(clock.currentTime)
      );
      const gmst = satellite.gstime(JulianDate.toDate(clock.currentTime));
      const pos = Object.values(satellite.eciToEcf(posvel.position, gmst)).map(
        (el) => (el *= 1000)
      ); //position km->m

      entities.add({
        name: satName,
        position: Cartesian3.fromArray(pos),
        point: {
          pixelSize: 2,
          color: Color.CYAN,
        },
        // label: {
        //   show: false,
        //   text: satName,
        //   showBackground: true,
        //   font: '16px monospace',
        //   horizontalOrigin: HorizontalOrigin.LEFT,
        //   verticalOrigin: VerticalOrigin.CENTER,
        //   pixelOffset: new Cartesian2(10, 0),
        //   eyeOffset: Cartesian3.fromElements(0, 0, -10000),
        // },
      });
    };

    // const calculateOrbit = (satrec) => {
    //   try {
    //     //init
    //     let orbitPoints = []; //array for calculated points
    //     const period = (2 * Math.PI) / satrec.no; // orbital period in minutes
    //     const timeStep = period / orbitSteps; //time interval between points on orbit
    //     let baseTime = new JulianDate(); //time of the first point
    //     JulianDate.addMinutes(clock.currentTime, -period / 2, baseTime); //sets base time to the half period ago
    //     let tempTime = new JulianDate(); //temp date for calculations

    //     //calculate points in ECI coordinate frame
    //     for (let i = 0; i <= orbitSteps; i++) {
    //       JulianDate.addMinutes(baseTime, i * timeStep, tempTime);
    //       let posvelTemp = satellite.propagate(
    //         satrec,
    //         JulianDate.toDate(tempTime)
    //       );
    //       if (posvelTemp.position !== undefined) {
    //         orbitPoints.push(
    //           Cartesian3.fromArray(Object.values(posvelTemp.position))
    //         );
    //       }
    //     }

    //     //convert coordinates from kilometers to meters
    //     orbitPoints.forEach((point) =>
    //       Cartesian3.multiplyByScalar(point, 1000, point)
    //     );

    //     //polyline material
    //     const polylineMaterial = new Material.fromType('Color'); //create polyline material
    //     polylineMaterial.uniforms.color = Color.YELLOW; //set the material color

    //     polylines.removeAll();
    //     polylines.add({
    //       positions: orbitPoints,
    //       width: 1,
    //       material: polylineMaterial,
    //       id: 'orbit',
    //     });

    //     displayedOrbit = [satrec, period * 30];
    //   } catch (error) {
    //     console.log('This satellite is deorbited.');
    //   }
    // };

    // const clearOrbit = () => {
    //   displayedOrbit = undefined;
    //   polylines.removeAll();
    // };

    // const updateOrbit = () => {
    //   if (displayedOrbit !== undefined) {
    //     if (
    //       clock.currentTime.equalsEpsilon(
    //         lastOrbitUpdateTime,
    //         displayedOrbit[1]
    //       ) === false
    //     ) {
    //       lastOrbitUpdateTime = clock.currentTime;
    //       calculateOrbit(displayedOrbit[0]);
    //     }
    //   }
    // };

    const updateSatellites = () => {
      //updates satellites positions
      if (satellitesData.length && viewer.clockViewModel.shouldAnimate) {
        const gmst = satellite.gstime(JulianDate.toDate(clock.currentTime));
        satellitesData.forEach(([satName, satrec], index) => {
          //update satellite entity position
          try {
            const posvel = satellite.propagate(
              satrec,
              JulianDate.toDate(clock.currentTime)
            );
            const pos = Object.values(
              satellite.eciToEcf(posvel.position, gmst)
            ).map((el) => (el *= 1000)); //position km->m

            entities.values[index].position = Cartesian3.fromArray(pos); //update satellite position
            entities.values[index].point.color = Color.CYAN; //update point color
          } catch (error) {
            entities.values[index].point.color = Color.RED; //update point color
          }
        });
      }
    };

    const setLoadingData = (bool) => {
      //shows loading bar
      dataLoadingInProgress = bool;
      // const loadingBar = document.getElementById("progress-bar");
      // if (bool) {
      //     loadingBar.style.visibility = "visible";
      // } else {
      //     loadingBar.style.visibility = "hidden";
      // }
    };

    const getData = async (targetUrl) => {
      //get TLE data using CORS proxy
      if (dataLoadingInProgress === false) {
        setLoadingData(true);
        const bar = document.getElementById('bar');

        const proxyUrl = 'https://cors-noproblem.herokuapp.com/';
        const response = await fetch(targetUrl, {
          mode: 'no-cors',
        });
        let textLines = (await response.text()).split(/\r?\n/); //split file to separate lines
        textLines = textLines.filter((e) => {
          return e;
        }); //delete empty lines at the eof

        if (textLines.length) {
          let tempSatellitesData = [];
          //read file line by line
          try {
            for (let i = 0; i < 30000; i += 3) {
              //check if TLE texts length is correct
              if (
                textLines[i + 1].length === 69 &&
                textLines[i + 2].length === 69
              ) {
                let tempSatrec = satellite.twoline2satrec(
                  textLines[i + 1],
                  textLines[i + 2]
                );

                //check if TLE is valid
                if (
                  satellite.propagate(
                    tempSatrec,
                    JulianDate.toDate(clock.currentTime)
                  ).position === undefined
                ) {
                  continue; //skips this loop iteration
                }
                tempSatellitesData.push([textLines[i].trim(), tempSatrec]);
              } else {
                throw `Error: The TLE data file can't be processed. The file may be corrupted.`;
              }
            }
          } catch (error) {
            console.log(error);
            setLoadingData(false);
          }
          tempSatellitesData.forEach((sat) => addSatelliteMarker(sat)); //create point entities
          satellitesData.push(...tempSatellitesData); //add satellites to updated satellites array
        }
        setLoadingData(false);
      }
    };

    const cameraIcrf = (scene, time) => {
      if (scene.mode !== SceneMode.SCENE3D) {
        return;
      }
      let icrfToFixed = Transforms.computeIcrfToFixedMatrix(time);
      if (icrfToFixed !== undefined) {
        let camera = viewer.camera;
        let offset = Cartesian3.clone(viewer.camera.position);
        let transform = Matrix4.fromRotationTranslation(icrfToFixed);
        camera.lookAtTransform(transform, offset);
      }
    };
    const orbitIcrf = (scene, time) => {
      if (polylines.length) {
        let mat = Transforms.computeTemeToPseudoFixedMatrix(time);
        polylines.modelMatrix = Matrix4.fromRotationTranslation(mat);
      }
    };

    const satUpdateInterval = setInterval(
      updateSatellites,
      satUpdateIntervalTime
    ); //enables satellites positions update
    // scene.postUpdate.addEventListener(cameraIcrf); //enables camera lock at the start
    // scene.postUpdate.addEventListener(orbitIcrf); //enables orbit lock at the start

    // scene.postUpdate.addEventListener(updateOrbit); //enables orbit update

    // viewer.screenSpaceEventHandler.setInputAction((input) => { }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK); //reset default doubleclick handler

    // const handler = new ScreenSpaceEventHandler(scene.canvas); //custom event handler
    // handler.setInputAction((input) => { //left click input action
    //     let picked = scene.pick(input.position);
    //     if (picked) {
    //         let entity = defaultValue(picked.id, picked.primitive.id);
    //         if (entity instanceof Entity) {
    //             if (entity.label.show.getValue() === false) {
    //                 entity.label.show = true;
    //                 calculateOrbit(satellitesData.find(el => el[0] === entity.name)[1]);
    //             } else {
    //                 entity.label.show = false;
    //                 clearOrbit();
    //             }
    //         }
    //     }
    // }, ScreenSpaceEventType.LEFT_CLICK);
    // enableCamIcrf()

    //     var initialPosition = Cesium.Cartesian3.fromDegrees(-75.0, 40.0, 20000000);
    // viewer.camera.setView({
    //   destination: initialPosition,
    //   orientation: {
    //     heading: Cesium.Math.toRadians(0),
    //     pitch: Cesium.Math.toRadians(-45),
    //     roll: Cesium.Math.toRadians(0)
    //   }
    // });

    getData('data/tle/all.txt').then(() => {
      // viewer.trackedEntity = viewer.entities.add({
      //   position: Cesium.Cartesian3.ZERO, // Center of the Earth
      //   orientation: Cesium.Quaternion.IDENTITY // No rotation
      // });
      // var initialPosition = Cesium.Cartesian3.fromDegrees(-75.0, 40.0, 20000000);
      // viewer.camera.setView({
      //   destination: initialPosition,
      //   orientation: {
      //     heading: Cesium.Math.toRadians(0),
      //     pitch: Cesium.Math.toRadians(-45),
      //     roll: Cesium.Math.toRadians(0)
      //   }
      // });
      // // Define the final camera position
      // var finalPosition = Cesium.Cartesian3.fromDegrees(-75.0, 140.0, 1000000);
      // // Define the duration of the animation (in seconds)
      // var duration = 5;
      // // Set the Earth as the tracked entity
      // // Fly the camera to the final position
      // viewer.camera.flyTo({
      //   destination: finalPosition,
      //   orientation: {
      //     heading: Cesium.Math.toRadians(0),
      //     pitch: Cesium.Math.toRadians(-30),
      //     roll: Cesium.Math.toRadians(0)
      //   },
      //   duration: duration,
      //   complete: function() {
      //     // Animation complete callback
      //     // Add your satellite visualization here or any other code you want to execute after the animation
      //   }
      // });
    });

    // viewer.extend(Cesium.viewerCesiumInspectorMixin);
    // points = await getcsv1('data/sats.csv', true, viewer.scene);
    // const points1 = await getcsv1('data/ghk_covar_11.csv', false, viewer.scene);

    // console.log(points);
    // var cviewer = viewer;
    // const pointss = await getcsv1(
    //   'data/ghk_check_11.csv',
    //   false,
    //   cviewer.scene
    // );

    // const ellipsoids = await getcsv2(
    //   'data/ghk_check_11.csv',
    //   'data/ghk_covar_11.csv',
    //   cviewer
    // );
    // window.ee = ellipsoids;
    //
    // console.log(points);
    // const ellipsoids = await getcsv2('data/c11.csv', 'data/ghk_covar_11.csv', viewer);
    // viewer.flyto(ellipsoids[0]);
    // console.log(ellipsoids[0]);
    // points.forEach((point) => {
    //   viewer.entities.add(point);
    // });
    // ellipsoids.forEach((el) => {
    //   viewer.entities.add(el);
    // });
    window.viewer = viewer;
    // window.points = points;
    // window.ellipsoids = ellipsoids;
    // window.arr = arr;

    // console.log(arr);
    // const position = Cesium.Cartesian3.fromElements(8000000, 33000, 7000000);
    // const covarianceMatrix = [
    //   [200000.0, 0.0, 0.0],
    //   [0.0, 300000.0, 0.0],
    //   [0.0, 0.0, 400000.0],
    // ];
    // var eigen = math.eigs(covarianceMatrix);
    // var eigenValues = eigen.values; // array of eigenvalues
    // var eigenVectors = eigen.vectors; // 3x3 matrix of eigenvectors
    // eigenVectors = [...eigenVectors[0], ...eigenVectors[1], ...eigenVectors[2]];
    // var orientationMatrix = Cesium.Matrix3.fromArray(eigenVectors);
    // var orientation = Cesium.Quaternion.fromRotationMatrix(orientationMatrix);
    // var ellipsoidEntity = viewer.entities.add({
    //   position: Cesium.Cartesian3.fromDegrees(10000000, 6000000, 1000000),
    //   orientation: orientation,
    //   // Cesium.Transforms.headingPitchRollQuaternion(
    //   //     Cesium.Cartesian3.fromDegrees(0.0, 0.0),
    //   //     new Cesium.HeadingPitchRoll(
    //   //         Cesium.Math.toRadians(45.0),
    //   //         Cesium.Math.toRadians(0.0),
    //   //         Cesium.Math.toRadians(0.0)
    //   //     )
    //   // ),
    //   ellipsoid: {
    //     radii: Cesium.Cartesian3.fromArray(eigenValues),
    //     material: Cesium.Color.RED.withAlpha(0.5),
    //     outline: true,
    //     outlineColor: Cesium.Color.BLACK,
    //   },
    // });
  }
  var satt;

  async function normal() {
    norm = true;
    cc = new CesiumController();
    viewer = cc.viewer;

    // var x = await cc.sats.addFromTleUrl('https://celestrak.com/NORAD/elements/active.txt');
    // await cc.sats.addFromTleUrlnc('data/tle/all.txt', ['Active']);

    await cc.sats.addFromTleUrlnc('data/tle/norad/stations.txt', ['Stations']);
    // await cc.sats.addFromTleUrlnc('data/tle/norad/active.txt', ['Active']);
    // const arr = await getcsv('data/generated/sat_sec.csv')
    // console.log("🚀 ~ file: cesiumControllerWrapper.svelte:53 ~ onMount ~ arr:", arr)
    // const arr = await getcsv('data/generated/sat_sec copy.csv')
    // console.log("🚀 ~ file: cesiumControllerWrapper.svelte:53 ~ onMount ~ arr:", arr)

    // cc.sats.enabledSatellitesByNum=arr
    // const data = await getTLE();
    // console.log(data)

    // cc.sats.trackedSatelliteNum = '37380'

    console.log(cesiumConfig);
    cc.imageryProvider = $cesiumConfig.imageryProvider;
    cc.sceneMode = $cesiumConfig.sceneMode;
    cc.showUI = $cesiumConfig.showUI;
    cc.sats.enabledComponents = $cesiumConfig.enabledComponents;

    cc.viewer.scene.globe.showGroundAtmosphere = false;
    // cc.sats.enabledSatellitesByNum = $cesiumConfig.enabledSatellitesByNum;
    var es = [];
    var num = 40555;

    // points.forEach((point) => {
    //   cviewer.entities.add(point);
    // });
    // ellipsoids.forEach((el) => {
    //   cviewer.entities.add(el);
    // });
    // cviewer.flyto(ellipsoids[0]);

    // cc.sats.satellites.forEach((sat) => {
    //   es.push(sat.name);
    // });
    // cc.sats.enabledSatellitesByName = es;
    // console.log(es)
  }
  async function f() {
    var res = await fetch('/api/loadoptions');
    res.body
      .getReader()
      .read()
      .then(({ done, value }) => {
        console.log(value);
      });
    console.log(res);
  }

  onMount(async () => {
    await normal();
    await point();
    // f();

    loaded = true;
  });
  let cinit = 'is-inactive';
  let cnormal = 'is-active';
  async function ff() {
    for (var i = 0; i < ellipsoids.length; i++) {
      await viewer.flyTo(ellipsoids[i]);

      viewer.trackedEntity = ellipsoids[i];
      await new Promise((r) => setTimeout(r, 7000));
    }
  }
  $: {
    console.log(1);
    if (init === false) {
      if (init) {
        // cinit = 'is-active';
        // cnormal = 'is-inactive';
      } else {
        deleteSatellites();
        viewer.clock.multiplier = 1;
        //     scene.postUpdate.removeEventListener(cameraIcrf);
        // viewer.camera.lookAtTransform(Matrix4.IDENTITY);
        // cinit = 'is-inactive';
        // cnormal = 'is-active';
        // points.removeAll();
        // ff();
        // viewer?.entities.removeAll();
        // viewer?.destroy();
      }
    }
  }
  $: init;
</script>

<div>
  <!-- {#if init} -->
  <!-- <div id="cesiumContainerInit" class={cinit} /> -->
  <!-- {/if} -->
  <div id="cesiumContainer" class={cnormal} />

  {#if !loaded}
    <div>Loading...</div>
  {:else}
    <Toolbar {cc} bind:init {viewer} />
  {/if}
</div>

<style>
  .is-active {
    display: block;
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
  }
  .is-inactive {
    display: none;
    width: 0;
    height: 0;
    /* position: absolute; */
    top: 0;
    left: 0;
  }
</style>
