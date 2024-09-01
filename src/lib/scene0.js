import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { gsap, ScrollTrigger, Draggable, MotionPathPlugin } from "gsap/all";
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import html2canvas from 'html2canvas';
import { } from 'js-dos/dist/js-dos'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


import { } from 'js-dos/dist/emulators/emulators'


// 0=hover , 1=zoom in ,2=zoom out 
let state = 0





export class Scene0 {
    constructor() { }

    async init(ctx) {

        this.renderer2 = new CSS3DRenderer();
        this.renderer2.domElement.style.position = 'absolute';
        this.renderer2.domElement.style.top = 0;
        this.renderer2.setSize(window.innerWidth, window.innerHeight);
        document.querySelector('#css-canvas').appendChild(this.renderer2.domElement);

        this.camera = new THREE.PerspectiveCamera(
            this.fov,
            window.innerWidth / window.innerHeight,
            1,
            1000
        );

        this.camera.position.z = 40;
        this.camera.position.y = 20;
        this.camera.position.x = 10;
        // this.controls = new OrbitControls(this.camera, ctx.renderer.domElement);


        this.cameraOffset = new THREE.Vector3(10, 20, 24)

        const loader = new GLTFLoader();
        let scene =
            new THREE.Scene()
        this.scene = scene
        this.ctx = ctx
        let pc_model;
        await new Promise((r, j) => {
            loader.load(
                'assets/pc-lowpoly/scene.gltf',
                function (gltf) {
                    pc_model = gltf.scene
                    pc_model.scale.set(0.1, 0.1, 0.1)
                    scene.add(pc_model)

                    pc_model.traverse(function (child) {
                        if ((child).isMesh) {
                            child.castShadow = true
                            child.receiveShadow = true
                        }
                    })

                    r()
                },
            )
        })

        let lamp

        await new Promise((r, j) => {
            loader.load(
                // resource URL
                'assets/ceiling_lamp/scene.gltf',
                function (gltf) {
                    lamp = gltf.scene
                    lamp.scale.set(5, 5, 5)
                    scene.add(lamp)
                    r()
                },

            )
        })




        const ambientLight = new THREE.AmbientLight(0xffffff, 0.0051);
        scene.add(ambientLight);

        RectAreaLightUniformsLib.init();
        const width = 2;
        const height = 2;
        const intensity = 20;
        let x = 0
        let y = 10
        let z = 3
        const rectLight = new THREE.RectAreaLight(0xffffff, intensity, width, height);
        rectLight.position.set(x, y, z);

        rectLight.lookAt(x, y, 20);
        scene.add(rectLight)

        let h = new RectAreaLightHelper(rectLight);;
        h.material.opacity = 0
        scene.add(h);



        const rectLight2 = new THREE.RectAreaLight(0xff0000, 5, 6, 20);
        rectLight2.position.set(0, 20, 0);
        lamp.position.set(0, 9.2, 0)
        rectLight2.rotateX(-Math.PI * 0.5)
        scene.add(rectLight2)
        let h_up = new RectAreaLightHelper(rectLight2);;
        // h.material.opacity = 0
        scene.add(h_up);
        let tl = gsap.timeline()

        tl.to(rectLight2, {
            intensity: 0, duration: 1, onUpdate: () => {

            }, repeat: -1, repeatDelay: 5, ease: "bounce.out"
        });
        tl.play()





        const geometry = new THREE.PlaneGeometry(1, 1);

        const vertex = `
            varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
        `;
        const fragment = `
             varying vec2 vUv;
			uniform sampler2D map;
			// uniform sampler2D tDepth;
			uniform float iTime;
			


            //random hash
            vec4 hash42(vec2 p){
                
                vec4 p4 = fract(vec4(p.xyxy) * vec4(443.8975,397.2973, 491.1871, 470.7827));
                p4 += dot(p4.wzxy, p4+19.19);
                return fract(vec4(p4.x * p4.y, p4.x*p4.z, p4.y*p4.w, p4.x*p4.w));
            }


            float hash( float n ){
                return fract(sin(n)*43758.5453123);
            }

            // 3d noise function (iq's)
            float n( in vec3 x ){
                vec3 p = floor(x);
                vec3 f = fract(x);
                f = f*f*(3.0-2.0*f);
                float n = p.x + p.y*57.0 + 113.0*p.z;
                float res = mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
                                    mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y),
                                mix(mix( hash(n+113.0), hash(n+114.0),f.x),
                                    mix( hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);
                return res;
            }

            //tape noise
            float nn(vec2 p){


                float y = p.y;
                float s = iTime*0.1;
                
                float v = (n( vec3(y*.01 +s, 			1., 1.0) ) + .0)
                        *(n( vec3(y*.011+1000.0+s, 	1., 1.0) ) + .0) 
                        *(n( vec3(y*.51+421.0+s, 	1., 1.0) ) + .0)   
                    ;
                //v*= n( vec3( (fragCoord.xy + vec2(s,0.))*100.,1.0) );
                v*= hash42(   vec2(p.x +iTime*0.1, p.y) ).x +.3 ;

                
                v = pow(v+.3, 1.);
                if(v<.7) v = 0.;  //threshold
                return v;
            }

            float outSeed( in float pixelIndex )
            {
                // Example function, replace this with whatever you want
                return fract(sin(pixelIndex * 1281.0 + pixelIndex * 54234.7 + cos(pixelIndex * 43343.554 + iTime) * sin(iTime/15.0)) * 123.321);
            }

     
			void main() {
            vec2 iResolution = vec2(400.,300.);
                vec2 uv= vUv ;  
                float aspect = 3.0/4.0; 
		
			    // Create a seed value by converting the 2D coordinates into a 1D value
                float pixelIndex = uv.x + uv.y *aspect ;

                // Apply a function to the seed
                // Example function: seed^2
                float outputSeed = outSeed(pixelIndex);

                // Use the outSeed value to create a grayscale color
                vec3 color = vec3(outputSeed, outSeed(outputSeed), outSeed(outSeed(outputSeed)));

                // glitch 
                float linesN = 240.; //fields per seconds
                float one_y = iResolution.y / linesN; //field line
                uv = floor(uv*iResolution.xy/one_y)*one_y;
                float col =  nn(uv);
		

                vec4 diffuse = texture2D( map, vUv );
                    vec3 logo  = diffuse.rgb*diffuse.a;
                    logo.r*=col*0.5;
                    logo.g*=col;
                    logo.b*=col*0.5;


            

                // Output the final color
                gl_FragColor = vec4(color+logo, 1.0);

			
			}
        `

        this.krea_texture = new THREE.TextureLoader().load('assets/krea.png');


        this.static_material = new THREE.ShaderMaterial({

            uniforms: {
                iTime: { value: 1.0 },
                resolution: { value: new THREE.Vector2() },
                map: { value: this.krea_texture }
            },

            vertexShader: vertex,
            fragmentShader: fragment

        });



        this.create_game_mat()


        // const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide });
        const screen = new THREE.Mesh(geometry, this.static_material);
        screen.position.set(x - 0.4, y - 0.26, 3.9)
        screen.scale.set(2.71, 2.13, 1)
        screen.rotateX(-Math.PI * 0.05)
        scene.add(screen);
        this.screen = screen


        // this.rectLightHelper = new THREE.RectAreaLight(rectLight);
        // rectLight.add(this.rectLightHelper);








        this.set_hover_mode()
        this.set_zoom_in()



        this.create_dos_emulator()
        this.create_dos_ui_mat()

        this.create_ui_elements()


        window.run_game = this.run_game.bind(this)

        window.addEventListener('resize', () => this.onWindowResize(), false);
    }



