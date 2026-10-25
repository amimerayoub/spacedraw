const fs = require('fs');
const path = require('path');
const outDir = path.join(__dirname, '..', 'public', 'data', 'i18n');

const T = {};

T['en-US'] = {
  dir: 'ltr',
  nav: { play: 'Play now', howToPlay: 'How to play', wordLists: 'Word lists', practice: 'Practice' },
  hero: {
    eyebrow: 'Free browser drawing game',
    ctaPrimary: 'Play now',
    ctaSecondary: 'How to play',
    note: 'Runs right in your browser — no download, no sign-up.'
  },
  trust: ['No download', 'No sign-up', 'Mobile & desktop', 'Family-friendly word packs'],
  howItWorks: {
    steps: [
      { title: 'Pick an avatar', body: 'Choose one of 10 original avatars and a display name. Nothing is stored on a server.' },
      { title: 'Get your secret word', body: 'The drawer gets three word choices from a category and difficulty level.' },
      { title: 'Draw or guess', body: 'Sketch the word before the timer ends, or type guesses in the chat to score speed points.' }
    ]
  },
  features: {
    cards: [
      { title: 'Solo practice mode', body: 'Warm up against simulated challengers without waiting for a lobby to fill.' },
      { title: 'Private rooms with a code', body: 'Create a room and share its code. Simulated players fill the lobby today; live multiplayer is coming later.' },
      { title: 'Custom round settings', body: 'Adjust the timer, number of rounds, and word difficulty to match your group.' },
      { title: 'Word packs by difficulty', body: 'Browse categorized word packs across Easy, Medium and Hard levels.' }
    ]
  },
  practice: { cta: 'Launch practice mode' },
  rooms: { cta: 'Create a room', body: 'Set a room code, pick your rules, and start drawing. Rooms run with simulated players for now — real-time multiplayer is a future update.' },
  mobile: { body: 'A touch-responsive canvas works smoothly on phones, tablets and desktops, so you can play anywhere without an app install.' },
  words: {
    note: 'Demo word packs currently ship in English; localized packs are on the way.',
    categories: [
      { name: 'Animals', sampleWords: ['cat', 'elephant', 'butterfly'] },
      { name: 'Food', sampleWords: ['pizza', 'ice cream', 'banana'] },
      { name: 'Objects', sampleWords: ['bicycle', 'umbrella', 'camera'] }
    ]
  },
  faq: { note: 'Quick answers to the most common questions.' },
  footer: {
    tagline: 'A free draw-and-guess game that runs in your browser.',
    legal: '© 2026 SpaceDraw. All rights reserved.',
    languageNote: 'This page is available in several languages. Use your browser or the direct links below.'
  },
  a11y: { skipToContent: 'Skip to content', drawingCanvasAlt: 'SpaceDraw drawing canvas preview', openMenu: 'Open menu', playLink: 'Play the SpaceDraw drawing game' }
};

T['en-GB'] = {
  dir: 'ltr',
  nav: { play: 'Play now', howToPlay: 'How to play', wordLists: 'Word lists', practice: 'Practise' },
  hero: {
    eyebrow: 'Free browser drawing game',
    ctaPrimary: 'Play now',
    ctaSecondary: 'How to play',
    note: 'Runs right in your browser — no download, no sign-up.'
  },
  trust: ['No download', 'No sign-up', 'Mobile & desktop', 'Family-friendly word packs'],
  howItWorks: {
    steps: [
      { title: 'Pick an avatar', body: 'Choose one of 10 original avatars and a display name. Nothing is stored on a server.' },
      { title: 'Get your secret word', body: 'The drawer is given three word choices from a category and difficulty level.' },
      { title: 'Draw or guess', body: 'Sketch the word before the timer ends, or type guesses in the chat to earn speed points.' }
    ]
  },
  features: {
    cards: [
      { title: 'Solo practise mode', body: 'Warm up against simulated challengers without waiting for a lobby to fill.' },
      { title: 'Private rooms with a code', body: 'Create a room and share its code. Simulated players fill the lobby today; live multiplayer is coming later.' },
      { title: 'Custom round settings', body: 'Adjust the timer, number of rounds and word difficulty to suit your group.' },
      { title: 'Word packs by difficulty', body: 'Browse categorised word packs across Easy, Medium and Hard levels.' }
    ]
  },
  practice: { cta: 'Launch practise mode' },
  rooms: { cta: 'Create a room', body: 'Set a room code, pick your rules and start drawing. Rooms run with simulated players for now — real-time multiplayer is a future update.' },
  mobile: { body: 'A touch-responsive canvas works smoothly on phones, tablets and desktops, so you can play anywhere without installing an app.' },
  words: {
    note: 'Demo word packs currently ship in English; localised packs are on the way.',
    categories: [
      { name: 'Animals', sampleWords: ['cat', 'elephant', 'butterfly'] },
      { name: 'Food', sampleWords: ['pizza', 'ice cream', 'banana'] },
      { name: 'Objects', sampleWords: ['bicycle', 'umbrella', 'camera'] }
    ]
  },
  faq: { note: 'Quick answers to the most common questions.' },
  footer: {
    tagline: 'A free draw-and-guess game that runs in your browser.',
    legal: '© 2026 SpaceDraw. All rights reserved.',
    languageNote: 'This page is available in several languages. Use your browser or the direct links below.'
  },
  a11y: { skipToContent: 'Skip to content', drawingCanvasAlt: 'SpaceDraw drawing canvas preview', openMenu: 'Open menu', playLink: 'Play the SpaceDraw drawing game' }
};

