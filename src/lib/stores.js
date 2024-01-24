import { writable } from "svelte/store";

const defaultCesiumConfig = {
  showUI: true,
  imageryProvider: 'Offline',
  terrainProvider: 'None',
  sceneMode: '3D',
  cameraMode: 'Fixed',
  enabledComponents: ['Point', 'Label', 'Orbit'],
  enabledSatellitesByName: [],
  trackedSatellite: '',
  init: true,
};


export const cesiumConfig = writable(defaultCesiumConfig);
export const imageryProvider = 'Offline';
export const showUI = true;
export const terrainProvider = 'None';
export const sceneMode = '3D';
export const cameraMode = 'Fixed';
export const enabledComponents = ['Point', 'Label'];
export const enabledSatellitesByName = [];
export const trackedSatellite = '';
export const init = true;