    create_dos_emulator() {
        const img = document.createElement("canvas");
        img.width = 320;
        img.height = 200;

        this.dos_img_el_ctx = img.getContext('2d');
        this.dos_texture = new THREE.CanvasTexture(img);






        this.dos_img_el = document.getElementById("root-dos")
        this.dos_img_el.style.position = 'absolute'
        this.dos_img_el.style.opacity = '0'


        this.game_mat.uniforms.map.value = this.dos_texture
        this.game_mat.name = "game_mat"

    }


    run_game(game_name) {

        console.warn("run_game", game_name)
        if (game_name === "exit") {
            this.stop_game()
            this.zoom_out()
            return
        }


        //start game 
        this.switch_to_game()


        this.stop_game()


        let url = `/assets/games/${game_name}.jsdos`
        this.dos_emu = Dos(this.dos_img_el, {
            url: url,
            onEvent: (event, ci) => {

                // now ci s ready
                if (event === "ci-ready") {
                    const rgba = new Uint8ClampedArray(320 * 200 * 4);
                    let events = ci.events();
                    events.onFrame((rgb, _rgba) => {
                        for (let next = 0; next < 320 * 200; ++next) {
                            rgba[next * 4 + 0] = rgb[next * 3 + 0];
                            rgba[next * 4 + 1] = rgb[next * 3 + 1];
                            rgba[next * 4 + 2] = rgb[next * 3 + 2];
                            rgba[next * 4 + 3] = 255;
                        }

                        this.dos_img_el_ctx.putImageData(new ImageData(rgba, 320, 200), 0, 0);
                        this.dos_texture.needsUpdate = true;
                    })

                }
            }
        }
        );
        this.dos_emu.setAutoStart(true)


        this.in_game = true

    }

