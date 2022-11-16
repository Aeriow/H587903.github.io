'use strict';

import {MeshPhongMaterial, Object3D, PlaneGeometry} from "../three.module.js";
import * as THREE from "../three.module.js";

export default class Water extends Object3D{

    constructor() {
        super();

        let water = new THREE.TextureLoader().load('images/water.jpg');

        let waterGeometry = new PlaneGeometry(1024, 1024, 1, 1);
        let waterMaterial = new MeshPhongMaterial({
            map: water,
            side: THREE.DoubleSide
        });
        let waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
        waterMesh.receiveShadow = true;

        //Rotate and move water plane
        waterMesh.rotation.x = Math.PI / 2;
        waterMesh.position.y = 0.2;

        this.add(waterMesh);
    }
}