T['fr-FR'] = {
  dir: 'ltr',
  nav: { play: 'Jouer', howToPlay: 'Comment jouer', wordLists: 'Listes de mots', practice: "S'entraîner" },
  hero: {
    eyebrow: 'Jeu de dessin gratuit dans le navigateur',
    ctaPrimary: 'Jouer maintenant',
    ctaSecondary: 'Comment jouer',
    note: 'Le jeu fonctionne directement dans votre navigateur — sans téléchargement ni inscription.'
  },
  trust: ['Sans téléchargement', 'Sans inscription', 'Mobile et PC', 'Listes de mots familiales'],
  howItWorks: {
    steps: [
      { title: 'Choisissez un avatar', body: "Sélectionnez l'un des 10 avatars originaux et un pseudo. Rien n'est stocké sur un serveur." },
      { title: 'Recevez votre mot secret', body: 'Le dessinateur reçoit trois choix de mots selon une catégorie et un niveau de difficulté.' },
      { title: 'Dessinez ou devinez', body: 'Dessinez le mot avant la fin du chrono, ou saisissez vos devinettes dans le chat pour marquer des points de rapidité.' }
    ]
  },
  features: {
    cards: [
      { title: "Mode entraînement solo", body: "Échauffez-vous contre des joueurs simulés sans attendre qu'un salon se remplisse." },
      { title: 'Salons privés avec code', body: "Créez un salon et partagez son code. Des joueurs simulés remplissent le salon pour l'instant ; le multijoueur en direct arrive plus tard." },
      { title: 'Paramètres de manche', body: 'Ajustez le chrono, le nombre de manches et la difficulté des mots selon votre groupe.' },
      { title: 'Listes de mots par difficulté', body: 'Parcourez des listes de mots classées par thème et par niveau (facile, moyen, difficile).' }
    ]
  },
  practice: { cta: 'Lancer le mode entraînement' },
  rooms: { cta: 'Créer un salon', body: "Définissez un code de salon, choisissez vos règles et commencez à dessiner. Les salons fonctionnent avec des joueurs simulés pour l'instant — le multijoueur en temps réel est une mise à jour future." },
  mobile: { body: "Un canvas tactile réactif fonctionne sur téléphone, tablette et ordinateur, pour jouer partout sans installer d'application." },
  words: {
    note: 'Les listes de mots de démonstration sont actuellement en anglais ; des listes localisées arrivent bientôt.',
    categories: [
      { name: 'Animaux', sampleWords: ['chat', 'éléphant', 'papillon'] },
      { name: 'Nourriture', sampleWords: ['pizza', 'glace', 'banane'] },
      { name: 'Objets', sampleWords: ['vélo', 'parapluie', 'appareil photo'] }
    ]
  },
  faq: { note: 'Réponses rapides aux questions les plus fréquentes.' },
  footer: {
    tagline: 'Un jeu pour dessiner et deviner gratuit, directement dans votre navigateur.',
    legal: '© 2026 SpaceDraw. Tous droits réservés.',
    languageNote: 'Cette page est disponible en plusieurs langues. Utilisez votre navigateur ou les liens directs ci-dessous.'
  },
  a11y: { skipToContent: 'Aller au contenu', drawingCanvasAlt: 'Aperçu du canvas de dessin SpaceDraw', openMenu: 'Ouvrir le menu', playLink: 'Jouer au jeu de dessin SpaceDraw' }
};

