import * as THREE from "../three.module.js";
import {getHeightmapData} from "../utils.js";
import {Mesh, PlaneGeometry} from "../three.module.js";
import TextureSplattingMaterial from "../TextureSplattingMaterial.js";

export default class Terrain extends Mesh {

    constructor(terrainImage) {
        super();

        //load textures
        let grass = new THREE.TextureLoader().load('images/grass.png');
        let rock = new THREE.TextureLoader().load('images/rock.png');
        let alphaMap = new THREE.TextureLoader().load('images/terrain.png');

        grass.wrapS = THREE.RepeatWrapping;
        grass.wrapT = THREE.RepeatWrapping;
        grass.repeat.multiplyScalar(128 / 8);

        rock.wrapS = THREE.RepeatWrapping;
        rock.wrapT = THREE.RepeatWrapping;
        rock.repeat.multiplyScalar(128 / 8);

        //create materials
        this.material = new TextureSplattingMaterial({
            color: THREE.Color.NAMES.white,
            colorMaps: [grass, rock],
            alphaMaps: [alphaMap]
        });

        //create geometry
        this.geometry= this.terrainGeometry(256, 256, 32, terrainImage);

        this.receiveShadow = true;
        this.castShadow = true;
    }

    terrainGeometry(size, resolution, height, image) {

        let geometry = new PlaneGeometry(size, size, resolution - 1, resolution - 1);
        geometry.rotateX((Math.PI / 180) * -90);

        let data = getHeightmapData(image, resolution);

        for (let i = 0; i < data.length; i++) {
            geometry.attributes.position.setY(i, data[i] * height);
        }
        return geometry;
    }
}