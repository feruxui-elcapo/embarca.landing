const fs = require('fs');
const file = 'c:/Users/elnue/Documents/MIs-apps/Embarca-landing/embarca-landing/components/ProtagonistasSection.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(/\[District\.NATION\]: \[\s*\{[\s\S]*?\}\s*\],\s*\[District\.BOOSTER\]:/, 
  [District.NATION]: [
    {
        name: 'Max',
        role: 'Partner',
        company: 'Embarca',
        focus: '',
        image: '/protagonistas/maxi3.jpeg',
        stats: ['Estrategia', 'Crecimiento', 'Ecosistema'],
        story: [
            { title: 'Rol', text: 'Co-founder & Partner' },
            { title: 'Visión', text: 'Transformar Latam desde adentro.' }
        ]
    },
    {
        name: 'Juls',
        role: 'Partner',
        company: 'Embarca',
        focus: '',
        image: '/protagonistas/Juls.jpeg',
        stats: ['Inversión', 'Estrategia', 'Impacto'],
        story: [
            { title: 'Rol', text: 'Co-founder & Partner' },
            { title: 'Visión', text: 'Capital con propósito.' }
        ]
    },
    {
        name: 'Lucas',
        role: 'Partner',
        company: 'Embarca',
        focus: '',
        image: '/protagonistas/Lucas.png',
        stats: ['Operaciones', 'Método', 'Comunidad'],
        story: [
            { title: 'Rol', text: 'Co-founder & Partner' },
            { title: 'Visión', text: 'Escalar procesos sin perder el alma.' }
        ]
    }
  ],
  [District.BOOSTER]:);

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
  ].map((img) => ({
    name: img.split('.')[0],
    role: 'Startup Acelerada',
    company: 'Booster',
    focus: 'Tech',
    image: '/startups aceleradas/' + img,
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
  ].map((img) => ({
    name: img.split('.')[0].substring(0, 15).replace(/'/g,''),
    role: 'Corporate Partner',
    company: 'Connect Client',
    focus: 'Corporate Innovation',
    image: '/clientes connect/' + img,
    stats: ['Innovación', 'Pilotos', 'Corporate'],
    story: [
       { title: 'Impacto', text: 'Estrategia de innovación corporativa, logrando pilotos exitosos y sinergias en el ecosistema.' }
    ]
  }))
],
  [District.VC]:\;

data = data.replace(connectReg, connectRepl);

fs.writeFileSync(file, data);