T['es-ES'] = {
  dir: 'ltr',
  nav: { play: 'Jugar', howToPlay: 'Cómo jugar', wordLists: 'Listas de palabras', practice: 'Practicar' },
  hero: {
    eyebrow: 'Juego de dibujo gratis en el navegador',
    ctaPrimary: 'Jugar ahora',
    ctaSecondary: 'Cómo jugar',
    note: 'Funciona directamente en tu navegador — sin descargar ni registrarse.'
  },
  trust: ['Sin descargas', 'Sin registro', 'Móvil y PC', 'Palabras para toda la familia'],
  howItWorks: {
    steps: [
      { title: 'Elige un avatar', body: 'Selecciona uno de los 10 avatares originales y un nombre. No se guarda nada en un servidor.' },
      { title: 'Recibe tu palabra secreta', body: 'Quien dibuja recibe tres palabras para elegir según categoría y nivel de dificultad.' },
      { title: 'Dibuja o adivina', body: 'Dibuja la palabra antes de que termine el tiempo, o escribe tus respuestas en el chat para ganar puntos de velocidad.' }
    ]
  },
  features: {
    cards: [
      { title: 'Modo práctica en solitario', body: 'Calienta contra jugadores simulados sin esperar a que se llene una sala.' },
      { title: 'Salas privadas con código', body: 'Crea una sala y comparte su código. Hoy la llenan jugadores simulados; el multijugador en vivo llegará más adelante.' },
      { title: 'Ajustes de ronda', body: 'Ajusta el temporizador, el número de rondas y la dificultad de las palabras según tu grupo.' },
      { title: 'Listas de palabras por dificultad', body: 'Explora listas de palabras por categoría y nivel (fácil, medio, difícil).' }
    ]
  },
  practice: { cta: 'Iniciar modo práctica' },
  rooms: { cta: 'Crear una sala', body: 'Define un código de sala, elige tus reglas y empieza a dibujar. Las salas funcionan con jugadores simulados por ahora — el multijugador en tiempo real es una actualización futura.' },
  mobile: { body: 'Un lienzo táctil responde con fluidez en móvil, celular, tablet y PC, para jugar en cualquier lugar sin instalar una app.' },
  words: {
    note: 'Las listas de palabras de demostración están en inglés por ahora; las versiones localizadas llegarán pronto.',
    categories: [
      { name: 'Animales', sampleWords: ['gato', 'elefante', 'mariposa'] },
      { name: 'Comida', sampleWords: ['pizza', 'helado', 'plátano'] },
      { name: 'Objetos', sampleWords: ['bicicleta', 'paraguas', 'cámara'] }
    ]
  },
  faq: { note: 'Respuestas rápidas a las preguntas más frecuentes.' },
  footer: {
    tagline: 'Un juego de dibujar y adivinar gratis que funciona en tu navegador.',
    legal: '© 2026 SpaceDraw. Todos los derechos reservados.',
    languageNote: 'Esta página está disponible en varios idiomas. Usa tu navegador o los enlaces directos de abajo.'
  },
  a11y: { skipToContent: 'Saltar al contenido', drawingCanvasAlt: 'Vista previa del lienzo de dibujo de SpaceDraw', openMenu: 'Abrir menú', playLink: 'Jugar al juego de dibujo SpaceDraw' }
};

