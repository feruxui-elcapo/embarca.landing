const fs = require('fs');
const file = 'c:/Users/elnue/Documents/MIs-apps/Embarca-landing/embarca-landing/components/ProtagonistasSection.tsx';
let data = fs.readFileSync(file, 'utf8');

const boosterReg = /\[District\.BOOSTER\]:\s*\[[\s\S]*?\],\s*\[District\.CONNECT\]:/;
const boosterRepl = \[District.BOOSTER]: [
    ...[
      'biospi_tech_logo.jpg',
      'cropped-logo_nuevo_capazeta.webp',
      'empujón.svg',
      'Episense.jpg',
      'fertiomics.png',
      'getaigis_logo.jpg',
      'logo-scitrix.png',
      'mesenchyalt_logo.jpg',
      'nocountrytalent_logo.jpg',
      'tranqui_ai_logo.jpg'
    ].map((img, i) => ({
      name: img.split('.')[0],
      role: 'Startup Acelerada',
      company: 'Booster',
      focus: 'Tech',
      image: \\\/startups aceleradas/\\\\\\,
      stats: ['Tracción', 'Crecimiento', 'Desarrollo'],
      story: [
         { title: 'Progreso', text: 'En etapa de aceleración para alcanzar nuevos mercados y escalar operaciones.' }
      ]
    }))
  ],
  [District.CONNECT]:\;

data = data.replace(boosterReg, boosterRepl);

const connectReg = /\[District\.CONNECT\]:\s*\[[\s\S]*?\],\s*\[District\.VC\]:/;
const connectRepl = \[District.CONNECT]: [
    ...[
      'AchavalF.png', 'Aconcagro.webp', 'AEM.png', 'AgroFW.png', 'AgroMaqVirdo.png',
      'Andreu.png', 'argpex 3.png', 'argpex.jpg', 'Aut.webp', 'azafran.png',
      'Beralt.webp', 'Brandia.jpg', 'Brutto.png', 'CEGA.jfif', 'Conosur.webp',
      'COV.png', 'Distro.png', 'GRB 2.png', 'GRB.jpg', 'GSA.jfif', 'Humand.jpg',
      'LA.png', 'Max.jfif', 'Nites.png', 'OFTAR.jpg', 'Olmo.webp', 'PlazaV.jfif',
      'Rule.png', 'SE (2).png', 'SM.webp', 'sushiclub.webp', 'SYN.png',
      'Toliver.jfif', 'Valca.webp', 'VALOS.jfif', 'Viamatica.png'
    ].map((img, i) => ({
      name: img.split('.')[0],
      role: 'Corporate Partner',
      company: 'Connect Client',
      focus: 'Corporate Innovation',
      image: \\\/clientes connect/\\\\\\,
      stats: ['Innovación', 'Pilotos', 'Corporate'],
      story: [
         { title: 'Impacto', text: 'Estrategia de innovación corporativa, logrando pilotos exitosos y sinergias en el ecosistema.' }
      ]
    }))
  ],
  [District.VC]:\;

data = data.replace(connectReg, connectRepl);

fs.writeFileSync(file, data);
