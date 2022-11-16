'use strict';

import {Points} from "../three.module.js";
import * as THREE from "../three.module.js";

export default class Rain extends Points{

    rainGeometry;
    rainMaterial;
    rainPoints;
    rainPos = new THREE.Vector3();

    constructor() {
        super();

        //Rain
        this.rainGeometry = new THREE.BufferGeometry();
        this.rainPoints = [];
        //Generate rainGeometry points
        for (let i = 0; i < 15000; i++) {
            this.rainPoints.push(
                Math.random() * 400 - 200,
                Math.random() * 500 - 250,
                Math.random() * 400 - 200
            );
        }

        this.rainGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( this.rainPoints, 3 ) );

        this.rainMaterial = new THREE.PointsMaterial( {
            color: 0xaaaaaa,
            size: 0.1,
            transparent: true
        } );
        this.material = this.rainMaterial;
        this.geometry = this.rainGeometry;
    }

    //Move raindrops when called, called from animation loop
    rainVariation() {
        let positionAttribute = this.geometry.getAttribute('position');

        for ( let i = 0; i < positionAttribute.count; i++) {
            this.rainPos.fromBufferAttribute(positionAttribute, i);
            this.rainPos.y -= 1;
            if (this.rainPos.y < - 60) {
                this.rainPos.y = Math.random()*190;
            }
            positionAttribute.setXYZ( i, this.rainPos.x, this.rainPos.y, this.rainPos.z );
        }
        positionAttribute.needsUpdate = true;
    }
}