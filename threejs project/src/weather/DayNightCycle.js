'use strict';

import * as THREE from "../three.module.js";

export default class DayNightCycle {

    sun;
    sunLight;
    moon;
    skybox;

    constructor(sun, moon, skybox) {
        this.sun = sun;
        //get directional light from sun child
        this.sunLight = sun.children[0];
        this.moon = moon;
        this.skybox = skybox;
    }

    update(){
        let time = new Date().getTime() * 0.0002;

        let nsin = Math.sin(time);
        let ncos = Math.cos(time);

        // set the sun and moon position
        this.sun.position.set(300*nsin, 400*nsin, 400*ncos);
        this.moon.position.set(-300*nsin, -400*nsin, -400*ncos);


        if (nsin > 0.2 )   // day
        {
            this.skybox.material.uniforms.topColor.value.setRGB(0.25,0.55,1);
            this.skybox.material.uniforms.bottomColor.value.setRGB(1,1,1);
            let f = 1;
            this.sunLight.intensity = f-0.2;
            this.sunLight.shadowDarkness = f*0.5;
        }

        else if (nsin < 0.2 && nsin > 0.0 )
        {
            let f = THREE.MathUtils.clamp(nsin/0.2, 0.2, 1);
            this.sunLight.intensity = f;
            this.sunLight.shadowDarkness = f*0.5;
            this.skybox.material.uniforms.topColor.value.setRGB(0.25*f,0.55*f,1*f);
            this.skybox.material.uniforms.bottomColor.value.setRGB(1*f,1*f,1*f);
        }

        else  // night
        {
            let f = 0.2;
            this.sunLight.intensity = f;
            this.sunLight.shadowDarkness = f*0.5;
            this.skybox.material.uniforms.topColor.value.setRGB(0.05,0.11,0.2);
            this.skybox.material.uniforms.bottomColor.value.setRGB(0.2,0.2,0.2);
        }
    }
}