T['de-DE'] = {
  dir: 'ltr',
  nav: { play: 'Jetzt spielen', howToPlay: 'So funktioniert es', wordLists: 'Wortlisten', practice: 'Üben' },
  hero: {
    eyebrow: 'Kostenloses Zeichenspiel im Browser',
    ctaPrimary: 'Jetzt spielen',
    ctaSecondary: 'So funktioniert es',
    note: 'Läuft direkt in deinem Browser — ohne Download und ohne Anmeldung.'
  },
  trust: ['Ohne Download', 'Ohne Anmeldung', 'Mobil & Desktop', 'Familienfreundliche Wortlisten'],
  howItWorks: {
    steps: [
      { title: 'Avatar wählen', body: 'Wähle einen von 10 eigenen Avataren und einen Namen. Es wird nichts auf einem Server gespeichert.' },
      { title: 'Geheimes Wort erhalten', body: 'Der Zeichner erhält drei Wort-Vorschläge aus einer Kategorie und einem Schwierigkeitsgrad.' },
      { title: 'Zeichnen oder raten', body: 'Zeichne das Wort, bevor die Zeit abläuft, oder tippe deine Rateversuche in den Chat, um Schnelligkeitspunkte zu sammeln.' }
    ]
  },
  features: {
    cards: [
      { title: 'Solo-Übungsmodus', body: 'Wärme dich gegen simulierte Mitspieler auf, ohne auf eine volle Lobby zu warten.' },
      { title: 'Private Räume mit Code', body: 'Erstelle einen Raum und teile seinen Code. Heute füllen simulierte Spieler die Lobby; echtes Mehrspieler folgt später.' },
      { title: 'Rundeneinstellungen', body: 'Passe Timer, Rundenanzahl und Wort-Schwierigkeit an deine Gruppe an.' },
      { title: 'Wortlisten nach Schwierigkeit', body: 'Durchsuche Wortlisten nach Kategorie und Niveau (Leicht, Mittel, Schwer).' }
    ]
  },
  practice: { cta: 'Übungsmodus starten' },
  rooms: { cta: 'Raum erstellen', body: 'Lege einen Raumcode fest, wähle deine Regeln und zeichne los. Räume laufen vorerst mit simulierten Spielern — Echtzeit-Mehrspieler ist ein zukünftiges Update.' },
  mobile: { body: 'Eine touch-fähige Zeichenfläche läuft flüssig auf Handy, Tablet und Desktop — spiele überall ohne App-Installation.' },
  words: {
    note: 'Die Demo-Wortlisten sind derzeit auf Englisch; lokalisierte Listen folgen.',
    categories: [
      { name: 'Tiere', sampleWords: ['Katze', 'Elefant', 'Schmetterling'] },
      { name: 'Essen', sampleWords: ['Pizza', 'Eis', 'Banane'] },
      { name: 'Gegenstände', sampleWords: ['Fahrrad', 'Regenschirm', 'Kamera'] }
    ]
  },
  faq: { note: 'Schnelle Antworten auf die häufigsten Fragen.' },
  footer: {
    tagline: 'Ein kostenloses Zeichnen-und-Raten-Spiel, das in deinem Browser läuft.',
    legal: '© 2026 SpaceDraw. Alle Rechte vorbehalten.',
    languageNote: 'Diese Seite ist in mehreren Sprachen verfügbar. Nutze deinen Browser oder die direkten Links unten.'
  },
  a11y: { skipToContent: 'Zum Inhalt springen', drawingCanvasAlt: 'Vorschau der SpaceDraw-Zeichenfläche', openMenu: 'Menü öffnen', playLink: 'Das SpaceDraw-Zeichenspiel spielen' }
};

T['ar'] = {
  dir: 'rtl',
  nav: { play: 'العب الآن', howToPlay: 'طريقة اللعب', wordLists: 'قوائم الكلمات', practice: 'التدريب' },
  hero: {
    eyebrow: 'لعبة رسم مجانية في المتصفح',
    ctaPrimary: 'العب الآن',
    ctaSecondary: 'طريقة اللعب',
    note: 'تعمل مباشرة في متصفحك — بدون تنزيل أو تسجيل.'
  },
  trust: ['بدون تنزيل', 'بدون تسجيل', 'جوال وكمبيوتر', 'كلمات مناسبة للعائلة'],
  howItWorks: {
    steps: [
      { title: 'اختر صورة رمزية', body: 'اختر واحدة من 10 صور رمزية أصلية واسمًا للعرض. لا يتم حفظ أي شيء على خادم.' },
      { title: 'احصل على كلمتك السرية', body: 'يختار الرسام من ثلاث كلمات ضمن فئة ومستوى صعوبة.' },
      { title: 'ارسم أو خمّن', body: 'ارسم الكلمة قبل انتهاء المؤقت، أو اكتب تخميناتك في الدردشة لتكسب نقاط السرعة.' }
    ]
  },
  features: {
    cards: [
      { title: 'طور التدريب الفردي', body: 'تدرّب ضد لاعبين محاكين دون انتظار امتلاء الغرفة.' },
      { title: 'غرف خاصة برمز', body: 'أنشئ غرفة وشارك رمزها. يملأ اللاعبون المحاكون الغرفة حاليًا؛ اللعب الجماعي المباشر قادم لاحقًا.' },
      { title: 'إعدادات الجولة', body: 'اضبط المؤقت وعدد الجولات ومستوى صعوبة الكلمات حسب مجموعتك.' },
      { title: 'قوائم كلمات حسب الصعوبة', body: 'تصفح قوائم كلمات مصنّفة حسب الفئة والمستوى (سهل، متوسط، صعب).' }
    ]
  },
  practice: { cta: 'ابدأ طور التدريب' },
  rooms: { cta: 'إنشاء غرفة', body: 'حدّد رمز الغرفة واختر قواعدك وابدأ الرسم. تعمل الغرف بلاعبين محاكين حاليًا — اللعب الجماعي في الوقت الفعلي تحديث قادم.' },
  mobile: { body: 'لوحة رسم تستجيب للمس بسلاسة على الجوال والحاسوب اللوحي والكمبيوتر، لتلعب في أي مكان دون تثبيت تطبيق.' },
  words: {
    note: 'قوائم الكلمات التجريبية متوفرة حاليًا بالإنجليزية؛ القوائم المترجمة قادمة قريبًا.',
    categories: [
      { name: 'حيوانات', sampleWords: ['قطة', 'فيل', 'فراشة'] },
      { name: 'طعام', sampleWords: ['بيتزا', 'آيس كريم', 'موزة'] },
      { name: 'أشياء', sampleWords: ['دراجة', 'مظلة', 'كاميرا'] }
    ]
  },
  faq: { note: 'إجابات سريعة على أكثر الأسئلة شيوعًا.' },
  footer: {
    tagline: 'لعبة ارسم وخمّن مجانية تعمل في متصفحك.',
    legal: '© 2026 SpaceDraw. جميع الحقوق محفوظة.',
    languageNote: 'هذه الصفحة متوفرة بعدة لغات. استخدم متصفحك أو الروابط المباشرة أدناه.'
  },
  a11y: { skipToContent: 'تخطَّ إلى المحتوى', drawingCanvasAlt: 'معاينة لوحة الرسم في SpaceDraw', openMenu: 'فتح القائمة', playLink: 'العب لعبة الرسم SpaceDraw' }
};

