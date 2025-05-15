/*
 * Wall-E 3D Model Author: https://sketchfab.com/3d-models/wall-e-1095bf6b98514b368cf7f450297f6e54
 *
 * I Just made some adjustments for right hand and joint the fingers.
 */

import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { Group } from 'three';


const WallE: React.FC = () => {
  const group = useRef<Group>(null);
   const { scene } = useGLTF('/models/wall-e-updated.glb');

  const { eyeL, eyeR, handL, handR, neck, head } = useControls({
    eyeL: { value: 0, min: -0.30, max: 0.20, step: 0.01 },
    eyeR: { value: 0, min: -0.20, max: 0.30, step: -0.01 },
    handL: { value: -1.6, min: -1.6, max: -0.6, step: 0.01 },
    handR: { value: 0.12, min: 0.12, max: 1.0, step: 0.01 },
    neck: { value: 0.12, min: 0.12, max: 0.60, step: 0.01 },
    head: { value: 0, min: -0.60, max: 0.60, step: 0.01 },
  });

  useFrame(() => {
    if (group.current) {
      const leye = group.current.getObjectByName('Object_8');
      const reye = group.current.getObjectByName('Object_6');
      const lhand = group.current.getObjectByName('Object_14');
      const rhand = group.current.getObjectByName('Object_16');

      if (leye) {
        leye.rotation.x = eyeL;
      }
      if (reye) {
        reye.rotation.x = eyeR;
      }
      if (lhand) {
        lhand.rotation.z = handL;
      }
      if (rhand) {
        rhand.rotation.z = handR;
      }

      if (leye && reye ) {
        leye.rotation.z = neck;
        reye.rotation.z = neck;
    }
      if (leye && reye ) {
        leye.rotation.y = head;
        reye.rotation.y = head;
    }
    }
  });

  return (
    <primitive
      ref={group}
      object={scene}
      scale={5}
      position={[8, -2, 0]}
    />
  );
};

export default WallE;


