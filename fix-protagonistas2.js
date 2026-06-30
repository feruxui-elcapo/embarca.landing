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
        'empuj?n.svg',
        'Episense.jpg',
        'fertiomics.png',
        'getaigis_logo.jpg',
        'logo-scitrix.png',
        'mesenchyalt_logo.jpg',
        'nocountrytalent_logo.jpg',
        'tranqui_ai_logo.jpg'
    ];

    const BoosterArr = [District.BOOSTER]: [\n    ...[\n +
        startups.map(s =>       ' + s + ').join(',\n') +
        \n    ].map(filename => ({\n +
                name: filename.split('.')[0].replace(/[-_]/g, ' '),\n +
                role: 'Startup Acelerada',\n +
                company: 'Booster',\n +
                focus: '',\n +
                image: \/startups aceleradas/\\,\n +
                stats: ['Tracci?n', 'Crecimiento', 'Desarrollo'],\n +
                story: [\n +
                    { title: 'Progreso', text: 'En etapa de aceleraci?n para alcanzar nuevos mercados y escalar operaciones.' }\n +
                ]\n +
            }))\n  ],\n  ;

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

    const ConnectArr = [District.CONNECT]: [\n    ...[\n +
        clientes.map(c =>       ' + c + ').join(',\n') +
        \n    ].map(filename => ({\n +
                name: filename.split('.')[0].substring(0, 15).replace(/[-_]/g, ' '),\n +
                role: 'Cliente Connect',\n +
                company: 'Partnership',\n +
                focus: 'Innovaci?n',\n +
                image: \/clientes connect/\\,\n +
                stats: ['Innovaci?n', 'Pilotos', 'Corporate'],\n +
                story: [\n +
                    { title: 'Impacto', text: 'Estrategia de innovaci?n corporativa, logrando pilotos exitosos y sinergias en el ecosistema.' }\n +
                ]\n +
            }))\n  ],\n  ;

    const newData = data.substring(0, boosterStart) + BoosterArr + ConnectArr + data.substring(vcStart);
    fs.writeFileSync(file, newData, 'utf8');
}
