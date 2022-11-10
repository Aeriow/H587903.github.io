"use strict";

import * as THREE from './three.module.js';
import TextureSplattingMaterial from "./TextureSplattingMaterial.js";
import TerrainGeometry from "./terrain/TerrainGeometry.js";
import { VRButton } from "./VRButton.js";
import {Mesh, MeshPhongMaterial, PlaneGeometry} from './three.module.js';
import Skybox from "./objects/Skybox.js";
import Tree from "./objects/Tree.js";
import * as Utils from "./utils.js";
import Forest from "./terrain/Forest.js";



let scene, renderer, camera, dolly;
let sun, hemisphereLight, moon;
let skybox, tree;
let forest;
let helper, geometryHelper;
let terrainGeometry, waterGeometry;
let terrainMesh, waterMesh, moonMesh, sunMesh;
let sky;
let rain;
let rainPos = new THREE.Vector3();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let raycastIntersects;

let lastPointerMove = Date.now();


init();

function loop() {
  let time = new Date().getTime() * 0.0002;

  let nsin = Math.sin(time);
  let ncos = Math.cos(time);

  // set the sun and moon position
  sunMesh.position.set(300*nsin, 400*nsin, 400*ncos);
  moonMesh.position.set(-300*nsin, -400*nsin, -400*ncos);


  if (nsin > 0.2 )   // day
  {
    sky.material.uniforms.topColor.value.setRGB(0.25,0.55,1);
    sky.material.uniforms.bottomColor.value.setRGB(1,1,1);
    let f = 1;
    sun.intensity = f-0.2;
    sun.shadowDarkness = f*0.5;
  }

  else if (nsin < 0.2 && nsin > 0.0 )
  {
    let f = THREE.MathUtils.clamp(nsin/0.2, 0.2, 1);
    sun.intensity = f;
    sun.shadowDarkness = f*0.5;
    sky.material.uniforms.topColor.value.setRGB(0.25*f,0.55*f,1*f);//r0,2 g0,145 b0,27
    sky.material.uniforms.bottomColor.value.setRGB(1*f,1*f,1*f);
  }

  else  // night
  {
    let f = 0.2;
    sun.intensity = f;
    sun.shadowDarkness = f*0.5;
    sky.material.uniforms.topColor.value.setRGB(0.05,0.11,0.2);//best r0.05, g0.08, b0.27
    sky.material.uniforms.bottomColor.value.setRGB(0.2,0.2,0.2);
  }

  //Rain animate
  rainVariation();

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
  const gray = new THREE.Color(0x0d1c33);
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
  let svertex = await (await fetch('./src/shaders/vSun.glsl')).text();
  let sfragment = await (await fetch('./src/shaders/fSun.glsl')).text();
  let suniforms = {
    scolor: {value: new THREE.Color(0xfce570)}
  };
  let sunGeometry = new THREE.SphereGeometry();
  let sunMaterial = new THREE.ShaderMaterial({vertexShader: svertex, fragmentShader: sfragment, uniforms: suniforms});
  sunMesh = new Mesh(sunGeometry, sunMaterial);
  sunMesh.scale.set(15, 15, 15);
  scene.add(sunMesh);

  //sunlight
  sun = new THREE.DirectionalLight(white, 1.0);
  sun.castShadow = true;
  sunMesh.add(sun);


  //moon geometry
  let mvertex = await (await fetch('./src/shaders/vMoon.glsl')).text();
  let mfragment = await (await fetch('./src/shaders/fMoon.glsl')).text();
  let muniforms = {
    mcolor: {value: new THREE.Color(0xd3eade)}
  };
  let moonGeometry = new THREE.SphereGeometry();
  let moonMaterial = new THREE.ShaderMaterial({vertexShader: mvertex, fragmentShader: mfragment, uniforms: muniforms});
  moonMesh = new Mesh(moonGeometry, moonMaterial);
  moonMesh.scale.set(10, 10, 10);
  scene.add(moonMesh);

  //moonlight
  moon = new THREE.DirectionalLight(gray, 0.7);
  moonMesh.add(moon);


  //Increase shadow map size and add bias
  sun.shadow.mapSize.width = 8192;
  sun.shadow.mapSize.height = 8192;
  sun.shadow.bias = 0.0001;
  sun.shadow.normalBias = 0.02;

  //Increase sun span to cover scene
  sun.shadow.camera.top += 500;
  sun.shadow.camera.bottom -= 500;
  sun.shadow.camera.left -= 500;
  sun.shadow.camera.right += 500;
  sun.shadow.camera.far = 1000;
  //To see sun direction and attributes
  //scene.add(new THREE.CameraHelper(sun.shadow.camera));

  //Rain
  const rainGeometry = new THREE.BufferGeometry();
  const rainPoints = [];
  //Generate rainGeometry points
  for (let i = 0; i < 15000; i++) {
    rainPoints.push(
        Math.random() * 400 - 200,
        Math.random() * 500 - 250,
        Math.random() * 400 - 200
    );
  }

  rainGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( rainPoints, 3 ) );

  const rainMaterial = new THREE.PointsMaterial( {
    color: 0xaaaaaa,
    size: 0.1,
    transparent: true
  } );

  rain = new THREE.Points( rainGeometry, rainMaterial );
  scene.add(rain);


  //skybox
  //skybox = new Skybox();
  //scene.add(skybox);

  //adding fog to the scene
  scene.fog = new THREE.Fog(0xf2f8f7, 1, 1000);

  //load image
  const terrainImage = await Utils.loadImage('images/terrain.png');

  //load textures
  let grass = new THREE.TextureLoader().load('images/grass.png');
  let rock = new THREE.TextureLoader().load('images/rock.png');
  let alphaMap = new THREE.TextureLoader().load('images/terrain.png');
  let water = new THREE.TextureLoader().load('images/water.jpg');

  grass.wrapS = THREE.RepeatWrapping;
  grass.wrapT = THREE.RepeatWrapping;
  grass.repeat.multiplyScalar(128 / 8);

  rock.wrapS = THREE.RepeatWrapping;
  rock.wrapT = THREE.RepeatWrapping;
  rock.repeat.multiplyScalar(128 / 8);

  //create materials
  let terrainMaterial = new TextureSplattingMaterial({
    color: THREE.Color.NAMES.white,
    colorMaps: [grass, rock],
    alphaMaps: [alphaMap]
  });

  let waterMaterial = new MeshPhongMaterial({
    map: water,
    side: THREE.DoubleSide

  });

  //create geometry
  terrainGeometry = new TerrainGeometry(256, 256, 32, terrainImage);
  waterGeometry = new PlaneGeometry(1024, 1024, 1, 1);

  //create mesh
  terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
  waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
  terrainMesh.receiveShadow = true;
  terrainMesh.castShadow = true;
  waterMesh.receiveShadow = true;

  //Rotate and move water plane
  waterMesh.rotation.x = Math.PI / 2;
  waterMesh.position.y = 0.2;

  //add to scene
  scene.add(terrainMesh);
  scene.add(waterMesh);

  //generate trees
  tree = new Tree();

  forest = new Forest(scene, tree);
  forest.generate();

  scene.add(forest);

  /*
  tree.position.set(-40,0,10);
  tree.scale.set(1,1,1);
  scene.add(tree);*/


  //skybox with day/night cycle shaders
  let vertex = await (await fetch('./src/shaders/vertexShader.glsl')).text();
  let fragment = await (await fetch('./src/shaders/fragmentShader.glsl')).text();
  let uniforms = {
    topColor:    { type: "c", value: new THREE.Color( 0x0077ff ) },
    bottomColor: { type: "c", value: new THREE.Color( 0xffffff ) },
    offset:      { type: "f", value: 33 },
    exponent:    { type: "f", value: 0.6 }
  }
  uniforms.topColor.value.copy(hemisphereLight.color);

  let skyGeometry = new THREE.SphereGeometry( 500, 64, 32 );
  let skyMaterial = new THREE.ShaderMaterial( { vertexShader: vertex, fragmentShader: fragment, uniforms: uniforms, side: THREE.DoubleSide } );

  sky = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(sky);

  //create and add geometryHelper to scene - cone that visualizes raycast hit
  geometryHelper = new THREE.ConeGeometry( 4, 10, 8 );
  geometryHelper.translate(0,0,0);
  geometryHelper.rotateX(Math.PI / 2);
  helper = new THREE.Mesh(geometryHelper, new THREE.MeshNormalMaterial());
  scene.add(helper);

  //geometryHelper position is updated in the onPointerMove function
  window.addEventListener('pointermove', onPointerMove);

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
  raycaster.setFromCamera( pointer, camera );

  // See if the ray from the camera into the world hits one of our meshes
  raycastIntersects = raycaster.intersectObject( terrainMesh );


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
  if (raycastIntersects.length > 0) {
    let sceneIntersects = raycaster.intersectObjects(scene.children);

    //not ideal
    for(let i = 1; i < sceneIntersects.length; i++){
      if(sceneIntersects[i].object === terrainMesh){
        if(sceneIntersects[i-1].object !== helper){
          return;
        }
      }
    }

    let newTree = tree.clone();
    newTree.position.copy(raycastIntersects[0].point);
    forest.add(newTree);
  }
}

//Move raindrops when called, called from animation loop
function rainVariation() {
  let positionAttribute = rain.geometry.getAttribute('position');

  for ( let i = 0; i < positionAttribute.count; i++) {
    rainPos.fromBufferAttribute(positionAttribute, i);
    rainPos.y -= 1;
    if (rainPos.y < - 60) {
      rainPos.y = Math.random()*190;
    }
    positionAttribute.setXYZ( i, rainPos.x, rainPos.y, rainPos.z );
  }
  positionAttribute.needsUpdate = true;
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