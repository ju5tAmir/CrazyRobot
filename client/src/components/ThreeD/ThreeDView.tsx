import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
// @ts-expect-error sdf
import { OrbitControls, OrbitControls as OrbitControlsImpl } from '@react-three/drei';
import WallE from './WallE';
import { Environment } from '@react-three/drei';


const DebugInfo = () => {

  const { camera,  } = useThree();
// @ts-expect-error lsjkdf
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    // Expose camera and controls to globalThis for debugging
// @ts-expect-error lsjkdf
    globalThis.debugCamera = camera;
// @ts-expect-error lsjkdf
    globalThis.debugControls = controlsRef.current;

    console.log('Camera Position:', camera.position.toArray());
    console.log('OrbitControls Target:', controlsRef.current?.target.toArray());
  }, [camera]);

  return <OrbitControls ref={controlsRef} />;
};

const ThreeDView: React.FC = () => {
  return (
    <>
      <Canvas
        camera={{
          position: [31.60, 13.72, -1],
          fov: 45,
        }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <color attach="background" args={['#d3d3d3']} />
        <Environment preset="sunset"  />
        <Suspense fallback={null}>
          <WallE />
        </Suspense>
        <DebugInfo />
      </Canvas>
    </>
  );
};

export default ThreeDView;


