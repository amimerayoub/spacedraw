const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'public', 'data', 'i18n');

// No visible language switcher is allowed, so the footer note must not promise links.
const notes = {
  'home.en-US.json': 'This page is available in several languages. Search engines serve the version that matches your region.',
  'home.en-GB.json': 'This page is available in several languages. Search engines serve the version that matches your region.',
  'home.fr-FR.json': 'Cette page est disponible en plusieurs langues. Les moteurs de recherche affichent la version adaptée à votre région.',
  'home.es-ES.json': 'Esta página está disponible en varios idiomas. Los motores de búsqueda muestran la versión de tu región.',
  'home.de-DE.json': 'Diese Seite ist in mehreren Sprachen verfügbar. Suchmaschinen zeigen die zu deiner Region passende Version.',
  'home.ar.json': 'هذه الصفحة متوفرة بعدة لغات. تعرض محركات البحث النسخة المطابقة لمنطقتك.',
  'home.pt-BR.json': 'Esta página está disponível em vários idiomas. Os buscadores exibem a versão da sua região.',
  'home.ru-RU.json': 'Эта страница доступна на нескольких языках. Поисковые системы показывают версию для вашего региона.',
};

for (const [file, note] of Object.entries(notes)) {
  const p = path.join(dir, file);
  const obj = JSON.parse(fs.readFileSync(p, 'utf8'));
  obj.footer.languageNote = note;
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}
console.log('Updated languageNote in ' + Object.keys(notes).length + ' files');
