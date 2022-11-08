"use strict";

import * as THREE from "../three.module.js";
import {GLTFLoader} from "../GLTFLoader.js";
import {Object3D} from "../three.module.js";



export default class Tree extends Object3D{

    constructor(scene) {
        super();
        this.scene = scene;
    }

    generate(){
        const loader = new GLTFLoader();

        //Sketchfab model link: https://skfb.ly/6VoOK
        loader.load( 'src/models/low_poly_pine.glb', (obj) => {
            let tree = obj.scene.children[0].clone();
            tree.scale.set(5,5,5);
            this.scene.add(tree);
        }, undefined, function ( error ) {
            console.error( error );
        });
    }
}