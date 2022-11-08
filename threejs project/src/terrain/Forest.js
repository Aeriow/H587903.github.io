import * as THREE from "../three.module.js";

export default class Forest extends THREE.Group{

    constructor(scene, tree) {
        super();
        this.scene = scene;
        this.tree = tree;
    }

    generate(){
        let clone = this.tree.clone();
        clone.scale.set(2,2,2);
        clone.position.set(-15,0,-50);
        this.add(clone);
        this.name = 'forest';
    }
}