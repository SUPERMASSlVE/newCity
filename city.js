// city.js
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { OrbitControls } from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/controls/OrbitControls.js';
import { TweenMax, Power1 } from 'https://cdnjs.cloudflare.com/ajax/libs/gsap/1.20.3/TweenMax.min.js';

let scene, camera, renderer, controls;
let city, smoke;

const setcolor = 0xF02050;

function init() {
    // Scene, Camera, Renderer
    scene = new THREE.Scene();
    scene.background = new THREE.Color(setcolor);
    scene.fog = new THREE.Fog(setcolor, 10, 16);

    camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 500);
    camera.position.set(0, 2, 14);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    if (window.innerWidth > 800) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 2;

    // City
    city = new THREE.Object3D();
    scene.add(city);

    // Ground
    const pmaterial = new THREE.MeshPhongMaterial({
        color: 0x000000,
        side: THREE.DoubleSide,
        roughness: 10,
        metalness: 0.6,
        opacity: 0.9,
        transparent: true
    });
    const pgeometry = new THREE.PlaneGeometry(60, 60);
    const pelement = new THREE.Mesh(pgeometry, pmaterial);
    pelement.rotation.x = -Math.PI / 2;
    pelement.receiveShadow = true;
    city.add(pelement);

    // Buildings
    createBuildings(100);

    // Smoke
    smoke = new THREE.Object3D();
    city.add(smoke);
    createSmoke(300);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 4);
    scene.add(ambientLight);

    const lightFront = new THREE.SpotLight(0xFFFFFF, 20, 10);
    lightFront.rotation.x = Math.PI / 4;
    lightFront.rotation.z = -Math.PI / 4;
    lightFront.position.set(5, 5, 5);
    lightFront.castShadow = true;
    lightFront.shadow.mapSize.width = 6000;
    lightFront.shadow.mapSize.height = lightFront.shadow.mapSize.width;
    lightFront.penumbra = 0.1;
    city.add(lightFront);

    const lightBack = new THREE.PointLight(0xFFFFFF, 0.5);
    lightBack.position.set(0, 6, 0);
    scene.add(lightBack);

    // Cars
    createCars(60);

    // Resize Listener
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function mathRandom(num = 8) {
    return -Math.random() * num + Math.random() * num;
}

function createBuildings(count) {
    const town = new THREE.Object3D();
    city.add(town);

    let setTintNum = true;
    for (let i = 1; i < count; i++) {
        const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
        const material = new THREE.MeshStandardMaterial({
            color: setTintNum ? 0x000000 : 0x000000,
            wireframe: false,
            shading: THREE.SmoothShading,
            side: THREE.DoubleSide
        });
        setTintNum = !setTintNum;

        const cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
        cube.receiveShadow = true;

        const cubeWidth = 0.9 + mathRandom(0.1);
        cube.scale.set(cubeWidth, 0.1 + Math.abs(mathRandom(8)), cubeWidth);
        cube.position.set(Math.round(mathRandom()), cube.scale.y / 2, Math.round(mathRandom()));

        town.add(cube);
    }
}

function createSmoke(count) {
    const gmaterial = new THREE.MeshToonMaterial({ color: 0xFFFF00, side: THREE.DoubleSide });
    const gparticular = new THREE.CircleGeometry(0.01, 3);

    const particles = new THREE.InstancedMesh(gparticular, gmaterial, count);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
        dummy.position.set(mathRandom(5), mathRandom(5), mathRandom(5));
        dummy.rotation.set(mathRandom(), mathRandom(), mathRandom());
        dummy.updateMatrix();
        particles.setMatrixAt(i, dummy.matrix);
    }

    smoke.add(particles);
}

function createCars(count) {
    const cMat = new THREE.MeshToonMaterial({ color: 0xFFFF00, side: THREE.DoubleSide });
    const cGeo = new THREE.BoxGeometry(1, 0.025, 0.025); 

    const cars = new THREE.InstancedMesh(cGeo, cMat, count);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
        const cAmp = 3;
        const cPos = 20;

        if (i % 2 === 0) {
            dummy.position.set(-cPos, Math.abs(mathRandom(5)), mathRandom(cAmp));
            TweenMax.to(dummy.position, 3, { x: cPos, repeat: -1, yoyo: true, delay: mathRandom(3) });
        } else {
            dummy.position.set(mathRandom(cAmp), Math.abs(mathRandom(5)), -cPos);
            dummy.rotation.y = Math.PI / 2;
            TweenMax.to(dummy.position, 5, { z: cPos, repeat: -1, yoyo: true, delay: mathRandom(3), ease: Power1.easeInOut });
        }

        dummy.updateMatrix();
        cars.setMatrixAt(i, dummy.matrix);
    }

    cars.receiveShadow = true;
    cars.castShadow = true;
    city.add(cars);
}

// Reset View Function
function resetView() {
    controls.reset();
}

function animate() {
    requestAnimationFrame(animate);

    smoke.rotation.y += 0.01;
    smoke.rotation.x += 0.01;

    renderer.render(scene, camera);
}

init();
animate();