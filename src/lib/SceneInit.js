import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { CSM } from 'three/examples/jsm/csm/CSM'
import { CSMHelper } from 'three/examples/jsm/csm/CSMHelper'
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';


export default class SceneInit {
  constructor(canvasId) {
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;

  }

  initialize() {
    this.render_mode = 1
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );


    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

    // this.dom_renderer = new CSS3DRenderer();


    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.dom_renderer.setSize(500, 500);
    document.querySelector('#webgl').appendChild(this.renderer.domElement);


    this.clock = new THREE.Clock();

    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.stats = Stats();
    // document.body.appendChild(this.stats.dom);




    // this.renderer.setClearColor(0xffffff, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.outputEncoding = THREE.GammaEncoding
    // renderer.gammaFactor = 2.2;
    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    // this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    // this.renderer.toneMappingExposure = 4 ; 




    window.addEventListener('resize', () => this.onWindowResize(), false);




    this.renderTarget = new THREE.WebGLRenderTarget(800, 600, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });


  }

  animate() {
    window.requestAnimationFrame(this.animate.bind(this));

    this.render();

    if (this.stats)
      this.stats.update();
  }

  render() { }


  onWindowResize() {

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });

    // this.dom_renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
