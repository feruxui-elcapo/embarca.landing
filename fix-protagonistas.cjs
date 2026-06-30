const fs = require('fs');
const file = './components/ProtagonistasSection.tsx';
let data = fs.readFileSync(file, 'utf8');

const boosterStart = data.indexOf('[District.BOOSTER]: [');
const connectStart = data.indexOf('[District.CONNECT]: [');
const vcStart = data.indexOf('[District.VC]: [');

if (boosterStart !== -1 && connectStart !== -1 && vcStart !== -1) {
    const startups = [
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
    ];

    const BoosterArr = `[District.BOOSTER]: [
    ...[
${startups.map(s => `      '${s}'`).join(',\n')}
    ].map(filename => ({
        name: filename.split('.')[0].replace(/[-_]/g, ' '),
        role: 'Startup Acelerada',
        company: 'Booster',
        focus: '',
        image: \`/startups aceleradas/\${filename}\`,
        stats: ['Tracción', 'Crecimiento', 'Desarrollo'],
        story: [
            { title: 'Progreso', text: 'En etapa de aceleración para alcanzar nuevos mercados y escalar operaciones.' }
        ]
    }))
  ],\n  `;

    const clientes = [
        'AchavalF.png', 'Aconcagro.webp', 'AEM.png', 'AgroFW.png', 
        'AgroMaqVirdo.png', 'Andreu.png', 'argpex 3.png', 'argpex.jpg', 
        'Aut.webp', 'azafran.png', 'Beralt.webp', 'Brandia.jpg', 'Brutto.png', 
        'CEGA.jfif', 'Conosur.webp', 'COV.png', 'Distro.png', 
        'GRB 2.png', 'GRB.jpg', 'GSA.jfif', 'Humand.jpg', 
        'LA.png', 'Max.jfif', 'Nites.png', 'OFTAR.jpg', 'Olmo.webp', 
        'PlazaV.jfif', 'Rule.png', 'SE (2).png', 'SM.webp', 'sushiclub.webp', 
        'SYN.png', 'Toliver.jfif', 'Valca.webp', 'VALOS.jfif', 'Viamatica.png'
    ];

    const ConnectArr = `[District.CONNECT]: [
    ...[
${clientes.map(c => `      '${c}'`).join(',\n')}
    ].map(filename => ({
        name: filename.split('.')[0].substring(0, 15).replace(/[-_]/g, ' '),
        role: 'Cliente Connect',
        company: 'Partnership',
        focus: 'Innovación',
        image: \`/clientes connect/\${filename}\`,
        stats: ['Innovación', 'Pilotos', 'Corporate'],
        story: [
            { title: 'Impacto', text: 'Estrategia de innovación corporativa, logrando pilotos exitosos y sinergias en el ecosistema.' }
        ]
    }))
  ],\n  `;

    const newData = data.substring(0, boosterStart) + BoosterArr + ConnectArr + data.substring(vcStart);
    fs.writeFileSync(file, newData, 'utf8');
    console.log("Successfully replaced arrays.");
} else {
    console.log("Could not find the start lines");
}