    stop_game() {
        if (this.dos_emu) {
            this.dos_emu.stop()
            this.dos_emu = null
            this.in_game = false
        }

    }
    create_ui_elements() {



        this.ui_elements_group = new THREE.Object3D()



        this.scene.add(this.ui_elements_group)

        this.background = this.makeElementObject('div', 900, 600)
        // let dos_ui = document.getElementById("dos-ui")
        // console.warn
        //     (" dos_ui.innerHTML", dos_ui.outerHTML)
        // this.background.css3dObject.element.innerHtml = "<div>hello</div>" //dos_ui.outerHTML
        // console.warn("  this.background.css3dObject.element.innerHtml ", this.background.css3dObject.element.innerHtml)
        // this.background.css3dObject.element.setAttribute('contenteditable', '')

        this.background.css3dObject.element.style.opacity = "1"
        // this.background.css3dObject.element.style.padding = '10px'
        const color1 = '#7bb38d'
        const color2 = '#71a381'
        this.background.css3dObject.element.style.background = `repeating-linear-gradient(
        45deg,
        ${color1},
        ${color1} 10px,
        ${color2} 10px,
        ${color2} 20px
    )`
        this.background.scale.set(0.027, 0.019, 0.02)
        this.background.scale.x *= 0.11
        this.background.scale.y *= 0.18

        this.background.position.x = -0.4
        this.background.position.y = 9.8
        this.background.position.z = 4.0
        this.background.rotateX(-Math.PI * 0.05)


        this.ui_elements_group.add(this.background);
        this.ui_elements_group.visible = false


        window.addEventListener("keyup", (evnt) => {
            if (evnt.key === "Escape" && this.in_game) {
                this.stop_game()
                this.switch_to_dos_ui()
            }
        })

    }


