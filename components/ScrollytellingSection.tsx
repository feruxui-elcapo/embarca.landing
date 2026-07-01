import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, SoftShadows, MeshDistortMaterial, Float, Sparkles } from '@react-three/drei';
import { motion, useScroll, useMotionValueEvent, AnimatePresence, useSpring, useInView } from 'framer-motion';
import * as THREE from 'three';

// --- DATA ---
const PHRASES = [
  { text: 'Tenés un proyecto con impacto real.', x: '25%', y: '28%', mobX: '50%', mobY: '22%' },
  { text: 'Pero construir lo que no existe es agotador.', x: '75%', y: '30%', mobX: '50%', mobY: '34%' },
  { text: 'El mercado te pide que corras solo, rápido y sin mapa.', x: '28%', y: '68%', mobX: '50%', mobY: '66%' },
  { text: 'Eso no debería ser así.', x: '72%', y: '68%', mobX: '50%', mobY: '78%' },

  { text: 'Somos un ecosistema hands on.', x: '28%', y: '28%', mobX: '50%', mobY: '22%' },
  { text: 'No te damos consejos — nos embarramos con vos.', x: '75%', y: '30%', mobX: '50%', mobY: '34%' },
  { text: 'Invertimos, aceleramos y conectamos.', x: '28%', y: '68%', mobX: '50%', mobY: '66%' },
  { text: 'Tecnología con propósito. Método con resultados.', x: '75%', y: '68%', mobX: '50%', mobY: '78%' },

  { text: 'Nuevo mindset. Nuevo equipo. Nueva velocidad.', x: '26%', y: '30%', mobX: '50%', mobY: '22%' },
  { text: 'Lo que construís hoy no es solo un negocio', x: '75%', y: '30%', mobX: '50%', mobY: '34%' },
  { text: 'Lo que construís es parte del futuro de LATAM.', x: '28%', y: '68%', mobX: '50%', mobY: '66%' },
  { text: 'Y lo construiste acompañado.', x: '75%', y: '68%', mobX: '50%', mobY: '78%' }
];

const STAGES = [
  {
    id: 0,
    title: 'Caminás solo',
    color: '#00eaff', // theme neon blue
    phrases: PHRASES.slice(0, 4),
    people: []
  },
  {
    id: 1,
    title: 'Nos conocés',
    color: '#ff3300', // theme fiery orange/red
    phrases: PHRASES.slice(4, 8),
    people: []
  },
  {
    id: 2,
    title: 'Ya no sos el mismo',
    color: '#00ffcc', // theme mint
    phrases: PHRASES.slice(8, 12),
    people: []
  }
];

// Removed PEOPLE_DATA since cursors are no longer used

// --- Utils ---
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

class SpiralCurve extends THREE.Curve<THREE.Vector3> {
  scale: number;
  constructor(scale: number = 1) {
    super();
    this.scale = scale;
  }
  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    // Un espiral concÃ©ntrico tipo "rol de canela" que termina en el centro
    const revolutions = 2.5;
    const a = t * Math.PI * 2 * revolutions;
    // Empieza afuera y va disminuyendo suavemente, pero lo cortamos a 0.2 (1 - t * 0.8) 
    // para evitar que colapse en un punto central de 0 y se rompa la malla 3d en la punta.
    const radius = 1.5 * (1 - t * 0.8); 
    
    // Lo dibujamos plano en el plano XY (x, y) en vez del XZ. 
    // Esto hace que naturalmente mire de frente hacia la cÃ¡mara (eje Z).
    const x = Math.cos(a) * radius;
    const y = Math.sin(a) * radius;
    const z = 0;

    return optionalTarget.set(x, y, z).multiplyScalar(this.scale);
  }
}
const spiralPath = new SpiralCurve(1);

