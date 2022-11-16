'use strict';

import {Mesh} from "../three.module.js";
import * as THREE from "../three.module.js";

export default class Sun extends Mesh {

    constructor(vertex, fragment) {
        super();

        let suniforms = {
            scolor: {value: new THREE.Color(0xfce570)}
        };
        this.geometry = new THREE.SphereGeometry();
        this.material = new THREE.ShaderMaterial({vertexShader: vertex, fragmentShader: fragment, uniforms: suniforms});
        this.scale.set(15, 15, 15);

        let white = new THREE.Color(THREE.Color.NAMES.white);
        let sun = new THREE.DirectionalLight(white, 1.0);

        sun.castShadow = true;

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

        this.add(sun);
    }
}