    create_game_mat() {




        const vertex = `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
        const fragment = `
         varying vec2 vUv;
        uniform sampler2D map;
        // uniform sampler2D tDepth;
        uniform float iTime;
       
        // change these values to 0.0 to turn off individual effects
        float vertJerkOpt = 1.0;
        float vertMovementOpt = 1.0;
        float bottomStaticOpt = 0.0;
        float scalinesOpt = 1.0;
        float rgbOffsetOpt = 0.0;
        float horzFuzzOpt = 1.0;

        // Noise generation functions borrowed from: 
        // https://github.com/ashima/webgl-noise/blob/master/src/noise2D.glsl

        vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec2 mod289(vec2 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec3 permute(vec3 x) {
        return mod289(((x*34.0)+1.0)*x);
        }

        float snoise(vec2 v)
        {
        const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
        // First corner
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);

        // Other corners
        vec2 i1;
        //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
        //i1.y = 1.0 - i1.x;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        // x0 = x0 - 0.0 + 0.0 * C.xx ;
        // x1 = x0 - i1 + 1.0 * C.xx ;
        // x2 = x0 - 1.0 + 2.0 * C.xx ;
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;

        // Permutations
        i = mod289(i); // Avoid truncation effects in permutation
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));

        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;

        // Gradients: 41 points uniformly over a line, mapped onto a diamond.
        // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;

        // Normalise gradients implicitly by scaling m
        // Approximation of: m *= inversesqrt( a0*a0 + h*h );
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