// --- 3D COMPONENTS ---
function Shape({ type, progress, isMobile }: { type: string, progress: number, isMobile: boolean }) {
  const meshRef = useRef<THREE.Group>(null!);
  const materialRef = useRef<any>(null!);
  const floatRef = useRef<any>(null!);
  const { size } = useThree();

  const isMobileSize = isMobile || size.width < 768;

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    meshRef.current.rotation.y += delta * 0.1;
    meshRef.current.rotation.x += delta * 0.05;

    let targetOpacity = 0;
    let targetScale = 1;

    // Rock logic: visible in phase 0, fades out in phase 1.
    if (type === 'rock') {
      if (progress < 0.33) {
        targetOpacity = 1;
        
        // 1. El primer objeto modifica más su forma a medida que hago el scrolleo hacia abajo
        if (materialRef.current) {
          const distortAmt = THREE.MathUtils.lerp(0.2, 0.4, progress / 0.33);
          materialRef.current.distort = distortAmt;
        }
      } else if (progress < 0.66) {
        // 2. Se transforma durante la fase media (fade out mientras entra el otro, se vuelve polygomal)
        const phaseProgress = (progress - 0.33) / 0.33;
        targetOpacity = 1 - phaseProgress;
        targetScale = THREE.MathUtils.lerp(1, 0.1, phaseProgress);
        
        if (materialRef.current) {
           materialRef.current.distort = THREE.MathUtils.lerp(0.4, 0.0, phaseProgress);
        }
      } else {
        targetOpacity = 0;
      }
    }

    // Diamond logic: fades in during phase 1, fully visible in phase 2.
    if (type === 'diamond') {
      if (progress < 0.33) {
        targetOpacity = 0;
        targetScale = 0;
      } else if (progress < 0.66) {
        const phaseProgress = (progress - 0.33) / 0.33;
        // Make it appear quickly at the very end of phase 1
        if (phaseProgress > 0.8) {
           const popProgress = (phaseProgress - 0.8) / 0.2;
           targetOpacity = popProgress;
           targetScale = THREE.MathUtils.lerp(0.1, 1, popProgress);
        } else {
           targetOpacity = 0;
           targetScale = 0;
        }
      } else {
        targetOpacity = 1;
        targetScale = 1;
      }
    }

    const baseScale = isMobileSize ? 0.85 : 1.0;
    targetScale *= baseScale;

    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 4);
    
    if (materialRef.current && materialRef.current.opacity !== undefined) {
      materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, targetOpacity, delta * 6);
    }
  });

  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      {type === 'rock' && (
        <Float ref={floatRef} speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <mesh castShadow={!isMobileSize} receiveShadow={!isMobileSize}>
            <icosahedronGeometry args={[0.8, isMobileSize ? 4 : 16]} />
            <MeshDistortMaterial
              ref={materialRef}
              color="#2a2a2a"
              envMapIntensity={isMobileSize ? 0 : 1}
              clearcoat={0.2}
              clearcoatRoughness={0.8}
              roughness={0.7}
              metalness={0.8}
              distort={0.4}
              speed={1}
              transparent
              opacity={1}
            />
          </mesh>
        </Float>
      )}

      {type === 'diamond' && (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
          <mesh castShadow={!isMobileSize} receiveShadow={!isMobileSize} scale={[1.2, 0.6, 0.95]}>
            {/* Diamante tipo "Oval Cut" facetado */}
            <icosahedronGeometry args={[1, 1]} />
            {/* Transparent glass physical diamond material */}
            <meshPhysicalMaterial
              ref={materialRef}
              color="#b8d8ff"
              roughness={0}
              metalness={0}
              transmission={0.95}
              thickness={3.5}
              ior={2.42}
              anisotropy={0.8}
              envMapIntensity={3}
              clearcoat={1}
              clearcoatRoughness={0}
              specularIntensity={1}
              specularColor="#ffffff"
              flatShading={true}
            />
          </mesh>
          <mesh scale={[1.16, 0.57, 0.91]}>
              <icosahedronGeometry args={[1, 1]} />
              <meshBasicMaterial color="#c0d8ff" wireframe transparent opacity={0.12} />
          </mesh>
          {progress > 0.60 && (
            <Sparkles 
              count={isMobileSize ? 8 : 50} 
              scale={isMobileSize ? 1.5 : 2} 
              size={isMobileSize ? 1.5 : 3} 
              speed={0.8} 
              opacity={1} 
              color="#00e5ff" 
            />
          )}
        </Float>
      )}
    </group>
  );
}

function Scene({ progress, isMobile }: { progress: number, isMobile: boolean }) {
  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={1.5} color="#ffffff" />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={3} 
        color="#ffffff" 
        castShadow={!isMobile} 
        shadow-mapSize={isMobile ? [256, 256] : [1024, 1024]} 
      />
      <directionalLight position={[-10, 0, -10]} intensity={1} color="#ffffff" />

      <Shape type="rock" progress={progress} isMobile={isMobile} />
      <Shape type="diamond" progress={progress} isMobile={isMobile} />

      {!isMobile && <SoftShadows size={20} samples={10} focus={0.5} />}
      {!isMobile && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <shadowMaterial transparent opacity={0.15} />
        </mesh>
      )}
    </>
  );
}

const LOGOS_DATA = [
  { key: 'nation', src: '/distritos/Nation.svg', startX: 500, startY: -400 },
  { key: 'connect', src: '/distritos/Connect.svg', startX: -500, startY: 400 },
  { key: 'booster', src: '/distritos/Booster.svg', startX: 500, startY: 400 },
  { key: 'venture', src: '/distritos/Venture.svg', startX: -500, startY: -400 }
];

