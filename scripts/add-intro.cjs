const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'public', 'data', 'i18n');

// First paragraph of the hero; embeds the locale primary keyword naturally (SEO requirement).
const intro = {
  'home.en-US.json': 'SpaceDraw is a free draw and guess game online that runs straight in your browser. Sketch the secret word before the timer ends, or race to type the winning guess — no download and no sign-up.',
  'home.en-GB.json': 'SpaceDraw is a free draw and guess game online that runs straight in your browser. Sketch the secret word before the timer ends, or race to type the winning guess — no download and no sign-up.',
  'home.fr-FR.json': 'SpaceDraw est un jeu dessiner et deviner en ligne gratuit qui fonctionne directement dans votre navigateur. Dessinez le mot secret avant la fin du chrono, ou devinez le croquis le plus vite possible — sans téléchargement ni inscription.',
  'home.es-ES.json': 'SpaceDraw es un juego de dibujar y adivinar online gratis que funciona directamente en tu navegador. Dibuja la palabra secreta antes de que termine el tiempo, o adivina el boceto lo más rápido posible — sin descargar ni registrarte.',
  'home.de-DE.json': 'SpaceDraw ist ein Zeichnen-und-Raten-Spiel online, das direkt in deinem Browser läuft. Zeichne das geheime Wort, bevor die Zeit abläuft, oder errate die Skizze so schnell wie möglich — ohne Download und ohne Anmeldung.',
  'home.ar.json': 'SpaceDraw هي لعبة ارسم وخمن اون لاين مجانية تعمل مباشرة في متصفحك. ارسم الكلمة السرية قبل انتهاء المؤقت، أو خمّن الرسم بأسرع ما يمكن — بدون تنزيل أو تسجيل.',
  'home.pt-BR.json': 'O SpaceDraw é um jogo de desenhar e adivinhar online grátis que roda direto no seu navegador. Desenhe a palavra secreta antes do tempo acabar, ou adivinhe o rabisco o mais rápido possível — sem baixar nem criar conta.',
  'home.ru-RU.json': 'SpaceDraw — это игра рисовать и угадывать онлайн, которая работает прямо в браузере. Нарисуйте секретное слово, пока не истекло время, или угадайте рисунок как можно быстрее — без скачивания и регистрации.',
};

for (const [file, text] of Object.entries(intro)) {
  const p = path.join(dir, file);
  const obj = JSON.parse(fs.readFileSync(p, 'utf8'));
  obj.hero.intro = text;
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}
console.log('Injected hero.intro into ' + Object.keys(intro).length + ' files');
