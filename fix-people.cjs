const fs = require('fs');
const file = './components/ScrollytellingSection.tsx';
let data = fs.readFileSync(file, 'utf8');

// remove PersonCursor component
data = data.replace(/\/\/ --- UI COMPONENTS ---[\s\S]*?const LOGOS_DATA = \[/, 'const LOGOS_DATA = [');

// remove PersonCursor rendering map
const uiMapStr = `<div className="absolute inset-0 pointer-events-none z-40">
            <AnimatePresence>
              {stage.people.map(person => (
                <PersonCursor key={person} personKey={person} phase={currentPhase} />
              ))}
            </AnimatePresence>
          </div>`;

// Regex that safely replaces the rendering logic
data = data.replace(/{[\s]*\/\* People Cursors Overlay \*\/[\s]*}\s*<div className="absolute inset-0 pointer-events-none z-40">[\s\S]*?<\/div>/, '');


fs.writeFileSync(file, data, 'utf8');