const EnteringLogos = ({ progress }: { progress: number }) => {
  // Los logos empiezan a entrar en la mitad de la fase de encuentro
  if (progress < 0.25 || progress > 0.80) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      {LOGOS_DATA.map((logo, index) => {
        const startProgress = 0.33 + (index * 0.04); 
        const endProgress = startProgress + 0.15; 
        
        let localProgress = (progress - startProgress) / (endProgress - startProgress);
        localProgress = clamp(localProgress, 0, 1);
        
        if (progress < startProgress) return null;
        if (localProgress >= 1) return null;

        // Curva personalizada: arranca quieto y "cae" velozmente al centro (simulando succiÃ³n o absorciÃ³n 3D).
        const easedProgress = Math.pow(localProgress, 3); // easeInCubic
        
        const currentX = THREE.MathUtils.lerp(logo.startX, 0, easedProgress);
        const currentY = THREE.MathUtils.lerp(logo.startY, 0, easedProgress);
        const currentScale = THREE.MathUtils.lerp(1.5, 0.1, easedProgress);
        const currentOpacity = localProgress < 0.1 ? localProgress * 10 : THREE.MathUtils.lerp(1, 0, easedProgress);
        const currentRotate = THREE.MathUtils.lerp(-45, 180 + (index * 45), easedProgress);

        return (
          <div
            key={logo.key}
            className="absolute shrink-0 flex items-center justify-center"
            style={{
              width: 140, 
              height: 140,
              transform: `translate(${currentX}px, ${currentY}px) scale(${currentScale}) rotate(${currentRotate}deg)`,
              opacity: currentOpacity,
              filter: `drop-shadow(0 0 15px rgba(0,180,255,${1 - easedProgress}))`
            }}
          >
            <img
              src={logo.src}
              alt={logo.key}
              className="w-full h-full object-contain"
            />
          </div>
        );
      })}
    </div>
  );
};

export const ScrollytellingSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { margin: "200px 0px" });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  const [progress, setProgress] = useState(0);
  const [snappedProgress, setSnappedProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const smoothProgress = useSpring(0, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Divide the scroll into 3 thirds
    const p = latest > 0.66 ? 1 : latest > 0.33 ? 0.5 : 0;
    if (p !== snappedProgress) {
      setSnappedProgress(p);
    }
  });

  useEffect(() => {
    smoothProgress.set(snappedProgress);
  }, [snappedProgress, smoothProgress]);

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    setProgress(latest);
  });

  // Calculate currentPhase for UI elements based on the exact snapped state
  const currentPhase = snappedProgress === 1 ? 2 : snappedProgress === 0.5 ? 1 : 0;
  const stage = STAGES[currentPhase];

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full border-t border-white/10"
      style={{ height: '300vh' }}
    >
      <div className="h-screen w-full overflow-hidden isolate z-20 sticky top-0" style={{ width: '100%' }}>
        {/* Soft gradient fade border top (Removed) */}
        {/* Soft gradient fade border bottom (Removed) */}
        
        {/* Progress Bar top */}
        <div className="absolute top-20 sm:top-28 md:top-32 left-1/2 -translate-x-1/2 w-[80%] sm:w-[60%] max-w-2xl flex gap-2 z-[60]">
          {[0, 1, 2].map((stepIndex) => (
            <div key={stepIndex} className="flex-1 h-1.5 bg-black/15 backdrop-blur-md rounded-full overflow-hidden border border-white/5">
              <motion.div 
                className="h-full bg-white rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: currentPhase >= stepIndex ? 1 : 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                style={{ originX: 0 }}
              />
            </div>
          ))}
        </div>

        {/* Floating Phrases (Post-its - High Fidelity) */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <AnimatePresence>
            {STAGES[currentPhase].phrases.map((phrase: any, idx) => (
              <motion.div
                key={`phrase-${currentPhase}-${idx}`}
                initial={{ opacity: 0, scale: 0.8, x: "-50%", y: "-40%" }}
                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                exit={{ opacity: 0, scale: 0.8, x: "-50%", y: "-60%" }}
                transition={{ type: 'spring', stiffness: 90, damping: 20, delay: idx * 0.1 }}
                className="absolute w-[85%] max-w-[300px] md:w-80 flex flex-col justify-center items-center text-center group"
                style={{ 
                  left: isMobile ? (phrase.mobX || '50%') : phrase.x, 
                  top: isMobile ? (phrase.mobY || phrase.y) : phrase.y, 
                  transformOrigin: 'center center' 
                }}
              >
                <p className="font-sans text-sm sm:text-lg md:text-2xl text-white font-bold leading-tight tracking-tighter">
                  {phrase.text}
                </p>
                <div className="mt-3 w-8 h-1 rounded-full hidden md:block" style={{ backgroundColor: STAGES[currentPhase].color }} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 3D Canvas Center */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {isInView && (
            <Canvas camera={{ position: [0, 0, 9], fov: 40 }} dpr={isMobile ? 1 : [1, 2]}>
              <Scene progress={progress} isMobile={isMobile} />
            </Canvas>
          )}
        </div>

        {/* Title BELOW the Model */}
        <EnteringLogos progress={progress} />
        
        <div className="absolute bottom-[12%] md:bottom-[15%] w-full text-center z-30 pointer-events-none px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhase}
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="inline-flex flex-col items-center"
            >
              <div className="mb-2 md:mb-4 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-700 text-white font-mono text-xs uppercase tracking-[0.3em] shadow-xl">
                ETAPA {currentPhase + 1}
              </div>
              <h2 className="font-sans text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white drop-shadow-md pb-2 pr-2">
                {stage.title}
              </h2>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};
