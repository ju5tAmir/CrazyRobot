/*
 * Wall-E 3D Model Author: https://sketchfab.com/3d-models/wall-e-1095bf6b98514b368cf7f450297f6e54
 *
 * I Just made some adjustments for right hand and joint the fingers.
 */

import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import {useWsClient} from "ws-request-hook";
import toast from "react-hot-toast";
import { Group } from 'three';
import {
  ServoDto,
  StringConstants,
  ServoCommand as ApiServoCommand,
  CommandType,
} from '../../api/generated-client_TEST';
import {ServerConfirmsDto, ServerSendsErrorMessageDto} from "../../api";


const WallE: React.FC = () => {
  const group = useRef<Group>(null);
  const { scene } = useGLTF('/models/wall-e-updated.glb');
  const { sendRequest, readyState} = useWsClient();

  // Modify this to be null, so the servo command will ot be sent when the component is first mounted
  const [servoCommand, setServoCommand] = useState<ApiServoCommand>({
    head:   90,
    neckt: 40,
    neckb:  30,
    leye:   125,
    reye:   80,
    lhand:   160,
    rhand:   80,
  });


  const mapDegToRange = (deg: number, min: number, max: number) => {
    return (deg / 180) * (max - min) + min;
  };

  const { headDeg, eyeLDeg, eyeRDeg, handLDeg, handRDeg, neckDeg } = useControls({
    headDeg: {
      value: 90,
      min: 30,
      max: 150,
      step: 1,
      label: 'Head',
      onEditEnd: (v) => {
        setServoCommand((prev) => ({ ...prev, head: v }));
      },
    },
    eyeLDeg: {
      value: 125,
      min: 85,
      max: 135,
      step: 1,
      label: 'Right Eye',
      onEditEnd: (v) => {
        setServoCommand((prev) => ({ ...prev, leye: v }));
      },
    },
    eyeRDeg: {
      value: 80,
      min: 70,
      max: 120,
      step: 1,
      label: 'Left Eye',
      onEditEnd: (v) => {
        setServoCommand((prev) => ({ ...prev, reye: v }));
      },
    },
    handLDeg: {
      value: 125,
      min: 0,
      max: 180,
      step: 1,
      label: 'Left Hand',
      onEditEnd: (v) => {
        setServoCommand((prev) => ({ ...prev, lhand: v }));
      },
    },
    handRDeg: {
      value: 80,
      min: 0,
      max: 180,
      step: 1,
      label: 'Right Hand',
      onEditEnd: (v) => {
        setServoCommand((prev) => ({ ...prev, rhand: v }));
      },
    },
    neckDeg: {
      value: 0,
      min: 0,
      max: 180,
      step: 1,
      label: 'Neck',
      onEditEnd: (v) => {
        setServoCommand((prev) => ({
          ...prev,
          neckt: v,
          neckb: v,
        }));
        console.log('Released neck:', v);
      },
    },
  });

  // Map degrees to actual servo model range
  const head = mapDegToRange(headDeg, -0.6, 0.6);
  const eyeL = mapDegToRange(eyeLDeg, 0.2, -0.3);
  const eyeR = mapDegToRange(eyeRDeg, 0.3, -0.2);
  const handL = mapDegToRange(handLDeg, -1.6, -0.6);
  const handR = mapDegToRange(handRDeg, 0.12, 1.0);
  const neck = mapDegToRange(neckDeg, 0.12, 0.6);

  useFrame(() => {
    if (group.current) {
      const leye = group.current.getObjectByName('Object_8');
      const reye = group.current.getObjectByName('Object_6');
      const lhand = group.current.getObjectByName('Object_14');
      const rhand = group.current.getObjectByName('Object_16');

      if (leye) leye.rotation.x = eyeL;
      if (reye) reye.rotation.x = eyeR;
      if (lhand) lhand.rotation.z = handL;
      if (rhand) rhand.rotation.z = handR;

      if (leye && reye) {
        leye.rotation.z = neck;
        reye.rotation.z = neck;
        leye.rotation.y = head;
        reye.rotation.y = head;
      }
    }
  });

    useEffect(() => {
        console.log(servoCommand);
        if (readyState !== 1) return;
      sendServoCommand();
    }, [servoCommand, readyState]);


  const sendServoCommand=async ()=>{
    const request: ServoDto = {
      eventType: StringConstants.ServoDto,
      command: {
        commandType: CommandType.Servo,
        payload: servoCommand,
      },
    };

    try{
      const signInResult:ServerConfirmsDto = await sendRequest<ServoDto
          ,ServerConfirmsDto>(request,StringConstants.ServerConfirmsDto).finally(()=>console.log("er"));
      console.log(signInResult);
      if (signInResult.success) {
        toast.success("Engine send")
      } else {
        toast.error("Retry")
      }
    }catch (error){
      const errorDto = error as unknown as ServerSendsErrorMessageDto;
      console.error("ErrorReceivedSeervo");
      console.error(errorDto.message!);
    }
  }

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

