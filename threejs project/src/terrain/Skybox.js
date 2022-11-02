"use strict";

import * as THREE from "../three.module.js";
import {MeshBasicMaterial, Object3D} from "../three.module.js";

export default class Skybox extends Object3D{
    constructor() {
        super();
        //skybox
        const loader = new THREE.TextureLoader();
        let skyGeometry = new THREE.BoxGeometry(500, 500, 500);
        let cubematerials =
            [
                new MeshBasicMaterial({map: loader.load('images/skybox/Daylight Box_Right.bmp'), side: THREE.DoubleSide}),
                new MeshBasicMaterial({map: loader.load('images/skybox/Daylight Box_Left.bmp'), side: THREE.DoubleSide}),
                new MeshBasicMaterial({map: loader.load('images/skybox/Daylight Box_Top.bmp'), side: THREE.DoubleSide}),
                new MeshBasicMaterial({map: loader.load('images/skybox/Daylight Box_Bottom.bmp'), side: THREE.DoubleSide}),
                new MeshBasicMaterial({map: loader.load('images/skybox/Daylight Box_Front.bmp'), side: THREE.DoubleSide}),
                new MeshBasicMaterial({map: loader.load('images/skybox/Daylight Box_Back.bmp'), side: THREE.DoubleSide})
            ];
        let skybox = new THREE.Mesh(skyGeometry, cubematerials);
        this.add(skybox);
    }
}