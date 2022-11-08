"use strict";

import * as THREE from "../three.module.js";
import {GLTFLoader} from "../GLTFLoader.js";
import {Object3D} from "../three.module.js";

export default class Tree extends Object3D{

    constructor() {
        super();

        this.name = 'tree';
        const loader = new GLTFLoader();
        //Sketchfab model link: https://skfb.ly/6VoOK
        loader.load( 'src/models/low_poly_pine.glb', (obj) => {
            let tree = obj.scene.children[0].clone();
            tree.castShadow = true;
            tree.receiveShadow = true;
            tree.position.set(0,0,0);
            tree.scale.set(1,1,1);

            this.add(tree);
        }, undefined, function ( error ) {
            console.error( error );
        });
    }
}