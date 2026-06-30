const fs = require('fs');
const file = './components/AdminPanel.tsx';
let data = fs.readFileSync(file, 'utf8');

const regex = /<div className="flex gap-2 flex-wrap justify-end">[\s\S]*?<button onClick=\{handleCreateNew\}/;
const repl = <div className="flex gap-2 flex-wrap justify-end">
  <button onClick={() => {
    const districtStr = prompt('¿Para qué distrito? (Escribe: NATION, BOOSTER, CONNECT o VC):');
    if (!districtStr) return;
    const d = districtStr.toUpperCase();
    if (!['NATION', 'BOOSTER', 'CONNECT', 'VC'].includes(d)) return alert('Distrito no válido.');
    const url = prompt('Introduce el nuevo link Spotify:');
    if (url) {
      setDoc(doc(db, 'settings', \\\spotify_\\\\), { url });
      window.dispatchEvent(new Event('storage'));
      alert('Actualizado');
    }
  }} className="flex gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-bold uppercase tracking-widest rounded-lg transition items-center">
    Actualizar Spotify
  </button>
  <button onClick={() => {
    const districtStr = prompt('¿Para qué distrito? (Escribe: NATION, BOOSTER, CONNECT o VC):');
    if (!districtStr) return;
    const d = districtStr.toUpperCase();
    if (!['NATION', 'BOOSTER', 'CONNECT', 'VC'].includes(d)) return alert('Distrito no válido.');
    const url = prompt('Introduce el nuevo link YouTube:');
    if (url) {
      setDoc(doc(db, 'settings', \\\youtube_\\\\), { url });
      window.dispatchEvent(new Event('storage'));
      alert('Actualizado');
    }
  }} className="flex gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest rounded-lg transition items-center">
    Actualizar YouTube
  </button>
  <button onClick={handleCreateNew};

data = data.replace(regex, repl);
fs.writeFileSync(file, data);