T['pt-BR'] = {
  dir: 'ltr',
  nav: { play: 'Jogar agora', howToPlay: 'Como jogar', wordLists: 'Listas de palavras', practice: 'Treinar' },
  hero: {
    eyebrow: 'Jogo de desenho grátis no navegador',
    ctaPrimary: 'Jogar agora',
    ctaSecondary: 'Como jogar',
    note: 'Funciona direto no seu navegador — sem baixar nem criar conta.'
  },
  trust: ['Sem download', 'Sem cadastro', 'Celular e PC', 'Palavras para a família'],
  howItWorks: {
    steps: [
      { title: 'Escolha um avatar', body: 'Selecione um dos 10 avatares originais e um nome. Nada é salvo em um servidor.' },
      { title: 'Receba sua palavra secreta', body: 'Quem desenha recebe três palavras para escolher por categoria e nível de dificuldade.' },
      { title: 'Desenhe ou adivinhe', body: 'Desenhe a palavra antes do tempo acabar, ou digite seus palpites no chat para ganhar pontos de velocidade.' }
    ]
  },
  features: {
    cards: [
      { title: 'Modo prática individual', body: 'Aqueça contra jogadores simulados sem esperar uma sala encher.' },
      { title: 'Salas privadas com código', body: 'Crie uma sala e compartilhe o código. Jogadores simulados preenchem a sala por enquanto; o multiplayer ao vivo chega depois.' },
      { title: 'Ajustes de rodada', body: 'Ajuste o tempo, o número de rodadas e a dificuldade das palavras conforme o seu grupo.' },
      { title: 'Listas de palavras por dificuldade', body: 'Explore listas de palavras por categoria e nível (fácil, médio, difícil).' }
    ]
  },
  practice: { cta: 'Iniciar modo prática' },
  rooms: { cta: 'Criar uma sala', body: 'Defina um código de sala, escolha suas regras e comece a desenhar. As salas funcionam com jogadores simulados por enquanto — o multiplayer em tempo real é uma atualização futura.' },
  mobile: { body: 'Uma tela de desenho que responde ao toque funciona bem em celular, tablet e computador, para jogar em qualquer lugar sem instalar um app.' },
  words: {
    note: 'As listas de palavras de demonstração estão em inglês por enquanto; as versões localizadas chegam em breve.',
    categories: [
      { name: 'Animais', sampleWords: ['gato', 'elefante', 'borboleta'] },
      { name: 'Comida', sampleWords: ['pizza', 'sorvete', 'banana'] },
      { name: 'Objetos', sampleWords: ['bicicleta', 'guarda-chuva', 'câmera'] }
    ]
  },
  faq: { note: 'Respostas rápidas para as perguntas mais comuns.' },
  footer: {
    tagline: 'Um jogo de desenhar e adivinhar grátis que roda no seu navegador.',
    legal: '© 2026 SpaceDraw. Todos os direitos reservados.',
    languageNote: 'Esta página está disponível em vários idiomas. Use o seu navegador ou os links diretos abaixo.'
  },
  a11y: { skipToContent: 'Ir para o conteúdo', drawingCanvasAlt: 'Prévia da tela de desenho do SpaceDraw', openMenu: 'Abrir menu', playLink: 'Jogar o jogo de desenho SpaceDraw' }
};

