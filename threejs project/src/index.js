"use strict";

import * as THREE from './three.module.js';
import { VRButton } from "./VRButton.js";
import {Mesh, MeshPhongMaterial, PlaneGeometry} from './three.module.js';
import Tree from "./objects/Tree.js";
import Forest from "./terrain/Forest.js";
import Rain from "./weather/Rain.js"
import Water from "./terrain/Water.js";
import Terrain from "./terrain/Terrain.js";
import * as Utils from "./utils.js";
import Sun from "./weather/Sun.js";
import Moon from "./weather/Moon.js";
import Skybox from "./objects/Skybox.js";
import DayNightCycle from "./weather/DayNightCycle.js";


let scene, renderer, camera, dolly;
let sun, hemisphereLight, moon;
let skybox, tree;
let forest;
let helper, geometryHelper;
let rain, water, terrain;
let dayNightCycle;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let raycastIntersects;

let lastPointerMove = Date.now();


init();

function loop() {

  dayNightCycle.update();

  //Rain animate
  rain.rainVariation();

  updateRendererSize();
  renderer.render(scene, camera);
}

async function init() {

  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("canvas"),
    antialias: true,
  });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  //colors
  const white = new THREE.Color(THREE.Color.NAMES.white);
  renderer.setClearColor(white, 1.0);

  //VRButton
  document.body.append(VRButton.createButton(renderer));
  renderer.xr.enabled = true;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, 1, 0.1, 5000);
  /*
  * add camera as child of dolly to move camera out of default camera position
  * and preventing it from returning to default position when entering VR
  */
  dolly = new THREE.PerspectiveCamera();
  dolly.position.set(-100, 70, -100)

  dolly.add(camera);
  scene.add(dolly);

  camera.lookAt(0, 0, 0);

  //hemisphere lighting
  hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.02);
  hemisphereLight.position.y = 100;
  scene.add(hemisphereLight);

  //sun geometry
  let sunVertex = await (await fetch('./src/shaders/vSun.glsl')).text();
  let sunFragment = await (await fetch('./src/shaders/fSun.glsl')).text();
  sun = new Sun(sunVertex, sunFragment);
  scene.add(sun);

  //moon geometry
  let moonVertex = await (await fetch('./src/shaders/vMoon.glsl')).text();
  let moonFragment = await (await fetch('./src/shaders/fMoon.glsl')).text();
  moon = new Moon(moonVertex, moonFragment);
  scene.add(moon);

  //skybox with day/night cycle shaders
  let vertex = await (await fetch('./src/shaders/vertexShader.glsl')).text();
  let fragment = await (await fetch('./src/shaders/fragmentShader.glsl')).text();
  skybox = new Skybox(vertex, fragment, hemisphereLight.color);
  scene.add(skybox);

  //day night cycle
  dayNightCycle = new DayNightCycle(sun, moon, skybox);

  //adding fog to the scene
  scene.fog = new THREE.Fog(0xf2f8f7, 1, 1000);

  let terrainImage = await Utils.loadImage('images/terrain.png');
  terrain = new Terrain(terrainImage);
  water = new Water();
  rain = new Rain();

  //add to scene
  scene.add(terrain);
  scene.add(water);
  scene.add(rain);

  //generate trees
  tree = new Tree();

  forest = new Forest(tree, terrain);
  forest.generate(100, 256, 256, 2);
  scene.add(forest);

  //create and add geometryHelper to scene - cone that visualizes raycast hit
  geometryHelper = new THREE.ConeGeometry( 4, 10, 8 );
  geometryHelper.translate(0,0,0);
  geometryHelper.rotateX(Math.PI / 2);
  helper = new THREE.Mesh(geometryHelper, new THREE.MeshNormalMaterial());
  scene.add(helper);

  //geometryHelper position is updated in the onPointerMove function
  window.addEventListener('pointermove', onPointerMove);

  //place tree on click
  window.addEventListener('click', onClick);

  //calls loop every frame
  renderer.setAnimationLoop(loop);
}


/**
 * Raycast at mouse-pointer location, and update the position of geometryHelper accordingly
 * @param event
 */
function onPointerMove(event) {

  if (Date.now() - lastPointerMove < 59) { // 60 frames a second
    return;
  }

  pointer.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
  pointer.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  // See if the ray from the camera into the world hits one of our meshes
  raycastIntersects = raycaster.intersectObject(terrain);

  // Toggle rotation bool for meshes that we clicked
  if (raycastIntersects.length > 0) {
    helper.position.set(0, 0, 0);
    helper.lookAt(raycastIntersects[0].face.normal);
    helper.position.copy(raycastIntersects[0].point);
  }

  lastPointerMove = Date.now();
}

/**
 * Raycast at mouse-pointer location, and add tree to forest at that position.
 * Only if the first intersected object hit is the terrainMesh.
 * @param event
 */
function onClick(event){
  let raycastIntersects = raycaster.intersectObject(terrain);

  if (raycastIntersects.length > 0) {
    if(raycastIntersects[0].point.y < 0.5 || raycastIntersects[0].point.y >= 20) {
      return;
    };

    let newTree = tree.clone();
    newTree.position.copy(raycastIntersects[0].point);
    forest.add(newTree);
  }
}

function updateRendererSize() {
  const { x: currentWidth, y: currentHeight } = renderer.getSize(
      new THREE.Vector2()
  );
  const width = renderer.domElement.clientWidth;
  const height = renderer.domElement.clientHeight;

  if (width !== currentWidth || height !== currentHeight) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}