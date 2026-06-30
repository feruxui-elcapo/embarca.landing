const fs = require('fs');
const file = './components/ScrollytellingSection.tsx';
let data = fs.readFileSync(file, 'utf8');

const newData = data.replace(/const PHRASES = \[[\s\S]*?\];/, `const PHRASES = [
  { text: 'Tenés un proyecto con impacto real.', x: '25%', y: '28%' },
  { text: 'Pero construir lo que no existe es agotador.', x: '75%', y: '30%' },
  { text: 'El mercado te pide que corras solo, rápido y sin mapa.', x: '28%', y: '68%' },
  { text: 'Eso no debería ser así.', x: '72%', y: '68%' },

  { text: 'Somos un ecosistema hands on.', x: '28%', y: '28%' },
  { text: 'No te damos consejos — nos embarramos con vos.', x: '75%', y: '30%' },
  { text: 'Invertimos, aceleramos y conectamos.', x: '28%', y: '68%' },
  { text: 'Tecnología con propósito. Método con resultados.', x: '75%', y: '68%' },

  { text: 'Nuevo mindset. Nuevo equipo. Nueva velocidad.', x: '26%', y: '30%' },
  { text: 'Lo que construís hoy no es solo un negocio', x: '75%', y: '30%' },
  { text: 'es parte del futuro de LATAM.', x: '28%', y: '68%' },
  { text: 'Y lo construiste acompañado.', x: '75%', y: '68%' }
];`);

fs.writeFileSync(file, newData, 'utf8');
