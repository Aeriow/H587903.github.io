import * as THREE from "../three.module.js";

export default class Forest extends THREE.Group {

    coordinates;
    tree;

    constructor(tree, terrain) {
        super();
        this.name = 'forest';

        this.tree = tree;
        this.terrain = terrain;
    }

    generate(amount, xWidth, yWidth, minDist){
        this.coordinates = this.getRandomPoints(amount, xWidth, yWidth, minDist);
        this.coordinates.forEach((entry) => {
            let from = new THREE.Vector3(entry.x, 50, entry.y);
            let height = this.findIntersectionHeight(from, this.terrain)
            let scale = this.randomScale(0.5, 1.5);

            if(height < 0.5 || height >= 20) {
                return //equivalent to continue in a conventional loop
            };
            this.placeTree(
                {x: entry.x, y: height, z: entry.y},
                {x: scale, y: scale, z: scale}
            );
        });
    }

    getRandomPoints(amount, xWidth, yWidth, minDist){
        let coordinates = [];
        let minDist_2 = Math.pow(minDist, 2)
        let i = 1;

        while(coordinates.length < amount && i < 1e6){
            let newX = getRandomInt(-xWidth/2, xWidth-xWidth/2);
            let newY = getRandomInt(-yWidth/2,yWidth-yWidth/2);

            if(coordinates.length == 0){
                pushCoordinate(newX, newY, coordinates);
                continue;
            }

            for (let j = 0; j < coordinates.length; j++) {
                //check if coordinate is valid
                if(Math.pow(coordinates[j].x - newX, 2) + Math.pow(coordinates[j].y - newY, 2) <= minDist_2){
                    break;
                }

                //coordinate is valid, push
                pushCoordinate(newX, newY, coordinates);
                break;
            }
            i++;
        }
        return coordinates;
    }

    findIntersectionHeight(from){
        //this.drawIntersectHelperLine(from);
        let raycaster = new THREE.Raycaster(new THREE.Vector3(from.x, from.y, from.z), new THREE.Vector3(0, -1, 0));
        let intersects = raycaster.intersectObject(this.terrain);

        if(intersects.length > 0){
            return intersects[0].point.y;
        }
        else{
            return from.y;
        }
    }

    placeTree(pos, scale){
        let tree = this.tree.clone();
        tree.position.set(pos.x, pos.y, pos.z);
        tree.scale.set(scale.x, scale.y, scale.z);
        tree.rotateY(Math.random()*Math.PI*2);
        this.add(tree);
    }

    randomScale(min, max){
        return (Math.random() * (max - min) + min).toFixed(2);
    }

    drawIntersectHelperLine(from){
        let points = [];
        points.push(new THREE.Vector3(from.x, from.y + 15, from.z));
        points.push(new THREE.Vector3(from.x, 0, from.z));
        let geometry = new THREE.BufferGeometry().setFromPoints(points);
        let testLineMaterial = new THREE.LineBasicMaterial({ color: 0xFF0000 });
        let line = new THREE.Line(geometry, testLineMaterial);
        this.add(line);
    }
}

function pushCoordinate(xVal, yVal, array) {
    array.push({x: xVal, y: yVal});
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}