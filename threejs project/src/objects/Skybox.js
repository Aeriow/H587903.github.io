"use strict";

import * as THREE from "../three.module.js";
import {Mesh, MeshBasicMaterial, Object3D} from "../three.module.js";

export default class Skybox extends Mesh {
    constructor(vertex, fragment, hemisphereLightColor) {
        super();

        let uniforms = {
            topColor: {type: "c", value: new THREE.Color(0x0077ff)},
            bottomColor: {type: "c", value: new THREE.Color(0xffffff)},
            offset: {type: "f", value: 33},
            exponent: {type: "f", value: 0.6}
        }
        uniforms.topColor.value.copy(hemisphereLightColor);

        this.geometry = new THREE.SphereGeometry(500, 64, 32);
        this.material = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            uniforms: uniforms,
            side: THREE.DoubleSide
        });

    }
}