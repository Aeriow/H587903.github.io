'use strict';

import { MeshPhongMaterial, PlaneGeometry, Mesh } from "../three.module.js";
import * as THREE from "../three.module.js";

export default class Water extends Mesh {

    constructor() {
        super();

        this.name = 'water';
        let water = new THREE.TextureLoader().load('images/water.jpg');

        this.geometry = new PlaneGeometry(1024, 1024, 1, 1);
        this.material = new MeshPhongMaterial({
            map: water,
            side: THREE.DoubleSide
        });

        this.receiveShadow = true;

        //Rotate and move water plane
        this.rotation.x = Math.PI / 2;
        this.position.y = 0.2;
    }
}