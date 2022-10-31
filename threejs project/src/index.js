"use strict";

import * as THREE from "./three.module.js";

import TextureSplattingMaterial from "./TextureSplattingMaterial.js";
import TerrainGeometry from "./TerrainGeometry.js";
import {MeshPhongMaterial} from "./three.module.js";
import {VRButton} from "./VRButton.js";

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("canvas"),
  antialias: true,
});

//VRButton
document.body.append(VRButton.createButton(renderer));
renderer.xr.enabled = true;

const white = new THREE.Color(THREE.Color.NAMES.white);
renderer.setClearColor(white, 1.0);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

/*
* add camera as child of dolly
* to move camera out of default camera position
* and preventing it from returning to default
* position when entering VR
*/
let dolly = new THREE.PerspectiveCamera();
dolly.position.x = -20;
dolly.position.y = 15;
dolly.position.z = 20;
dolly.add(camera);
scene.add(dolly);

camera.lookAt(0, 0, 0);

const axesHelper = new THREE.AxesHelper(1);
scene.add(axesHelper);

const sun = new THREE.DirectionalLight(white, 1.0);
scene.add(sun);

const terrainImage = new Image();
terrainImage.onload = () => {

  const size = 128;
  const height = 5;

  const geometry = new TerrainGeometry(50, 128, 8, terrainImage);
  const waterGeometry = new TerrainGeometry(500, 128, 0.1, terrainImage);

  //loading textures
  const grass = new THREE.TextureLoader().load('images/grass.png');
  const rock = new THREE.TextureLoader().load('images/rock.png');
  const alphaMap = new THREE.TextureLoader().load('images/terrain.png');
  const water = new THREE.TextureLoader().load('images/water.jpg');

  //skybox
  const loader = new THREE.CubeTextureLoader();
  const skybox = loader.load([
    'images/skybox/Daylight Box_Right.bmp',
    'images/skybox/Daylight Box_Left.bmp',
    'images/skybox/Daylight Box_Top.bmp',
    'images/skybox/Daylight Box_Bottom.bmp',
    'images/skybox/Daylight Box_Front.bmp',
    'images/skybox/Daylight Box_Back.bmp',
  ]);
  scene.background = skybox;

  grass.wrapS = THREE.RepeatWrapping;
  grass.wrapT = THREE.RepeatWrapping;
  grass.repeat.multiplyScalar(size / 8);

  rock.wrapS = THREE.RepeatWrapping;
  rock.wrapT = THREE.RepeatWrapping;
  rock.repeat.multiplyScalar(size / 8);

  const material = new TextureSplattingMaterial({
    color: THREE.Color.NAMES.white,
    colorMaps: [grass, rock],
    alphaMaps: [alphaMap]
  });

  const waterMaterial = new MeshPhongMaterial({
    map: water,
    transparent: true
  });

  const mesh = new THREE.Mesh(geometry, material);
  const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);

  scene.add(mesh);
  scene.add(waterMesh);
};

terrainImage.src = 'images/terrain.png';


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

function loop() {
  updateRendererSize();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(loop);
