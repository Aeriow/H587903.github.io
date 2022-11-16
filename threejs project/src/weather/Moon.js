'use strict';

import {Mesh} from "../three.module.js";
import * as THREE from "../three.module.js";

export default class Moon extends Mesh {

    constructor(vertex, fragment) {
        super();

        let muniforms = {
            mcolor: {value: new THREE.Color(0xd3eade)}
        };
        this.geometry = new THREE.SphereGeometry();
        this.material = new THREE.ShaderMaterial({vertexShader: vertex, fragmentShader: fragment, uniforms: muniforms});
        this.scale.set(10, 10, 10);

        //moonlight
        let gray = new THREE.Color(0x0d1c33);
        let moon = new THREE.DirectionalLight(gray, 0.7);
        this.add(moon);
    }
}