T['ru-RU'] = {
  dir: 'ltr',
  nav: { play: 'Играть', howToPlay: 'Как играть', wordLists: 'Списки слов', practice: 'Тренировка' },
  hero: {
    eyebrow: 'Бесплатная игра-рисовалка в браузере',
    ctaPrimary: 'Играть сейчас',
    ctaSecondary: 'Как играть',
    note: 'Работает прямо в браузере — без скачивания и регистрации.'
  },
  trust: ['Без скачивания', 'Без регистрации', 'Мобильные и ПК', 'Семейные наборы слов'],
  howItWorks: {
    steps: [
      { title: 'Выберите аватар', body: 'Выберите один из 10 оригинальных аватаров и имя. Ничего не хранится на сервере.' },
      { title: 'Получите секретное слово', body: 'Рисующий получает три слова на выбор по категории и уровню сложности.' },
      { title: 'Рисуйте или угадывайте', body: 'Нарисуйте слово, пока не истекло время, или пишите догадки в чат, чтобы получать очки за скорость.' }
    ]
  },
  features: {
    cards: [
      { title: 'Одиночный режим тренировки', body: 'Разомнитесь против смоделированных соперников, не ожидая заполнения лобби.' },
      { title: 'Приватные комнаты с кодом', body: 'Создайте комнату и поделитесь кодом. Пока лобби заполняют смоделированные игроки; живой мультиплеер появится позже.' },
      { title: 'Настройки раунда', body: 'Настройте таймер, число раундов и сложность слов под свою компанию.' },
      { title: 'Списки слов по сложности', body: 'Просматривайте наборы слов по категориям и уровням (лёгкий, средний, сложный).' }
    ]
  },
  practice: { cta: 'Запустить режим тренировки' },
  rooms: { cta: 'Создать комнату', body: 'Задайте код комнаты, выберите правила и начните рисовать. Пока комнаты работают со смоделированными игроками — многопользовательский режим в реальном времени появится в будущем обновлении.' },
  mobile: { body: 'Холст, реагирующий на касания, плавно работает на телефоне, планшете и компьютере — играйте где угодно без установки приложения.' },
  words: {
    note: 'Демо-наборы слов пока на английском; локализованные наборы скоро появятся.',
    categories: [
      { name: 'Животные', sampleWords: ['кот', 'слон', 'бабочка'] },
      { name: 'Еда', sampleWords: ['пицца', 'мороженое', 'банан'] },
      { name: 'Предметы', sampleWords: ['велосипед', 'зонт', 'фотоаппарат'] }
    ]
  },
  faq: { note: 'Быстрые ответы на самые частые вопросы.' },
  footer: {
    tagline: 'Бесплатная игра «рисуй и угадывай», работающая в браузере.',
    legal: '© 2026 SpaceDraw. Все права защищены.',
    languageNote: 'Эта страница доступна на нескольких языках. Используйте браузер или прямые ссылки ниже.'
  },
  a11y: { skipToContent: 'Перейти к содержанию', drawingCanvasAlt: 'Предпросмотр холста для рисования SpaceDraw', openMenu: 'Открыть меню', playLink: 'Играть в игру-рисовалку SpaceDraw' }
};

const codeToFile = {
  'en-US': 'home.en-US.json',
  'en-GB': 'home.en-GB.json',
  'fr-FR': 'home.fr-FR.json',
  'es-ES': 'home.es-ES.json',
  'de-DE': 'home.de-DE.json',
  'ar': 'home.ar.json',
  'pt-BR': 'home.pt-BR.json',
  'ru-RU': 'home.ru-RU.json',
};

let count = 0;
for (const [locale, body] of Object.entries(T)) {
  const obj = Object.assign({ schemaVersion: 1, locale: locale, reviewStatus: 'draft' }, body);
  const file = path.join(outDir, codeToFile[locale]);
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n', 'utf8');
  count++;
}
console.log('Wrote ' + count + ' i18n files');
console.log(fs.readdirSync(outDir).join('\n'));
