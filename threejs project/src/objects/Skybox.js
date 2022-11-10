"use strict";

import * as THREE from "../three.module.js";
import {MeshBasicMaterial, Object3D} from "../three.module.js";

export default class Skybox extends Object3D{
    constructor() {
        super();

        const loader = new THREE.TextureLoader();
        let skyGeometry = new THREE.BoxGeometry(900, 900, 900);
        let cubematerials =
            [
                new MeshBasicMaterial({map: loader.load('images/skybox/Daylight Box_Right.bmp'), side: THREE.BackSide, fog: false}),
                new MeshBasicMaterial({map: loader.load('images/skybox/Daylight Box_Left.bmp'), side: THREE.BackSide, fog: false}),
                new MeshBasicMaterial({map: loader.load('images/skybox/Daylight Box_Top.bmp'), side: THREE.BackSide, fog: false}),
                new MeshBasicMaterial({map: loader.load('images/skybox/Daylight Box_Bottom.bmp'), side: THREE.BackSide, fog: false}),
                new MeshBasicMaterial({map: loader.load('images/skybox/Daylight Box_Front.bmp'), side: THREE.BackSide, fog: false}),
                new MeshBasicMaterial({map: loader.load('images/skybox/Daylight Box_Back.bmp'), side: THREE.BackSide, fog: false})
            ];
        let skybox = new THREE.Mesh(skyGeometry, cubematerials);
        this.add(skybox);
    }
}