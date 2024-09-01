import { useEffect } from 'react';

import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { ShadowMesh } from 'three/addons/objects/ShadowMesh.js';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';

import SceneInit from './lib/SceneInit';

// import * as scene0 from "./lib/scene1"
import { Scene1 } from "./lib/scene1"
import { Scene0 } from './lib/scene0';



function App() {
  useEffect(async () => {
    // ============
    // part 0
    // set up Three.js scene with axis helper
    // ============
    const test = new SceneInit('myThreeJsCanvas');
    test.initialize();
    test.animate();


    let scene1 = new Scene1()
    await scene1.init(test)

    // console.warn(await dos)
    // Dos(document.getElementById("dos"), {
    //   url: "https://cdn.dos.zone/original/2X/9/9ed7eb9c2c441f56656692ed4dc7ab28f58503ce.jsdos",
    // });


    let scene0 = new Scene0()
    await scene0.init(test)
    test.scene.add(scene0.scene)


    // scene0.switch_screen_mat(1)



    const animate = () => {

      // scene1.update()
      // scene1.render_normal()

      scene0.update()
      scene0.render()



      window.requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (

    <div>

      <div id="root-dos" />
      <div id="css-canvas" />
      <div id="webgl"> </div>


    </div>
  );
}

export default App;
