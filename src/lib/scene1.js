import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';


import { ShadowMesh } from 'three/addons/objects/ShadowMesh.js';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';

import SceneInit from './SceneInit';
import { CSM } from 'three/examples/jsm/csm/CSM';
import { threeToCannon, ShapeType } from 'three-to-cannon';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


export class Scene1 {
    constructor() {


    }

    async init(ctx) {

        this.camera = new THREE.PerspectiveCamera(
            this.fov,
            window.innerWidth / window.innerHeight,
            1,
            100
        );


        this.cameraOffset = new THREE.Vector3(10, 20, 24)
        this.camera.position.z = 40;
        this.camera.position.y = 20;
        this.camera.position.x = 10;


        this.controls = new OrbitControls(this.camera, ctx.renderer.domElement);

        this.scene = new THREE.Scene();
        this.ctx = ctx
        this.physicsWorld = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.82, 0),
        });

        // create a ground body with a static plane
        const groundBody = new CANNON.Body({
            type: CANNON.Body.STATIC,
            // infinte geometric plane
            shape: new CANNON.Plane(),
        });
        // rotate ground body by 90 degrees
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        // groundBody.quaternion.setFromEuler(-Math.PI / 2, Math.PI / 24, 0);
        this.physicsWorld.addBody(groundBody);

        // add a green wireframe to each object and visualize the physics world
        this.cannonDebugger = new CannonDebugger(this.scene, this.physicsWorld);




        const geometry = new THREE.PlaneGeometry(100000, 100000);
        const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
        //  new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(geometry, material);
        // plane.position.y -= 0.2
        plane.name = "ground mesh"
        plane.receiveShadow = true
        plane.rotateX(-Math.PI / 2)
        // plane.position.y = - 10

        this.scene.add(plane)

        const loader = new GLTFLoader();
        const rgbELoader = new RGBELoader();

        // Optional: Provide a DRACOLoader instance to decode compressed mesh data
        // const dracoLoader = new DRACOLoader();
        // dracoLoader.setDecoderPath('/examples/jsm/libs/draco/');
        // loader.setDRACOLoader(dracoLoader);

        let scene = this.scene
        let physicsWorld = this.physicsWorld

        let car_model;
        await new Promise((r, j) => {
            rgbELoader.load(
                // resource URL
                'assets/overcast_soil_puresky_4k.hdr',
                // called when the resource is loaded
                function (hdr) {
                    hdr.mapping = THREE.EquirectangularReflectionMapping
                    scene.environment = hdr
                    r()
                },
            )
        })
        await new Promise((r, j) => {
            loader.load(
                // resource URL
                'assets/tesla_cybertruck_low-poly/scene.gltf',
                // called when the resource is loaded
                function (gltf) {
                    car_model = gltf.scene
                    car_model.remove(car_model.getObjectByName("Camera"))
                    car_model.remove(car_model.getObjectByName("Light"))
                    scene.add(car_model)




                    r()
                },
                // called while loading is progressing

            )
        })

        await new Promise((r, j) => {
            loader.load(
                // resource URL
                'assets/low_poly_used_bike_ramp/scene.gltf',
                // called when the resource is loaded
                function (gltf) {
                    let track = gltf.scene
                    let pos = new THREE.Vector3(5, 0, 0)
                    let scale = new THREE.Vector3(5, 5, 5)
                    track.scale.set(scale.x, scale.y, scale.z)
                    track.position.set(pos.x, pos.y, pos.z)
                    scene.add(track)

                    // left
                    {
                        const planeShape = new CANNON.Box(new CANNON.Vec3(3, 0.5, 0.1))
                        const planeBody = new CANNON.Body({ mass: 0, shape: planeShape })
                        planeBody.position.y += 0.3
                        planeBody.position.x += 6.8
                        planeBody.position.z += 1.5
                        planeBody.quaternion.setFromEuler(0, -Math.PI / 2, 0) // make it face up
                        // planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
                        physicsWorld.addBody(planeBody)
                    }

                    //right 
                    {
                        const planeShape = new CANNON.Box(new CANNON.Vec3(3, 0.5, 0.1))
                        const planeBody = new CANNON.Body({ mass: 0, shape: planeShape })
                        planeBody.position.y += 0.3
                        planeBody.position.x += 3.3
                        planeBody.position.z += 1.5
                        planeBody.quaternion.setFromEuler(0, -Math.PI / 2, 0) // make it face up
                        // planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
                        physicsWorld.addBody(planeBody)

                    }






                    {
                        const planeShape = new CANNON.Box(new CANNON.Vec3(1.5, 4, 0.1))
                        const planeBody = new CANNON.Body({ mass: 0, shape: planeShape })
                        planeBody.position.y += 1.3
                        planeBody.position.x += 5
                        planeBody.position.z += 0
                        // planeBody.quaternion.setFromEuler(0, -Math.PI / 2, 0) // make it face up
                        planeBody.quaternion.setFromEuler(-Math.PI / 2 - Math.PI * 0.15, 0, 0)
                        physicsWorld.addBody(planeBody)
                    }




                    // // Add the ground
                    // const sizeX = 64
                    // const sizeZ = sizeX
                    // const matrix = []
                    // for (let i = 0; i < sizeX; i++) {
                    //     matrix.push([])
                    //     for (let j = 0; j < sizeZ; j++) {
                    //         if (i === 0 || i === sizeX - 1 || j === 0 || j === sizeZ - 1) {
                    //             const height = 6
                    //             matrix[i].push(height)
                    //             continue
                    //         }

                    //         const height = Math.sin((i / sizeX) * Math.PI * 7) * Math.sin((j / sizeZ) * Math.PI * 7) * 6 + 6
                    //         matrix[i].push(height)
                    //     }
                    // }


                    // const heightfieldShape = new CANNON.Heightfield(matrix, {
                    //     elementSize: 300 / sizeX,
                    // })
                    // const heightfieldBody = new CANNON.Body({ mass: 0 })
                    // heightfieldBody.addShape(heightfieldShape)
                    // // heightfieldBody.position.set(
                    // //     (-(sizeX - 1) * heightfieldShape.elementSize) / 2,
                    // //     -15,
                    // //     ((sizeZ - 1) * heightfieldShape.elementSize) / 2
                    // // )
                    // heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
                    // physicsWorld.addBody(heightfieldBody)
                    // console.warn("what ")


                    r()
                },
                // called while loading is progressing

            )
        })






        this.car_body_mesh = this.scene.getObjectByName("Main_Body")

        this.car_body_mesh.children.forEach(x => {
            x.castShadow = true
        })


        this.wheel_left_front_mesh = this.scene.getObjectByName("Wheel_Left_Front")
        // wheel_left_front_mesh.children.forEach(x => {
        //   x.castShadow = true
        // })


        this.wheel_left_back_mesh = this.scene.getObjectByName("Wheel_Left_Back")
        // wheel_left_front_mesh.children.forEach(x => {
        //   x.castShadow = true
        // })

        this.wheel_right_front_mesh = this.scene.getObjectByName("Wheel_Right_Front")
        // wheel_right_front_mesh.children.forEach(x => {
        //   x.castShadow = true
        // })

        this.wheel_right_back_mesh = this.scene.getObjectByName("Wheel_Right_Back")
        // wheel_right_back_mesh.children.forEach(x => {
        //   x.castShadow = true
        // })








        this.carBody = new CANNON.Body({
            mass: 30,
            position: new CANNON.Vec3(0, 6, 0),
            shape: new CANNON.Box(new CANNON.Vec3(2.5, 0.5, 1)),
        });

        const vehicle = new CANNON.RigidVehicle({
            chassisBody: this.carBody,
        });





        // ============
        // add wheels to the vehicle
        // ============
        const mass = 1;
        const mass_bod = 5;
        const axisWidth = 2.;
        const wheelShape = new CANNON.Sphere(0.5);
        const wheelMaterial = new CANNON.Material('wheel');
        const down = new CANNON.Vec3(0, -1, 0);
        const angularDamping = .9

        const wheelBody1 = new CANNON.Body({ mass: mass_bod, material: wheelMaterial });
        wheelBody1.addShape(wheelShape);
        wheelBody1.angularDamping = angularDamping;
        vehicle.addWheel({
            body: wheelBody1,
            position: new CANNON.Vec3(-1.9, -0.4, axisWidth / 2),
            axis: new CANNON.Vec3(0, 0, 1),
            direction: down,
        });
        this.wheelBody1 = wheelBody1


        const wheelBody2 = new CANNON.Body({ mass, material: wheelMaterial });
        wheelBody2.addShape(wheelShape);
        wheelBody2.angularDamping = angularDamping;
        vehicle.addWheel({
            body: wheelBody2,
            position: new CANNON.Vec3(-1.9, -0.4, -axisWidth / 2 + 0.3),
            axis: new CANNON.Vec3(0, 0, 1),
            direction: down,
        });

        this.wheelBody2 = wheelBody2


        const wheelBody3 = new CANNON.Body({ mass, material: wheelMaterial });
        wheelBody3.addShape(wheelShape);
        wheelBody3.angularDamping = angularDamping;
        vehicle.addWheel({
            body: wheelBody3,
            position: new CANNON.Vec3(1.35, -0.4, axisWidth / 2),
            axis: new CANNON.Vec3(0, 0, 1),
            direction: down,
        });
        this.wheelBody3 = wheelBody3

        const wheelBody4 = new CANNON.Body({ mass, material: wheelMaterial });
        wheelBody4.addShape(wheelShape);
        wheelBody4.angularDamping = angularDamping;
        vehicle.addWheel({
            body: wheelBody4,
            position: new CANNON.Vec3(1.35, -.4, -axisWidth / 2 + 0.3),
            axis: new CANNON.Vec3(0, 0, 1),
            direction: down,
        });

        this.wheelBody4 = wheelBody4

        vehicle.addToWorld(this.physicsWorld);


        // ============

        // move car based on user input
        // ============
        document.addEventListener('keydown', (event) => {
            const maxSteerVal = Math.PI / 8;
            const maxForce = 80;

            switch (event.key) {
                case 'w':
                case 'ArrowUp':
                    vehicle.setWheelForce(maxForce, 0);
                    vehicle.setWheelForce(maxForce, 1);
                    break;

                case 's':
                case 'ArrowDown':
                    vehicle.setWheelForce(-maxForce, 0);
                    vehicle.setWheelForce(-maxForce, 1);
                    break;

                case 'a':
                case 'ArrowLeft':
                    vehicle.setSteeringValue(maxSteerVal, 0);
                    vehicle.setSteeringValue(maxSteerVal, 1);
                    break;

                case 'd':
                case 'ArrowRight':
                    vehicle.setSteeringValue(-maxSteerVal, 0);
                    vehicle.setSteeringValue(-maxSteerVal, 1);
                    break;
            }
        });

        // reset car force to zero when key is released
        document.addEventListener('keyup', (event) => {
            switch (event.key) {
                case 'w':
                case 'ArrowUp':
                    vehicle.setWheelForce(0, 0);
                    vehicle.setWheelForce(0, 1);
                    break;

                case 's':
                case 'ArrowDown':
                    vehicle.setWheelForce(0, 0);
                    vehicle.setWheelForce(0, 1);
                    break;

                case 'a':
                case 'ArrowLeft':
                    vehicle.setSteeringValue(0, 0);
                    vehicle.setSteeringValue(0, 1);
                    break;

                case 'd':
                case 'ArrowRight':
                    vehicle.setSteeringValue(0, 0);
                    vehicle.setSteeringValue(0, 1);
                    break;
            }
        });








        // ambient light which is for the whole scene
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
        this.scene.add(this.ambientLight);



        this.csm = new CSM({
            fade: true,
            far: this.ctx.camera.far,
            cascades: 2,
            shadowMapSize: 4096,
            lightDirection: new THREE.Vector3(-0.6, -1, 0.7),
            camera: this.ctx.camera,
            parent: this.scene,
            lightIntensity: 0.5,
            shadowBias: -0.0001
        })



        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    set_transform = (mesh, phy_body, rot) => {
        let s = this.car_body_mesh.scale
        mesh.position.set(phy_body.position.x * s.x, phy_body.position.y * s.y, phy_body.position.z * s.z)

        // mesh.position.copy(phy_body.position)



        mesh.quaternion.copy(phy_body.quaternion)
        if (rot) {
            mesh.rotateX(-Math.PI / 2)
            mesh.rotateZ(-Math.PI / 2)
        }

        // console.log(" mesh.position", mesh.position)
        // console.log("phy_body.position", phy_body.position)
    }


    update() {
        // if (carBody.angularVelocity.y < -0.01) {
        this.carBody.angularVelocity.y = 0
        this.carBody.angularVelocity.x = 0
        this.carBody.angularVelocity.z = 0
        // }




        this.physicsWorld.fixedStep();
        // this.cannonDebugger.update();

        this.set_transform(this.car_body_mesh, this.carBody, true)
        this.set_transform(this.wheel_left_front_mesh, this.wheelBody1)
        this.set_transform(this.wheel_right_front_mesh, this.wheelBody2)
        this.set_transform(this.wheel_right_back_mesh, this.wheelBody4)
        this.set_transform(this.wheel_left_back_mesh, this.wheelBody3)

        let car_pos = this.car_body_mesh.getWorldPosition(new THREE.Vector3())
        let cam_pos = car_pos.add(this.cameraOffset)

        // this.camera.lookAt(this.car_body_mesh.getWorldPosition(new THREE.Vector3()))

        // this.camera.position.copy(cam_pos)
        // this.camera.updateMatrixWorld()


        this.csm.update()

    }




    render() {

        this.ctx.renderer.setRenderTarget(this.ctx.renderTarget);
        this.ctx.renderer.clear();
        this.ctx.renderer.render(this.scene, this.camera);

        this.ctx.renderer.setRenderTarget(null);
        this.ctx.renderer.clear();
    }

    render_normal() {


        this.ctx.renderer.render(this.scene, this.camera);

    }
}





