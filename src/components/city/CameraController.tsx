'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useCityStore } from '@/store/cityStore';

export default function CameraController() {
  const controlsRef = useRef<ReturnType<typeof OrbitControls> | null>(null);
  const flyTarget = useCityStore((s) => s.flyTarget);
  const clearFlyTarget = useCityStore((s) => s.clearFlyTarget);
  const { camera } = useThree();
  const isFlying = useRef(false);
  const flyStartTime = useRef(0);
  const flyStartPos = useRef(new THREE.Vector3());
  const flyEndPos = useRef(new THREE.Vector3());
  const flyStartTarget = useRef(new THREE.Vector3());
  const flyEndTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    if (flyTarget) {
      isFlying.current = true;
      flyStartTime.current = Date.now();
      flyStartPos.current.copy(camera.position);

      flyEndPos.current.set(
        flyTarget.x + 15,
        flyTarget.y + 10,
        flyTarget.z + 15
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const controls = controlsRef.current as any;
      if (controls?.target) {
        flyStartTarget.current.copy(controls.target);
      }
      flyEndTarget.current.set(flyTarget.x, flyTarget.y - 5, flyTarget.z);
    }
  }, [flyTarget, camera]);

  useFrame(() => {
    if (!isFlying.current || !flyTarget) return;

    const elapsed = (Date.now() - flyStartTime.current) / 1000;
    const duration = 1.8;
    let t = Math.min(elapsed / duration, 1);

    // Ease in-out cubic
    t = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // Lerp camera position
    camera.position.lerpVectors(flyStartPos.current, flyEndPos.current, t);

    // Lerp controls target
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controls = controlsRef.current as any;
    if (controls?.target) {
      controls.target.lerpVectors(flyStartTarget.current, flyEndTarget.current, t);
      controls.update();
    }

    if (t >= 1) {
      isFlying.current = false;
      clearFlyTarget();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef as React.RefObject<never>}
      makeDefault
      minDistance={5}
      maxDistance={150}
      maxPolarAngle={Math.PI / 2 - 0.05}
      minPolarAngle={0.1}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      panSpeed={0.5}
    />
  );
}
