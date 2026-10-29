/*
 * This file is an imperative render loop: uniforms (memoised objects) are
 * mutated every frame inside useFrame, which is how three.js works and
 * what the React Compiler rules cannot model. Those two rules are
 * disabled here and nowhere else.
 */
/* eslint-disable react-hooks/immutability, react-hooks/refs */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { AdditiveBlending, type Group, type ShaderMaterial, Vector3, Vector4 } from "three";

import type { AgentState } from "../contract";
import { AdaptiveResolution } from "./adaptive";
import { audioLevel } from "./audio";
import { CORE_FRAGMENT_SHADER, CORE_VERTEX_SHADER, PRIMARY_FRAGMENT_SHADER, PRIMARY_VERTEX_SHADER } from "./shaders/nebula-shaders";
import { AgentStateMachine } from "./state";
import { renderStats } from "./stats";

export type NebulaProps = {
  /** Mutable ref the parent updates; read every frame without re-rendering. */
  stateRef: { current: AgentState };
  primaryCount?: number;
  coreCount?: number;
};

const PRIMARY_SIGMA = 0.42;
const CORE_SIGMA = 0.098;

/** Box-Muller Gaussian sphere: dense core, soft falloff. */
export function gaussianSphere(count: number, sigma: number, rand: () => number = Math.random): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.max(1e-6, rand());
    const v = rand();
    const r = sigma * Math.sqrt(-2 * Math.log(u));
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * v - 1);
    const sinPhi = Math.sin(phi);
    out[i * 3] = r * sinPhi * Math.cos(theta);
    out[i * 3 + 1] = r * sinPhi * Math.sin(theta);
    out[i * 3 + 2] = r * Math.cos(phi);
  }
  return out;
}

function randomFloats(count: number, min: number, max: number): Float32Array {
  const out = new Float32Array(count);
  for (let i = 0; i < count; i++) out[i] = min + Math.random() * (max - min);
  return out;
}

function Scene({ stateRef, primaryCount, coreCount }: Required<NebulaProps>) {
  const machine = useMemo(() => new AgentStateMachine(stateRef.current), [stateRef]);
  const adaptive = useMemo(() => new AdaptiveResolution({ minScale: 0.5, maxScale: 1 }), []);
  const { setDpr, gl } = useThree();
  const deviceDpr = useMemo(() => Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio : 1), []);
  const groupRef = useRef<Group>(null);
  const primaryMat = useRef<ShaderMaterial>(null);
  const coreMat = useRef<ShaderMaterial>(null);

  const primary = useMemo(
    () => ({ position: gaussianSphere(primaryCount, PRIMARY_SIGMA), phase: randomFloats(primaryCount, 0, Math.PI * 2), pSize: randomFloats(primaryCount, 2.2, 5.6) }),
    [primaryCount],
  );
  const core = useMemo(() => ({ position: gaussianSphere(coreCount, CORE_SIGMA), phase: randomFloats(coreCount, 0, Math.PI * 2) }), [coreCount]);

  const primaryUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLowAmp: { value: 0.45 },
      uMidAmp: { value: 0.18 },
      uCoherence: { value: 1 },
      uPixelRatio: { value: deviceDpr },
      uBrightness: { value: 1 },
      uPearl: { value: new Vector3() },
      uTint0: { value: new Vector3() },
      uTint1: { value: new Vector3() },
      uTint2: { value: new Vector3() },
      uTint3: { value: new Vector3() },
      uTintFreq: { value: new Vector4() },
      uTintIntensity: { value: new Vector4() },
      uSpatialWeights: { value: new Vector3() },
    }),
    [deviceDpr],
  );
  const coreUniforms = useMemo(() => ({ uTime: { value: 0 }, uPixelRatio: { value: deviceDpr }, uBrightness: { value: 1 } }), [deviceDpr]);

  useEffect(() => {
    renderStats.particles = primaryCount + coreCount;
    renderStats.renderer = "webgl2";
  }, [primaryCount, coreCount]);

  useFrame((_, dt) => {
    machine.transition(stateRef.current);
    machine.setAudioLevel(audioLevel.value);
    const f = machine.step(dt);
    const t = performance.now() / 1000;
    const pu = primaryUniforms;
    pu.uTime.value = t;
    pu.uLowAmp.value = f.lowAmp;
    pu.uMidAmp.value = f.midAmp;
    pu.uCoherence.value = f.coherenceNow;
    pu.uBrightness.value = f.brightness;
    pu.uPearl.value.set(...f.palette.pearl);
    pu.uTint0.value.set(...f.palette.tints[0]);
    pu.uTint1.value.set(...f.palette.tints[1]);
    pu.uTint2.value.set(...f.palette.tints[2]);
    pu.uTint3.value.set(...f.palette.tints[3]);
    pu.uTintFreq.value.set(...f.palette.frequencies);
    pu.uTintIntensity.value.set(...f.palette.intensities);
    pu.uSpatialWeights.value.set(...f.palette.spatialWeights);
    coreUniforms.uTime.value = t;
    coreUniforms.uBrightness.value = f.brightness * (1 + f.audio * 0.6);
    if (groupRef.current) {
      groupRef.current.rotation.y += f.rotY * dt;
      groupRef.current.rotation.x += f.rotX * dt;
    }
    if (adaptive.update(dt * 1000)) {
      const dpr = +(deviceDpr * adaptive.scale).toFixed(2);
      setDpr(dpr);
      pu.uPixelRatio.value = dpr;
      coreUniforms.uPixelRatio.value = dpr;
    }
    renderStats.fps = adaptive.fps;
    renderStats.frameMs = adaptive.frameMs;
    renderStats.scale = adaptive.scale;
    renderStats.dpr = gl.getPixelRatio();
    renderStats.state = machine.current;
  });

  return (
    <group ref={groupRef}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[primary.position, 3]} />
          <bufferAttribute attach="attributes-phase" args={[primary.phase, 1]} />
          <bufferAttribute attach="attributes-pSize" args={[primary.pSize, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={primaryMat}
          vertexShader={PRIMARY_VERTEX_SHADER}
          fragmentShader={PRIMARY_FRAGMENT_SHADER}
          uniforms={primaryUniforms}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[core.position, 3]} />
          <bufferAttribute attach="attributes-phase" args={[core.phase, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={coreMat}
          vertexShader={CORE_VERTEX_SHADER}
          fragmentShader={CORE_FRAGMENT_SHADER}
          uniforms={coreUniforms}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </group>
  );
}

/** The R3F canvas. Fills its container; the Stage sizes the container. */
export default function Nebula({ stateRef, primaryCount = 12000, coreCount = 1200 }: NebulaProps) {
  return (
    <Canvas
      dpr={Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio : 1)}
      camera={{ position: [0, 0, 3.0], fov: 45, near: 0.1, far: 20 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: false }}
      frameloop="always"
      style={{ width: "100%", height: "100%" }}
      aria-hidden
    >
      <Scene stateRef={stateRef} primaryCount={primaryCount} coreCount={coreCount} />
    </Canvas>
  );
}