        // Compute final noise value at P
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
        }

        float staticV(vec2 uv) {
        float staticHeight = snoise(vec2(9.0,iTime*1.2+3.0))*0.3+5.0;
        float staticAmount = snoise(vec2(1.0,iTime*1.2-6.0))*0.1+0.3;
        float staticStrength = snoise(vec2(-9.75,iTime*0.6-3.0))*2.0+2.0;
        return (1.0-step(snoise(vec2(5.0*pow(iTime,2.0)+pow(uv.x*7.0,1.2),pow((mod(iTime,100.0)+100.0)*uv.y*0.3+3.0,staticHeight))),staticAmount))*staticStrength;
        }

        
        void main() {
        vec2 iResolution = vec2(400.,300.);
            vec2 uv= vUv ;  
            float aspect = 3.0/4.0; 
    
       
            vec4 diffuse = texture2D( map, vUv );
            vec3 color  = diffuse.rgb*diffuse.a;


            //  // Sample the original scene color
            // vec4 originalColor = texture(map, uv / iResolution.xy);

            // // Threshold to isolate bright parts
            // float threshold = 0.8;
            // vec3 brightParts = step(threshold, originalColor.rgb);

            // // Blur the bright parts
            // vec3 blurredBrightParts = vec3(0.0);
            // float blurSize = 1.0;
            // for(float i = -4.0; i <= 4.0; i += 0.5) {
            //     for(float j = -4.0; j <= 4.0; j += 0.5) {
            //         vec2 offset = vec2(i, j) * blurSize;
            //         blurredBrightParts += texture(map, (uv + offset) / iResolution.xy).rgb;
            //     }
            // }
            // blurredBrightParts /= 200.0;

            	float jerkOffset = (1.0-step(snoise(vec2(iTime*1.3,5.0)),0.8))*0.05;
	
            float fuzzOffset = snoise(vec2(iTime*15.0,uv.y*80.0))*0.003;
            float largeFuzzOffset = snoise(vec2(iTime*1.0,uv.y*25.0))*0.004;
            
            float vertMovementOn = (1.0-step(snoise(vec2(iTime*0.2,8.0)),0.4))*vertMovementOpt;
            float vertJerk = (1.0-step(snoise(vec2(iTime*1.5,5.0)),0.6))*vertJerkOpt;
            float vertJerk2 = (1.0-step(snoise(vec2(iTime*5.5,5.0)),0.2))*vertJerkOpt;
            float yOffset = abs(sin(iTime)*4.0)*vertMovementOn+vertJerk*vertJerk2*0.3;
            float y = mod(uv.y+yOffset,1.0);
            
            
            float xOffset = (fuzzOffset + largeFuzzOffset) * horzFuzzOpt;
            
            float staticVal = 0.0;
        
            for (float y = -1.0; y <= 1.0; y += 1.0) {
                float maxDist = 5.0/200.0;
                float dist = y/200.0;
                staticVal += staticV(vec2(uv.x,uv.y+dist))*(maxDist-abs(dist))*1.5;
            }
                
            staticVal *= bottomStaticOpt;
            
            float red 	=   texture(map	, 	vec2(uv.x + xOffset -0.01*rgbOffsetOpt,y)).r+staticVal;
            float green = 	texture(	map, 	vec2(uv.x + xOffset,	  y)).g+staticVal;
            float blue 	=	texture(	map, 	vec2(uv.x + xOffset +0.01*rgbOffsetOpt,y)).b+staticVal;
            
            vec3 color_crt = vec3(red,green,blue);
            float scanline = sin(uv.y*800.0)*0.04*scalinesOpt;
            color_crt -= scanline;
     
            gl_FragColor = vec4(color_crt+0.05, 1.0);

        
        }
    `
        this.game_mat = new THREE.ShaderMaterial({

            uniforms: {
                iTime: { value: 1.0 },
                resolution: { value: new THREE.Vector2() },
                map: { value: this.ctx.renderTarget.texture }
            },

            vertexShader: vertex,
            fragmentShader: fragment

        });
    }



    create_dos_ui_mat() {




        const vertex = `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
        const fragment = `
         varying vec2 vUv;
        uniform sampler2D map;
        // uniform sampler2D tDepth;
        uniform float iTime;
       
        // change these values to 0.0 to turn off individual effects
        float vertJerkOpt = 1.0;
        float vertMovementOpt = 1.0;
        float bottomStaticOpt = 1.0;
        float scalinesOpt = 1.0;
        float rgbOffsetOpt = 0.0;
        float horzFuzzOpt = 1.0;

        // Noise generation functions borrowed from: 
        // https://github.com/ashima/webgl-noise/blob/master/src/noise2D.glsl

        vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec2 mod289(vec2 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec3 permute(vec3 x) {
        return mod289(((x*34.0)+1.0)*x);
        }

        float snoise(vec2 v)
        {
        const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
        // First corner
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);

        // Other corners
        vec2 i1;
        //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
        //i1.y = 1.0 - i1.x;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        // x0 = x0 - 0.0 + 0.0 * C.xx ;
        // x1 = x0 - i1 + 1.0 * C.xx ;
        // x2 = x0 - 1.0 + 2.0 * C.xx ;
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;

        // Permutations
        i = mod289(i); // Avoid truncation effects in permutation
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));

        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;

        // Gradients: 41 points uniformly over a line, mapped onto a diamond.
        // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;

        // Normalise gradients implicitly by scaling m
        // Approximation of: m *= inversesqrt( a0*a0 + h*h );
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

        // Compute final noise value at P
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
        }

        float staticV(vec2 uv) {
        float staticHeight = snoise(vec2(9.0,iTime*1.2+3.0))*0.3+5.0;
        float staticAmount = snoise(vec2(1.0,iTime*1.2-6.0))*0.1+0.3;
        float staticStrength = snoise(vec2(-9.75,iTime*0.6-3.0))*2.0+2.0;
        return (1.0-step(snoise(vec2(5.0*pow(iTime,2.0)+pow(uv.x*7.0,1.2),pow((mod(iTime,100.0)+100.0)*uv.y*0.3+3.0,staticHeight))),staticAmount))*staticStrength;
        }

        
        void main() {
        vec2 iResolution = vec2(400.,300.);
            vec2 uv= vUv ;  
            float aspect = 3.0/4.0; 
    
       
            vec4 diffuse = texture2D( map, vUv );
            vec3 color  = diffuse.rgb*diffuse.a;


            //  // Sample the original scene color
            // vec4 originalColor = texture(map, uv / iResolution.xy);

            // // Threshold to isolate bright parts
            // float threshold = 0.8;
            // vec3 brightParts = step(threshold, originalColor.rgb);

            // // Blur the bright parts
            // vec3 blurredBrightParts = vec3(0.0);
            // float blurSize = 1.0;
            // for(float i = -4.0; i <= 4.0; i += 0.5) {
            //     for(float j = -4.0; j <= 4.0; j += 0.5) {
            //         vec2 offset = vec2(i, j) * blurSize;
            //         blurredBrightParts += texture(map, (uv + offset) / iResolution.xy).rgb;
            //     }
            // }
            // blurredBrightParts /= 200.0;

            	float jerkOffset = (1.0-step(snoise(vec2(iTime*1.3,5.0)),0.8))*0.05;
	
            float fuzzOffset = snoise(vec2(iTime*15.0,uv.y*80.0))*0.003;
            float largeFuzzOffset = snoise(vec2(iTime*1.0,uv.y*25.0))*0.004;
            
            float vertMovementOn = (1.0-step(snoise(vec2(iTime*0.2,8.0)),0.4))*vertMovementOpt;
            float vertJerk = (1.0-step(snoise(vec2(iTime*1.5,5.0)),0.6))*vertJerkOpt;
            float vertJerk2 = (1.0-step(snoise(vec2(iTime*5.5,5.0)),0.2))*vertJerkOpt;
            float yOffset = abs(sin(iTime)*4.0)*vertMovementOn+vertJerk*vertJerk2*0.3;
            float y = mod(uv.y+yOffset,1.0);
            
            
            float xOffset = (fuzzOffset + largeFuzzOffset) * horzFuzzOpt;
            
            float staticVal = 0.0;
        
            for (float y = -1.0; y <= 1.0; y += 1.0) {
                float maxDist = 5.0/200.0;
                float dist = y/200.0;
                staticVal += staticV(vec2(uv.x,uv.y+dist))*(maxDist-abs(dist))*1.5;
            }
                
            staticVal *= bottomStaticOpt;
            
            float red 	=   texture(map	, 	vec2(uv.x + xOffset -0.01*rgbOffsetOpt,y)).r+staticVal;
            float green = 	texture(	map, 	vec2(uv.x + xOffset,	  y)).g+staticVal;
            float blue 	=	texture(	map, 	vec2(uv.x + xOffset +0.01*rgbOffsetOpt,y)).b+staticVal;
            
            vec3 color_crt = vec3(red,green,blue);
            float scanline = sin(uv.y*800.0)*0.04*scalinesOpt;
            color_crt -= scanline;
     
            gl_FragColor = vec4(color_crt+0.05, 0.1);

        
        }
    `
        this.dos_ui_mat = new THREE.ShaderMaterial({

            uniforms: {
                iTime: { value: 1.0 },
                resolution: { value: new THREE.Vector2() },
                map: { value: this.ctx.renderTarget.texture }
            },

            vertexShader: vertex,
            fragmentShader: fragment

        });
    }


    switch_to_dos_ui() {
        this.screen.visible = false
        this.ui_elements_group.visible = true
        document.getElementById("webgl").style.pointerEvents = "none"


    }

    switch_to_static() {
        this.screen.visible = true
        this.ui_elements_group.visible = false
        document.getElementById("webgl").style.pointerEvents = "auto"

        // //end game 
        this.screen.material = this.static_material
        this.stop_game()


    }

    switch_to_game() {
        this.screen.visible = true
        this.ui_elements_group.visible = false
        document.getElementById("webgl").style.pointerEvents = "auto"
        window.focus();

        this.screen.material = this.game_mat


    }

    switch_screen_mat(mod) {
        if (mod == 0) {
            this.screen.material = this.game_mat;
        } else {
            this.screen.material = this.game_mat;
        }
    }



    makeElementObject(type, width, height) {
        const obj = new THREE.Object3D

        const iframe = document.createElement('iframe');

        iframe.style.border = '0px';
        iframe.style.width = width + 'px';
        iframe.style.height = height + 'px';
        iframe.style.opacity = 0.999;
        iframe.style.boxSizing = 'border-box'
        iframe.src = "http://localhost:3000/iframe.html"

        this.ui_iframe = iframe
        // iframe.style.transform = "scale(0.15)"
        // div.appendChild( iframe );

        // const element = document.createElement(type);
        // element.style.width = width + 'px';
        // element.style.height = height + 'px';
        // element.style.opacity = 0.999;
        // element.style.boxSizing = 'border-box'

        let css3dObject = new CSS3DObject(iframe);
        obj.css3dObject = css3dObject

        obj.add(css3dObject)

        // make an invisible plane for the DOM element to chop
        // clip a WebGL geometry with it.


        // var material = new THREE.MeshBasicMaterial({
        //     opacity: 0.1,
        //     color: new THREE.Color(0xff0000),
        //     blending: THREE.NoBlending,
        //     // side	: THREE.DoubleSide,
        // });
        var geometry = new THREE.BoxGeometry(width, height, 1);
        var mesh = new THREE.Mesh(geometry, this.dos_ui_mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        obj.lightShadowMesh = mesh
        obj.add(mesh);

        return obj
    }





    set_hover_mode() {
        let tl = gsap.timeline()
        let current_cam_pos = { x: this.cameraOffset.x }
        let to_x = -this.cameraOffset.x
        tl.to(current_cam_pos, {
            x: to_x, duration: 20, onUpdate: () => {
                this.camera.position.x = current_cam_pos.x
            }, yoyo: true, repeat: -1, ease: "power1.in"
        });
        tl.play()

        this.hover_tl = tl;
    }

    set_zoom_in() {
        let tl = gsap.timeline()
        let current_cam_pos = { x: this.camera.position.x, y: this.camera.position.y, z: this.camera.position.z }
        let to_pos = { x: this.screen.position.x, y: this.screen.position.y, z: this.screen.position.z + 4 }
        tl.to(current_cam_pos, {
            x: to_pos.x, y: to_pos.y, z: to_pos.z, duration: 2, onUpdate: () => {
                this.camera.position.x = current_cam_pos.x
                this.camera.position.y = current_cam_pos.y
                this.camera.position.z = current_cam_pos.z
            }, ease: "power2.out", onComplete: () => {

                setTimeout(() => { this.switch_to_dos_ui() }, 2 * 1000)

            }, onReverseComplete: () => {

                this.switch_to_static()


            }
        });
        tl.pause()



        this.zoom_in_tl = tl;
    }




    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer2.setSize(window.innerWidth, window.innerHeight);

        // this.renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
        //     minFilter: THREE.LinearFilter,
        //     magFilter: THREE.LinearFilter,
        // });

    }


    update() {

        this.camera.lookAt(this.screen.position)
        // update game screen and ui menu screen 
        if (this.screen.material.name == "game_mat") {
            this.screen.material.uniforms.iTime.value += 0.001
        }
        else {
            //update static screen 
            this.screen.material.uniforms.iTime.value += 1
        }

        this.dos_ui_mat.uniforms.iTime.value += 0.001

        this.screen.material.needsUpdate = true

        if (clicked) {
            raycaster.setFromCamera(pointer, this.camera);
            const intersects = raycaster.intersectObjects(this.scene.children);
            for (let i = 0; i < intersects.length; i++) {
                if (intersects[i].object.name === "Computer_monitor001_ComputerDesk_0") {

                    if (state === 0) {
                        console.warn("zoom_in_tl")
                        this.hover_tl.pause()
                        this.zoom_in_tl.play()
                        state = 1


                    }

                    break
                } else if (state == 1 && intersects[i].object.name !== "") {

                    this.zoom_out()

                    break
                }

            }

            clicked = false

        }


    }


    zoom_out() {
        state = 0
        this.zoom_in_tl.reverse()
        console.warn("zoom_out_tl")

        setTimeout(() => {
            if (state == 0) {
                this.hover_tl.play()
                console.log("hovering ")
            }

        }, 5 * 1000)
        this.zoom_in_tl
    }




    render() {
        this.ctx.renderer.render(this.scene, this.camera);
        this.renderer2.render(this.scene, this.camera);
    }

}




const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let clicked = false
function onPointerMove(event) {

    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    clicked = true




}

window.addEventListener('click', onPointerMove);

