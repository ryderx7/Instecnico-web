(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var escapeHtml = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var normalizeForSearch = function (s) {
    return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };
  var initials = function (n) {
    return n.split(' ').filter(function (w) { return w.toLowerCase() !== 'de'; })
      .map(function (w) { return w[0]; }).slice(0, 2).join('');
  };
  var pad2 = function (n) { return String(n).padStart(2, '0'); };

  var ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  var IMG_EXT = '.png';

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = motionQuery.matches;
  if (motionQuery.addEventListener) motionQuery.addEventListener('change', function (e) { reduced = e.matches; });

  var PRE = [
    { f: 'tales-de-mileto', n: 'Tales de Mileto', e: 'c. 624–546 a. C.', s: 'Mileto · El agua',
      q: 'Todo está lleno de dioses.',
      d: 'Se le considera el primer filósofo: buscó el origen de todo en una sola sustancia natural, el agua, sin recurrir al mito. Importa más su gesto que su respuesta, porque explicó la naturaleza con razones. Se le atribuye haber anunciado el eclipse del 585 a. C.' },
    { f: 'anaximandro-de-mileto', n: 'Anaximandro de Mileto', e: 'c. 610–546 a. C.', s: 'Mileto · El ápeiron',
      q: 'El principio de los seres es lo ilimitado.',
      d: 'Discípulo de Tales, pensó que el origen no podía ser un elemento concreto sino el ápeiron, lo indeterminado, del que nacen y al que regresan los opuestos. Trazó uno de los primeros mapas del mundo y concibió la Tierra suspendida sin apoyo.' },
    { f: 'anaximenes-de-mileto', n: 'Anaxímenes de Mileto', e: 'c. 585–524 a. C.', s: 'Mileto · El aire',
      q: 'Así como el alma, que es aire, nos sostiene, el aliento envuelve todo el cosmos.',
      d: 'Eligió el aire como principio y explicó la variedad del mundo por rarefacción y condensación: enrarecido se vuelve fuego; condensado, viento, nube, agua y piedra. Fue el primero en explicar las diferencias cualitativas mediante cambios de cantidad.' },
    { f: 'heraclito-de-efeso', n: 'Heráclito de Éfeso', e: 'c. 540–480 a. C.', s: 'Éfeso · El devenir',
      q: 'No es posible bañarse dos veces en el mismo río.',
      d: 'Vio en el cambio constante la ley del mundo y en la tensión entre opuestos su armonía oculta. Llamó logos a la razón común que ordena todo, aunque casi nadie la escuche. Su estilo oracular le valió el apodo de «el Oscuro».' },
    { f: 'parmenides-de-elea', n: 'Parménides de Elea', e: 'c. 515–450 a. C.', s: 'Elea · El ser',
      q: 'El ser es, y el no ser no es.',
      d: 'Sostuvo que solo lo que es puede pensarse: nada surge de la nada ni deja de ser, y el cambio es apariencia. Su poema separó la vía de la verdad de la vía de la opinión y fundó la ontología, el estudio del ser.' },
    { f: 'democrito-de-abdera', n: 'Demócrito de Abdera', e: 'c. 460–370 a. C.', s: 'Abdera · El átomo',
      q: 'Por convención existe lo dulce y lo amargo; en realidad, solo átomos y vacío.',
      d: 'Junto con Leucipo explicó la realidad como átomos indivisibles que se mueven en el vacío. Sin finalidad ni intervención divina, color y sabor serían efectos de nuestra percepción. Intuyó sin laboratorio la idea que la física confirmaría siglos después.' }
  ];

  var TIMELINE = [
    {
      type: 'interlude', id: 'asombro', number: '01', tone: 'cream',
      eyebrow: 'Concepto · 01',
      title: 'El asombro',
      lead: 'Antes de cualquier método hay una pausa. Algo deja de parecer obvio.',
      body: 'El asombro no es ignorancia: es la decisión de no dar por sentado. Los griegos llamaron thaumázein a ese primer movimiento, una mezcla de extrañeza y curiosidad ante lo que está delante. Sin esa pausa no nacen preguntas; sin preguntas, el conocimiento se vuelve repetición.',
      prompt: '¿Cuándo fue la última vez que algo te pareció, de verdad, extraño?'
    },
    {
      type: 'period', id: 'atenas', title: 'Atenas, la edad de oro',
      intro: 'Del siglo V al IV a. C., la pregunta pasa del cosmos al ser humano y a la vida buena.',
      philosophers: [
        { f: 'socrates', n: 'Sócrates', e: 'c. 470–399 a. C.', s: 'Atenas · La pregunta como método',
          q: 'Una vida sin examen no merece ser vivida.',
          d: 'No escribió una sola línea: filosofó conversando. Preguntaba hasta que las certezas aparentes se mostraban frágiles, y con ese método, la ironía y la mayéutica, volvió la mirada de la naturaleza a la vida humana. Condenado por impiedad y por corromper a la juventud, aceptó la cicuta.' },
        { f: 'platon', n: 'Platón', e: 'c. 427–347 a. C.', s: 'Atenas · Idealismo',
          q: 'El tiempo es la imagen móvil de la eternidad.',
          d: 'Fundó la Academia y dejó diálogos donde Sócrates piensa en voz alta. Su teoría de las Ideas sostiene que lo sensible participa de formas inteligibles y eternas; la alegoría de la caverna narra el tránsito de la apariencia al conocimiento. En La República imaginó una ciudad gobernada por la justicia.' },
        { f: 'aristoteles', n: 'Aristóteles', e: '384–322 a. C.', s: 'Atenas · Realismo y lógica',
          q: 'Todos los hombres desean por naturaleza saber.',
          d: 'Discípulo de Platón y maestro de Alejandro Magno, fundó el Liceo. Sistematizó la lógica, estudió la vida con rigor de naturalista y entendió la ética como el cultivo de hábitos virtuosos que conducen a la eudaimonía, la vida plena. Buscó la forma dentro de las cosas mismas.' }
      ]
    },
    {
      type: 'interlude', id: 'medio-justo', number: '02', tone: 'dark',
      eyebrow: 'Concepto · 02',
      title: 'El medio justo',
      lead: 'La virtud no vive en los extremos, sino en el punto de equilibrio que cada situación exige.',
      body: 'Aristóteles entendió la virtud como un punto medio entre dos excesos: el valor entre la cobardía y la temeridad, la generosidad entre la avaricia y la prodigalidad. Ese medio no es promedio ni tibieza; es la medida justa que cada circunstancia pide. No se aprende de memoria: se cultiva con el hábito, día a día.',
      prompt: '¿En qué parte de tu vida necesitas encontrar el medio justo?'
    },
    {
      type: 'period', id: 'roma-medieval', title: 'Roma y la Edad Media',
      intro: 'La razón dialoga con la fe y aprende a sostenerse en la adversidad.',
      philosophers: [
        { f: 'seneca', n: 'Séneca', e: 'c. 4 a. C.–65 d. C.', s: 'Roma · Estoicismo',
          q: 'No es que tengamos poco tiempo, sino que perdemos mucho.',
          d: 'Estoico, escritor y consejero de Nerón. Sus Cartas a Lucilio son un manual de vida: dominar las pasiones, administrar el tiempo y prepararse para la adversidad. Obligado por el emperador a quitarse la vida, murió, según Tácito, con una serenidad coherente con su obra.' },
        { f: 'agustin-de-hipona', n: 'Agustín de Hipona', e: '354–430', s: 'Hipona · Patrística',
          q: 'Nos hiciste para ti, y nuestro corazón está inquieto hasta que descanse en ti.',
          d: 'Unió la fe cristiana con la herencia platónica. Sus Confesiones inauguran la introspección en Occidente y su reflexión sobre el tiempo y la memoria sigue siendo estudiada; en La ciudad de Dios leyó la historia como la tensión entre dos amores.' },
        { f: 'tomas-de-aquino', n: 'Tomás de Aquino', e: '1225–1274', s: 'París y Nápoles · Escolástica',
          q: 'La gracia no destruye la naturaleza, sino que la perfecciona.',
          d: 'En la Suma teológica sintetizó el pensamiento de Aristóteles con la fe cristiana. Defendió que razón y fe no se contradicen y que la razón humana puede alcanzar verdades por sí misma, una idea decisiva para el nacimiento de la universidad y de la ciencia medieval.' }
      ]
    },
    {
      type: 'interlude', id: 'cuidado-de-si', number: '03', tone: 'dark',
      eyebrow: 'Concepto · 03',
      title: 'El cuidado de sí',
      lead: 'Antes de gobernar el mundo, hay que aprender a gobernarse.',
      body: 'Estoicos como Séneca entendieron la filosofía como una práctica diaria: examinar la jornada, distinguir lo que depende de uno de lo que no, y preparar el ánimo para la adversidad. No es egoísmo ni autoayuda: es la base desde la cual se puede cuidar de los demás con criterio y serenidad.',
      prompt: '¿Qué hábito pequeño te ayudaría hoy a estar más presente en tu propia vida?'
    },
    {
      type: 'period', id: 'modernidad', title: 'La modernidad',
      intro: 'La razón se vuelve sobre sí misma y se pregunta cuáles son sus límites.',
      philosophers: [
        { f: 'rene-descartes', n: 'René Descartes', e: '1596–1650', s: 'Francia · Racionalismo',
          q: 'Pienso, luego existo.',
          d: 'Dudó de todo para encontrar una certeza irrebatible y la halló en el acto mismo de pensar. Desde el cogito reconstruyó el conocimiento con un método de claridad y orden, y planteó la separación entre mente y cuerpo. Inaugura la filosofía moderna; también creó la geometría analítica.' },
        { f: 'immanuel-kant', n: 'Immanuel Kant', e: '1724–1804', s: 'Königsberg · Criticismo',
          q: 'Atrévete a saber.',
          d: 'Preguntó qué podemos conocer, qué debemos hacer y qué nos cabe esperar. Mostró que el conocimiento nace de la experiencia ordenada por estructuras de la mente y, en su ética, formuló el imperativo categórico: actuar solo según principios universalizables y tratar a la humanidad siempre como fin.' }
      ]
    },
    {
      type: 'interlude', id: 'conocimiento', number: '04', tone: 'cream',
      eyebrow: 'Concepto · 04',
      title: 'Saber hacer con lo que se sabe',
      lead: 'Conocer no es acumular datos; es poder actuar con sentido en el mundo.',
      body: 'Una persona sabe algo de verdad cuando puede usarlo frente a un problema nuevo, adaptarlo a un contexto, explicarlo a otros. El conocimiento vive en la práctica: en cómo se aplica, no solo en cuánto se recuerda. Por eso aprender un oficio, resolver un caso, escribir con claridad o enseñar son formas de conocer tan rigurosas como memorizar una fórmula.',
      prompt: '¿Qué sabes hoy que no podrías explicar ni usar fuera del examen?'
    },
    {
      type: 'period', id: 'siglos-xx', title: 'Los siglos XIX y XX',
      intro: 'La duda llega a los valores, al lenguaje y a la condición humana.',
      philosophers: [
        { f: 'friedrich-nietzsche', n: 'Friedrich Nietzsche', e: '1844–1900', s: 'Alemania · Crítica de los valores',
          q: 'Quien tiene un porqué para vivir encontrará casi siempre el cómo.',
          d: 'Cuestionó la moral heredada y la confianza en verdades absolutas, y diagnosticó la crisis de sentido de la modernidad. Invitó a crear valores propios y a superarse a sí mismo. Escribió en aforismos que todavía incomodan y estimulan.' },
        { f: 'ludwig-wittgenstein', n: 'Ludwig Wittgenstein', e: '1889–1951', s: 'Viena y Cambridge · Filosofía del lenguaje',
          q: 'Los límites de mi lenguaje significan los límites de mi mundo.',
          d: 'En el Tractatus describió el lenguaje como imagen de los hechos; después, en las Investigaciones filosóficas, sostuvo que el significado nace del uso en «juegos de lenguaje». Dos filosofías distintas de un mismo autor que transformaron el pensamiento del siglo XX.' },
        { f: 'simone-de-beauvoir', n: 'Simone de Beauvoir', e: '1908–1986', s: 'París · Existencialismo y feminismo',
          q: 'No se nace mujer: se llega a serlo.',
          d: 'En El segundo sexo analizó cómo la sociedad construye la condición de las mujeres y abrió el camino del pensamiento feminista contemporáneo. Su ética existencialista defiende que la libertad propia solo se realiza cuando se respeta y se promueve la de los demás.' }
      ]
    }
  ];

  var CONCEPTS = [
    { id: 'biblioteca-conocimiento', title: 'El conocimiento y sus límites', short: 'Qué podemos saber, cómo lo sabemos y hasta dónde llega.', group: 'A',
      body: ['El conocimiento no es una acumulación de datos sino un tejido de razones. Desde Sócrates, la pregunta por el saber es también la pregunta por lo que creemos saber. Kant añadió un límite decisivo: solo conocemos fenómenos —lo que se nos aparece bajo las formas del espacio, el tiempo y las categorías—, no las cosas en sí mismas.',
        'Reconocer los límites del conocimiento es una virtud epistémica, no una derrota. Permite distinguir la opinión de la evidencia, la hipótesis del hecho, el dato de la interpretación. En un mundo de información abundante, saber qué no sabemos es una competencia tan técnica como cualquier otra.'],
      source: 'Kant, Crítica de la razón pura; Platón, Teeteto',
      related: ['biblioteca-duda', 'biblioteca-verdad'],
      exercises: ['¿Qué distingue una opinión bien fundada de un prejuicio?', '¿Qué tipo de cosas no se pueden saber con certeza?'] },

    { id: 'biblioteca-duda', title: 'La duda metódica', short: 'Dudar no para negar, sino para encontrar un suelo firme.', group: 'A',
      body: ['Descartes llevó la duda al extremo: si un genio maligno pudiera engañarnos sobre todo, ¿qué quedaría en pie? La respuesta fue el cogito: incluso al dudar, estoy pensando, y si pienso, existo. La duda no era escepticismo final sino un método para reconstruir el conocimiento sobre bases indudables.',
        'La duda metódica se practica hoy en el laboratorio, en el taller y en el código: reproducir un fallo, aislar variables, verificar supuestos. No es parálisis: es una forma disciplinada de avanzar.'],
      source: 'Descartes, Meditaciones metafísicas',
      related: ['biblioteca-conocimiento', 'biblioteca-verdad'],
      exercises: ['¿Qué creencia tuya resistiría una duda radical?', '¿Qué diferencia hay entre dudar y no querer saber?'] },

    { id: 'biblioteca-verdad', title: 'La verdad y sus formas', short: 'Correspondencia, coherencia, pragmática: tres maneras de decir «es verdad».', group: 'A',
      body: ['Decir que algo es verdad puede significar tres cosas distintas: que se corresponde con los hechos (verdad como adecuación), que es coherente con el resto de lo que sabemos (verdad como consistencia), o que funciona en la práctica (verdad como utilidad). Cada teoría ilumina un aspecto y oculta otro.',
        'En ciencias se busca correspondencia y coherencia; en ingeniería, que algo funcione es un criterio fuerte; en ética, la verdad se juega en la honestidad del diálogo. Reconocer qué tipo de verdad se está pidiendo evita discusiones estériles.'],
      source: 'Aristóteles, Metafísica; William James, Pragmatismo',
      related: ['biblioteca-conocimiento', 'biblioteca-dialogo'],
      exercises: ['¿Es lo mismo «verdadero» que «útil»?', '¿Puede haber dos verdades contradictorias?'] },

    { id: 'biblioteca-lenguaje', title: 'El lenguaje como límite del mundo', short: 'Pensamos con palabras: lo que no se puede decir, no se puede pensar del todo.', group: 'A',
      body: ['Wittgenstein sostuvo en el Tractatus que «los límites de mi lenguaje significan los límites de mi mundo». Lo que no tiene una forma decible se resiste al pensamiento. Después, en las Investigaciones, matizó: el significado no está en una definición oculta sino en el uso, en los «juegos de lenguaje» que practicamos.',
        'Aprender un oficio es aprender su vocabulario: nombrar bien una pieza, un error, un proceso, es la mitad del diagnóstico. El lenguaje técnico no es jerga ornamental: es una herramienta de precisión.'],
      source: 'Wittgenstein, Tractatus e Investigaciones filosóficas',
      related: ['biblioteca-conocimiento', 'biblioteca-dialogo'],
      exercises: ['¿Qué palabra cambiaría tu manera de ver un problema?', '¿Qué experiencias son difíciles de poner en palabras?'] },

    { id: 'biblioteca-virtud', title: 'La virtud como hábito', short: 'No nacemos buenos: nos hacemos buenos haciendo ciertas cosas.', group: 'B',
      body: ['Para Aristóteles, la virtud (areté) es un hábito, no un don. Se aprende como se aprende a tocar un instrumento: practicando, equivocándose, corrigiendo. La virtud ocupa un punto medio entre dos extremos —el valor entre la cobardía y la temeridad— y se cultiva con la repetición sostenida.',
        'Esto tiene consecuencias concretas para un estudiante: la puntualidad, la paciencia, la atención al detalle o la honestidad técnica no son rasgos de carácter fijo, sino prácticas que se pueden entrenar. La pregunta no es «¿soy ordenado?» sino «¿estoy practicando el orden?».'],
      source: 'Aristóteles, Ética a Nicómaco',
      related: ['biblioteca-cuidado', 'biblioteca-libertad'],
      exercises: ['¿Qué hábito pequeño cambiaría más tu semana?', '¿Dónde está el punto medio entre exigirte demasiado y no exigirte nada?'] },

    { id: 'biblioteca-cuidado', title: 'El cuidado de sí', short: 'Antes de gobernar el mundo, hay que aprender a gobernarse.', group: 'B',
      body: ['Séneca y los estoicos entendieron la filosofía como una práctica diaria: examinar la jornada, distinguir lo que depende de uno de lo que no, y preparar el ánimo para la adversidad. Foucault llamó la atención sobre esta tradición como «cuidado de sí»: un trabajo sobre uno mismo que hace posible el cuidado de los demás.',
        'No se trata de autoayuda ni de introspección infinita. Se trata de cultivar la atención, la templanza y la claridad sobre los propios límites. Un técnico que cuida su descanso, su cuerpo y su tiempo trabaja mejor y cuida mejor a quienes dependen de su trabajo.'],
      source: 'Séneca, Cartas a Lucilio; Foucault, La hermenéutica del sujeto',
      related: ['biblioteca-virtud', 'biblioteca-sentido'],
      exercises: ['¿Qué hábito pequeño te devuelve al centro?', '¿Cómo distingues lo que depende de ti de lo que no?'] },

    { id: 'biblioteca-libertad', title: 'La libertad y la responsabilidad', short: 'Ser libre no es hacer lo que quiero: es asumir lo que hago.', group: 'B',
      body: ['Para el existencialismo, la libertad es ineludible: incluso cuando no elegimos nuestra situación, elegimos cómo responder a ella. Sartre llamó a esto «condenados a ser libres». La libertad no es capricho: es responsabilidad, porque al elegir por mí estoy eligiendo también una manera de estar en el mundo.',
        'Beauvoir radicalizó la idea: mi libertad solo se realiza plenamente cuando se respeta y se promueve la de los demás. Una libertad que se construye sobre la opresión de otros es, en el fondo, una libertad mutilada.'],
      source: 'Sartre, El existencialismo es un humanismo; Beauvoir, El segundo sexo',
      related: ['biblioteca-virtud', 'biblioteca-justicia'],
      exercises: ['¿Qué elección tuya afecta a otros que no ves?', '¿Qué significa ser responsable de algo que no elegiste?'] },

    { id: 'biblioteca-justicia', title: 'La justicia como problema', short: 'No es solo dar a cada uno lo suyo: es decidir qué es «lo suyo».', group: 'B',
      body: ['Desde La República de Platón, la justicia es el problema central de la filosofía política. Platón la imaginó como armonía entre las partes del alma y de la ciudad. Rawls, en el siglo XX, la reformuló con un experimento mental: ¿qué reglas aceptaríamos si no supiéramos qué lugar ocuparemos en la sociedad?',
        'Ese «velo de ignorancia» permite distinguir la justicia del mero interés. En el trabajo cotidiano, decidir un turno, evaluar a alguien, repartir tareas: todas son pequeñas decisiones de justicia que piden razones, no solo preferencias.'],
      source: 'Platón, La República; John Rawls, Teoría de la justicia',
      related: ['biblioteca-libertad', 'biblioteca-dialogo'],
      exercises: ['¿Qué regla aceptarías sin saber qué lugar ocuparás?', '¿Es justo tratar igual a quienes son distintos?'] },

    { id: 'biblioteca-asombro', title: 'La capacidad de asombro', short: 'El punto de partida de toda pregunta filosófica.', group: 'C',
      body: ['El asombro (thaumázein en griego) no es ignorancia: es la decisión de no dar por sentado lo que parece obvio. Platón y Aristóteles coincidieron en señalarlo como el origen de la filosofía: algo deja de parecer evidente y nos obliga a preguntar.',
        'Para un estudiante técnico, cultivar el asombro significa desconfiar de la primera explicación, preguntar por qué las cosas funcionan como funcionan. Es el músculo que hace posible el diagnóstico, la depuración y el diseño.'],
      source: 'Platón, Teeteto 155d; Aristóteles, Metafísica I, 982b',
      related: ['biblioteca-duda', 'biblioteca-conocimiento'],
      exercises: ['¿Cuándo fue la última vez que algo te pareció, de verdad, extraño?', '¿Qué das por cierto solo porque siempre fue así?'] },

    { id: 'biblioteca-sentido', title: 'La pregunta por el sentido', short: '¿Para qué vivir? La pregunta no se responde con una fórmula.', group: 'C',
      body: ['Nietzsche diagnosticó que los valores heredados se habían vuelto frágiles: «Dios ha muerto», escribió, no como celebración sino como diagnóstico. Si los valores no vienen dados, hay que crearlos. Frankl, sobreviviente de los campos de concentración, mostró que incluso en las peores condiciones el ser humano busca un sentido que lo sostenga.',
        'La pregunta por el sentido no se responde de una vez para siempre: se responde en cada decisión, en cada compromiso. No es «¿cuál es el sentido de la vida?» sino «¿qué sentido tiene lo que estoy haciendo hoy?».'],
      source: 'Nietzsche, La gaya ciencia; Viktor Frankl, El hombre en busca de sentido',
      related: ['biblioteca-libertad', 'biblioteca-cuidado'],
      exercises: ['¿Qué te sostiene en los días difíciles?', '¿Qué harías si supieras que nadie te va a juzgar?'] },

    { id: 'biblioteca-tecnica', title: 'La técnica y lo humano', short: 'Las herramientas no son neutrales: moldean lo que podemos pensar y hacer.', group: 'C',
      body: ['Heidegger advirtió que la técnica moderna no es solo un conjunto de instrumentos: es una manera de mirar el mundo, de convertir todo en recurso disponible. Ellul, en paralelo, describió la «sociedad tecnológica» como un sistema que se optimiza a sí mismo y puede dejar de preguntarse por sus fines.',
        'Para un técnico, esto es una invitación permanente: no solo «¿puedo hacerlo?», sino también «¿para qué?», «¿a quién afecta?», «¿qué se pierde?». La técnica es una forma de saber; la pregunta por sus fines es una forma de sabiduría.'],
      source: 'Heidegger, La pregunta por la técnica; Jacques Ellul, La técnica',
      related: ['biblioteca-sentido', 'biblioteca-justicia'],
      exercises: ['¿Qué herramienta usas a diario y qué ha cambiado en ti?', '¿Qué preguntarías antes de aceptar una tecnología nueva?'] },

    { id: 'biblioteca-dialogo', title: 'El diálogo como método', short: 'Pensar en voz alta, con otros, es la forma originaria de la filosofía.', group: 'C',
      body: ['Sócrates no dejó textos: dejó conversaciones. Su método, la mayéutica, consistía en ayudar a otros a parir sus propias ideas, examinando una a una las certezas hasta que mostraran su fragilidad. El diálogo no es un intercambio de opiniones: es un esfuerzo común por acercarse a lo verdadero.',
        'En el aula, en el taller, en la familia, el diálogo sigue siendo una tecnología social sofisticada: supone escucha, tolerancia a la corrección y disposición a cambiar de idea. Es lo contrario de la discusión como combate.'],
      source: 'Platón, diálogos socráticos (Apología, Menón, Teeteto)',
      related: ['biblioteca-asombro', 'biblioteca-verdad'],
      exercises: ['¿Cuándo fue la última vez que cambiaste de opinión por una conversación?', '¿Qué necesitas para escuchar sin preparar la respuesta?'] }
  ];

  var CONCEPT_GROUPS = { A: 'Cómo conocemos', B: 'Cómo vivimos', C: 'Cómo existimos' };

  var SEARCH_SUGGESTIONS = [
    { label: 'Sócrates', id: 'socrates' },
    { label: 'El asombro', id: 'concepto-asombro' },
    { label: 'Presocráticos', id: 'presocraticos' },
    { label: 'La virtud', id: 'biblioteca-virtud' },
    { label: 'Atenas', id: 'periodo-atenas' }
  ];

  var HISTORY_KEY = 'fil_recent_searches_v2';
  var MAX_HISTORY = 5;

  function loadHistory() {
    try {
      var raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(function (x) { return typeof x === 'string'; }) : [];
    } catch (e) { return []; }
  }
  function saveHistory(arr) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(arr)); } catch (e) {}
  }
  function pushHistory(query) {
    var q = String(query || '').trim();
    if (!q) return;
    var norm = normalizeForSearch(q);
    var prev = loadHistory().filter(function (x) { return normalizeForSearch(x) !== norm; });
    saveHistory([q].concat(prev).slice(0, MAX_HISTORY));
  }
  function removeHistory(query) {
    var norm = normalizeForSearch(query);
    saveHistory(loadHistory().filter(function (x) { return normalizeForSearch(x) !== norm; }));
  }
  function clearHistory() { saveHistory([]); }

  function renderPre() {
    var grid = $('[data-pre-grid]');
    if (!grid || grid.children.length > 0) return;
    grid.innerHTML = PRE.map(function (o, i) {
      var photoPath = 'assets/images/filosofos/' + o.f + IMG_EXT;
      return '<article class="pre-card" id="' + escapeHtml(o.f) + '" tabindex="-1" data-pre-index="' + i + '" data-num="' + pad2(i + 1) + '" style="--di:' + (i % 2) + '">' +
        '<figure class="pre-photo" data-initials="' + escapeHtml(initials(o.n)) + '">' +
          '<img src="' + escapeHtml(photoPath) + '" alt="Busto de ' + escapeHtml(o.n) + '" width="400" height="500" ' + 'loading="lazy"' + ' decoding="async" data-fallback>' +
        '</figure>' +
        '<div class="pre-info">' +
          '<span class="pre-num" aria-hidden="true">' + pad2(i + 1) + '</span>' +
          '<h3 class="pre-name">' + escapeHtml(o.n) + '</h3>' +
          '<span class="pre-sub">' + escapeHtml(o.e) + ' · ' + escapeHtml(o.s) + '</span>' +
          '<blockquote class="pre-quote"><p>' + escapeHtml(o.q) + '</p></blockquote>' +
          '<p class="pre-desc">' + escapeHtml(o.d) + '</p>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  function buildPreNav() {
    var dots = $('[data-pre-dots]');
    if (!dots) return;
    dots.innerHTML = PRE.map(function (o, i) {
      return '<button class="pre-dot-btn' + (i === 0 ? ' is-active' : '') + '" type="button" data-dot-index="' + i + '" aria-label="Ir a ' + escapeHtml(o.n) + '"' + (i === 0 ? ' aria-current="true"' : '') + '><span class="pre-dot"></span></button>';
    }).join('');
  }

  function renderTimeline() {
    var main = $('[data-main]');
    if (!main) return;
    var existing = main.querySelector('.period, .interlude');
    if (existing) return;
    var html = '';
    var n = PRE.length;
    var periodIndex = 0;
    TIMELINE.forEach(function (it) {
      if (it.type === 'interlude') {
        html += '<section class="interlude interlude--' + it.tone + '" id="concepto-' + escapeHtml(it.id) + '" aria-labelledby="h-' + escapeHtml(it.id) + '">' +
          '<span class="interlude-mark" aria-hidden="true">' + escapeHtml(it.number) + '</span>' +
          '<div class="wrap"><div class="interlude-inner">' +
            '<span class="interlude-eyebrow">' + escapeHtml(it.eyebrow) + '</span>' +
            '<h2 id="h-' + escapeHtml(it.id) + '">' + escapeHtml(it.title) + '</h2>' +
            '<p class="interlude-lead">' + escapeHtml(it.lead) + '</p>' +
            '<p class="interlude-body">' + escapeHtml(it.body) + '</p>' +
            '<div class="interlude-think"><span>Para pensar</span><p>' + escapeHtml(it.prompt) + '</p></div>' +
          '</div></div>' +
        '</section>';
      } else {
        var roman = ROMAN[periodIndex++] || '—';
        html += '<section class="period" id="periodo-' + escapeHtml(it.id) + '" aria-labelledby="h-' + escapeHtml(it.id) + '">' +
          '<div class="wrap">' +
            '<header class="period-head">' +
              '<span class="period-roman"><strong>' + roman + '</strong> · Periodo</span>' +
              '<h2 id="h-' + escapeHtml(it.id) + '">' + escapeHtml(it.title) + '</h2>' +
              '<p>' + escapeHtml(it.intro) + '</p>' +
              '<span class="period-line" aria-hidden="true"></span>' +
            '</header>' +
            '<div class="period-rows">';
        it.philosophers.forEach(function (p, i) {
          n++;
          var photoPath = 'assets/images/filosofos/' + p.f + IMG_EXT;
          html += '<article class="ph-row' + (i % 2 ? ' flip' : '') + '" id="' + escapeHtml(p.f) + '" tabindex="-1">' +
            '<span class="ph-node" aria-hidden="true"></span>' +
            '<div class="ph-row-inner">' +
              '<figure class="ph-figure">' +
                '<span class="ph-mono" aria-hidden="true">' + escapeHtml(initials(p.n)) + '</span>' +
                '<span class="ph-zoom"><img class="ph-img" src="' + escapeHtml(photoPath) + '" alt="Retrato de ' + escapeHtml(p.n) + '" width="640" height="800" loading="lazy" decoding="async" fetchpriority="low" data-fallback></span>' +
              '</figure>' +
              '<div class="ph-body">' +
                '<p class="ph-meta"><span class="num">' + pad2(n) + '</span><span>' + escapeHtml(p.e) + '</span><span>' + escapeHtml(p.s) + '</span></p>' +
                '<h3 class="ph-name" tabindex="-1">' + escapeHtml(p.n) + '</h3>' +
                '<blockquote class="ph-quote"><p>' + escapeHtml(p.q) + '</p></blockquote>' +
                '<p class="ph-desc">' + escapeHtml(p.d) + '</p>' +
              '</div>' +
            '</div>' +
          '</article>';
        });
        html += '</div></div></section>';
      }
    });
    main.innerHTML = html;
  }

  function buildMenu() {
    var body = $('[data-menu-body]');
    if (!body) return;
    var concepts = TIMELINE.filter(function (t) { return t.type === 'interlude'; });
    var periods = TIMELINE.filter(function (t) { return t.type === 'period'; });
    body.innerHTML =
      '<div class="nav-menu-col">' +
        '<span class="nav-menu-h">Introducción</span>' +
        '<a href="#que-es-filosofia" data-go="que-es-filosofia"><i>·</i>¿Qué es la filosofía?</a>' +
        '<span class="nav-menu-h">Conceptos</span>' +
        concepts.map(function (c) {
          return '<a href="#concepto-' + escapeHtml(c.id) + '" data-go="concepto-' + escapeHtml(c.id) + '"><i>' + escapeHtml(c.number) + '</i>' + escapeHtml(c.title) + '</a>';
        }).join('') +
        '<span class="nav-menu-h">Principios</span>' +
        '<a href="#principio-asombro" data-go="principio-asombro"><i>01</i>Asombro</a>' +
        '<a href="#principio-duda" data-go="principio-duda"><i>02</i>Duda</a>' +
        '<a href="#principio-argumento" data-go="principio-argumento"><i>03</i>Argumento</a>' +
      '</div>' +
      '<div class="nav-menu-col">' +
        '<span class="nav-menu-h">Periodos</span>' +
        '<a href="#presocraticos" data-go="presocraticos"><i>—</i>Los presocráticos</a>' +
        periods.map(function (p, i) {
          return '<a href="#periodo-' + escapeHtml(p.id) + '" data-go="periodo-' + escapeHtml(p.id) + '"><i>' + (ROMAN[i] || '—') + '</i>' + escapeHtml(p.title) + '</a>';
        }).join('') +
      '</div>';
  }

  function renderConceptsOverlay() {
    var body = $('[data-concepts-body]');
    if (!body) return;
    var order = ['A', 'B', 'C'];
    var html = '';
    order.forEach(function (g) {
      var list = CONCEPTS.filter(function (c) { return c.group === g; });
      if (!list.length) return;
      html += '<div class="concepts-group">' +
        '<h3>' + escapeHtml(CONCEPT_GROUPS[g]) + '</h3>' +
        '<div class="concepts-grid">';
      list.forEach(function (c) {
        var bodyParas = c.body.map(function (p) { return '<p>' + escapeHtml(p) + '</p>'; }).join('');
        var ex = c.exercises.map(function (x) { return '<li>' + escapeHtml(x) + '</li>'; }).join('');
        var rel = c.related.map(function (id) {
          var t = CONCEPTS.filter(function (x) { return x.id === id; })[0];
          if (!t) return '';
          return '<button class="concept-chip" type="button" data-related="' + escapeHtml(id) + '">' + escapeHtml(t.title) + '</button>';
        }).join('');
        html += '<details class="concept-card" id="' + escapeHtml(c.id) + '" data-concept>' +
          '<summary><span class="concept-title">' + escapeHtml(c.title) + '</span><span class="concept-short">' + escapeHtml(c.short) + '</span></summary>' +
          '<div class="concept-content"><div class="concept-content-inner">' +
            '<div class="concept-body">' +
              bodyParas +
              '<div class="concept-source"><b>Fuente</b>' + escapeHtml(c.source) + '</div>' +
              '<div class="concept-source"><b>Para pensar</b><ul class="concept-ex">' + ex + '</ul></div>' +
              (rel ? '<div class="concept-related">' + rel + '</div>' : '') +
            '</div>' +
          '</div></div>' +
        '</details>';
      });
      html += '</div></div>';
    });
    body.innerHTML = html;
  }

  function buildIndex() {
    var idx = [];
    PRE.forEach(function (o) {
      idx.push({
        type: 'Filósofos', title: o.n, sub: o.e + ' · ' + o.s, id: o.f,
        haystack: normalizeForSearch([o.n, o.e, o.s, o.q, o.d].join(' '))
      });
    });
    TIMELINE.forEach(function (it) {
      if (it.type === 'period') {
        idx.push({
          type: 'Periodos', title: it.title, sub: it.intro, id: 'periodo-' + it.id,
          haystack: normalizeForSearch(it.title + ' ' + it.intro)
        });
        it.philosophers.forEach(function (o) {
          idx.push({
            type: 'Filósofos', title: o.n, sub: o.e + ' · ' + o.s, id: o.f,
            haystack: normalizeForSearch([o.n, o.e, o.s, o.q, o.d].join(' '))
          });
        });
      } else {
        idx.push({
          type: 'Conceptos', title: it.title, sub: it.lead, id: 'concepto-' + it.id,
          haystack: normalizeForSearch(it.title + ' ' + it.lead + ' ' + it.body)
        });
      }
    });
    CONCEPTS.forEach(function (c) {
      idx.push({
        type: 'Conceptos', title: c.title, sub: c.short, id: c.id,
        haystack: normalizeForSearch(c.title + ' ' + c.short + ' ' + c.body.join(' '))
      });
    });
    [['Asombro', 'principio-asombro'], ['Duda', 'principio-duda'], ['Argumento', 'principio-argumento']].forEach(function (p) {
      idx.push({
        type: 'Conceptos', title: p[0], sub: 'Principio de la filosofía', id: p[1],
        haystack: normalizeForSearch(p[0] + ' principio')
      });
    });
    idx.push({
      type: 'Conceptos',
      title: '¿Qué es la filosofía?',
      sub: 'Preguntar, razonar y examinar: la filosofía como actividad.',
      id: 'que-es-filosofia',
      haystack: normalizeForSearch('qué es la filosofía definición asombro thaumazein thaumázein pensar razones preguntar razonar examinar Mileto siglo VI Sócrates')
    });
    idx.forEach(function (x) { x.titleFold = normalizeForSearch(x.title); });
    return idx;
  }

  function attachImageFallbacks(root) {
    $$('img[data-fallback]', root).forEach(function (img) {
      var handle = function () {
        if (img.dataset.failed === '1') return;
        img.dataset.failed = '1';
        img.hidden = true;
        var fig = img.closest('.ph-figure') || img.closest('.pre-photo');
        if (fig) fig.classList.add('has-fallback');
      };
      img.addEventListener('error', handle, { once: true });
      if (img.complete && img.naturalWidth === 0) handle();
    });
  }

  function splitHeroTitle() {
    var word = $('[data-split-word]');
    if (!word) return;
    var text = word.textContent || '';
    word.textContent = '';
    var frag = document.createDocumentFragment();
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); continue; }
      var wrap = document.createElement('span');
      wrap.className = 'hero-letter';
      var inner = document.createElement('span');
      inner.className = 'hero-letter-inner';
      inner.textContent = ch;
      inner.style.setProperty('--i', String(i));
      wrap.appendChild(inner);
      frag.appendChild(wrap);
    }
    word.appendChild(frag);
  }

  function splitHeroLead() {
    var el = $('[data-split-words]');
    if (!el || reduced || window.matchMedia('(max-width: 720px)').matches) return;
    var text = (el.textContent || '').trim();
    var words = text.split(/\s+/);
    el.textContent = '';
    var frag = document.createDocumentFragment();
    words.forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'word';
      span.textContent = w;
      span.style.setProperty('--wi', String(i));
      frag.appendChild(span);
      if (i < words.length - 1) frag.appendChild(document.createTextNode(' '));
    });
    el.appendChild(frag);
  }

  function setupParallax(hero) {
    var layer = $('[data-parallax]');
    if (!hero || !layer || !('IntersectionObserver' in window)) return;
    var coarse = window.matchMedia('(pointer: coarse), (max-width: 720px)').matches;
    var raf = 0, visible = false;
    var apply = function () {
      raf = 0;
      layer.style.setProperty('--py', (Math.min(window.scrollY || 0, hero.offsetHeight) * 0.18).toFixed(1) + 'px');
    };
    var request = function () { if (visible && !raf) raf = requestAnimationFrame(apply); };
    if (!reduced && !coarse) window.addEventListener('scroll', request, { passive: true });
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      hero.classList.toggle('is-offscreen', !visible);
      if (!reduced && !coarse) layer.classList.toggle('is-live', visible);
      if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
      else if (visible) request();
    }).observe(hero);
  }

  var INTRO_KEY = 'fil_intro_played';
  var TOUR_KEY = 'fil_tour_played';
  var flag = function (k) { try { return !!localStorage.getItem(k); } catch (e) { return false; } };
  var setFlag = function (k) { try { localStorage.setItem(k, '1'); } catch (e) {} };

  function setupIntro(tour) {
    var intro = $('[data-intro]');
    if (!intro) return;
    var root = document.documentElement;
    if (!root.classList.contains('has-intro')) { intro.remove(); return; }
    var others = $$('body > *').filter(function (el) { return el !== intro && el.tagName !== 'SCRIPT'; });
    others.forEach(function (el) { el.inert = true; });
    document.body.classList.add('no-scroll');
    var startBtn = $('[data-intro-start]', intro);
    var skipBtn = $('[data-intro-skip]', intro);
    var closed = false;
    var finish = function (withTour) {
      if (closed) return;
      closed = true;
      setFlag(INTRO_KEY);
      root.classList.remove('has-intro');
      document.body.classList.remove('no-scroll');
      others.forEach(function (el) { el.inert = false; });
      intro.classList.add('is-leaving');
      var removed = false;
      var drop = function () { if (!removed) { removed = true; intro.remove(); } };
      intro.addEventListener('transitionend', function (e) { if (e.target === intro && e.propertyName === 'opacity') drop(); });
      setTimeout(drop, 700);
      if (withTour && tour) tour.start();
    };
    startBtn.addEventListener('click', function () {
      try {
        var p = new Audio('assets/audio/intro-filosofia.mp3').play();
        if (p && p.catch) p.catch(function () {});
      } catch (e) {}
      finish(true);
    });
    skipBtn.addEventListener('click', function () { finish(false); });
    intro.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { finish(false); return; }
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === startBtn) { e.preventDefault(); skipBtn.focus(); }
      else if (!e.shiftKey && document.activeElement === skipBtn) { e.preventDefault(); startBtn.focus(); }
    });
    startBtn.focus({ preventScroll: true });
  }

  function setupTour() {
    var card = $('[data-tour]');
    if (!card) return null;
    var root = document.documentElement;
    var stepEl = $('[data-tour-step]', card);
    var nameEl = $('[data-tour-name]', card);
    var lineEl = $('[data-tour-line]', card);
    var nextBtn = $('[data-tour-next]', card);
    var skipBtn = $('[data-tour-skip]', card);
    var toast = $('[data-tour-toast]');
    var status = $('[data-status]');
    var STEPS = ['socrates', 'immanuel-kant', 'platon'];
    var active = false, paused = false, idx = -1, raf = 0, timer = 0, current = null;
    var mobileQ = window.matchMedia('(max-width: 720px)');

    function find(id) {
      for (var i = 0; i < TIMELINE.length; i++) {
        var list = TIMELINE[i].philosophers || [];
        for (var j = 0; j < list.length; j++) if (list[j].f === id) return list[j];
      }
      return null;
    }

    function targetTop(el) {
      var r = el.getBoundingClientRect();
      var vh = window.innerHeight;
      var pad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
      var bottom = mobileQ.matches ? card.offsetHeight + 64 + 40 : 24;
      var free = vh - pad - bottom;
      var y = r.top + window.scrollY;
      return Math.max(0, r.height <= free ? y - pad - (free - r.height) / 2 : y - pad);
    }

    function glide(y, done) {
      cancelAnimationFrame(raf);
      var from = window.scrollY, dist = y - from;
      if (reduced || Math.abs(dist) < 4) { window.scrollTo(0, y); done(); return; }
      var dur = Math.min(2200, Math.max(1000, Math.abs(dist) * 0.45));
      var t0 = 0;
      var step = function (now) {
        if (!active) return;
        if (!t0) t0 = now;
        var p = Math.min(1, (now - t0) / dur);
        var e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        window.scrollTo(0, from + dist * e);
        if (p < 1) raf = requestAnimationFrame(step); else done();
      };
      raf = requestAnimationFrame(step);
    }

    function arm() {
      clearTimeout(timer);
      if (!reduced && !paused && active) timer = setTimeout(next, 8000);
    }

    function show(i) {
      var id = STEPS[i], el = document.getElementById(id), ph = find(id);
      if (!el || !ph) { if (i < STEPS.length - 1) show(i + 1); else end(true, true); return; }
      idx = i;
      clearTimeout(timer);
      if (current) current.classList.remove('is-tour');
      current = el;
      el.classList.add('is-in');
      stepEl.textContent = (i + 1) + ' / ' + STEPS.length;
      nameEl.textContent = ph.n;
      lineEl.textContent = '«' + ph.q + '»';
      nextBtn.textContent = i === STEPS.length - 1 ? 'Finalizar' : 'Siguiente';
      if (status) status.textContent = 'Paso ' + (i + 1) + ' de ' + STEPS.length + ': ' + ph.n + '. ' + ph.q;
      card.hidden = false;
      card.style.animation = 'none';
      void card.offsetWidth;
      card.style.animation = '';
      try { nextBtn.focus({ preventScroll: true }); } catch (e) {}
      requestAnimationFrame(function () {
        if (!active) return;
        glide(targetTop(el), function () {
          if (!active) return;
          var y2 = targetTop(el);
          if (Math.abs(y2 - window.scrollY) > 6) window.scrollTo(0, y2);
          el.classList.add('is-tour');
          arm();
        });
      });
    }

    function next() {
      if (!active) return;
      if (idx >= STEPS.length - 1) end(true, true); else show(idx + 1);
    }

    function onUserScroll() { end(false, false); }
    function onKey(e) {
      if (e.key === 'Escape') { end(false, true); return; }
      if ((e.key === ' ' || e.key === 'Enter') && card.contains(e.target)) return;
      if (/^(ArrowUp|ArrowDown|PageUp|PageDown|Home|End| )$/.test(e.key)) end(false, false);
    }
    function pause() { paused = true; clearTimeout(timer); }

    function end(finished, restoreFocus) {
      if (!active) return;
      active = false;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      card.hidden = true;
      root.classList.remove('tour-active');
      root.style.scrollBehavior = '';
      window.removeEventListener('wheel', onUserScroll);
      window.removeEventListener('touchmove', onUserScroll);
      document.removeEventListener('keydown', onKey);
      setFlag(TOUR_KEY);
      if (current) {
        current.classList.remove('is-tour');
        if (restoreFocus) { try { current.focus({ preventScroll: true }); } catch (e) {} }
      }
      if (finished && toast) {
        toast.hidden = false;
        if (status) status.textContent = 'Ya puedes explorar libremente';
        setTimeout(function () { toast.hidden = true; }, 2400);
      }
    }

    nextBtn.addEventListener('click', next);
    skipBtn.addEventListener('click', function () { end(false, true); });
    ['pointerenter', 'pointerdown', 'keydown'].forEach(function (t) { card.addEventListener(t, pause); });

    return {
      start: function () {
        if (active || flag(TOUR_KEY)) return;
        active = true; paused = false;
        root.classList.add('tour-active');
        root.style.scrollBehavior = 'auto';
        window.addEventListener('wheel', onUserScroll, { passive: true });
        window.addEventListener('touchmove', onUserScroll, { passive: true });
        document.addEventListener('keydown', onKey);
        show(0);
      }
    };
  }

  function setupSpecular(hero) {
    if (reduced || !hero || !window.matchMedia('(hover: hover)').matches) return;
    var spec = $('[data-specular]');
    if (!spec) return;
    var raf = 0;
    hero.addEventListener('pointermove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var r = hero.getBoundingClientRect();
        spec.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 100).toFixed(2) + '%');
        spec.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 100).toFixed(2) + '%');
      });
    }, { passive: true });
  }

  function setupTilt() {
    if (reduced || !window.matchMedia('(hover: hover)').matches) return;
    $$('.hero-principle').forEach(function (card) {
      var settled = false;
      card.addEventListener('animationend', function (e) {
        if (e.animationName !== 'cardIn' || settled) return;
        settled = true;
        card.style.animation = 'none';
        card.style.opacity = '1';
        card.style.transform = 'perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))';
      });
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, px = 50, py = 50;
      var animate = function () {
        cx += (tx - cx) * 0.15;
        cy += (ty - cy) * 0.15;
        card.style.setProperty('--rx', cy.toFixed(2) + 'deg');
        card.style.setProperty('--ry', cx.toFixed(2) + 'deg');
        card.style.setProperty('--gx', px.toFixed(1) + '%');
        card.style.setProperty('--gy', py.toFixed(1) + '%');
        raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(animate) : 0;
      };
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        px = ((e.clientX - r.left) / r.width) * 100;
        py = ((e.clientY - r.top) / r.height) * 100;
        tx = (px / 100 - 0.5) * 8;
        ty = -(py / 100 - 0.5) * 6;
        if (!raf) raf = requestAnimationFrame(animate);
      });
      card.addEventListener('pointerleave', function () {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(animate);
      });
    });
  }

  function setupCardWill() {
    if (reduced) return;
    $$('.hero-principle').forEach(function (card) {
      card.style.willChange = 'transform, opacity';
      card.addEventListener('animationend', function (e) {
        if (e.animationName === 'cardIn') card.style.willChange = '';
      });
    });
  }

  function setupCounters() {
    var els = $$('[data-count]');
    if (!els.length) return;
    var reveal = function (el) {
      var target = Number(el.dataset.count);
      if (isNaN(target)) return;
      if (reduced) {
        el.textContent = target.toLocaleString('es-CO');
        return;
      }
      var wait = el.closest('.hero-facts') ? Math.max(0, (window.matchMedia('(max-width: 720px)').matches ? 900 : 1350) - performance.now()) : 0;
      var duration = 1100;
      var start = 0;
      var step = function (now) {
        if (!start) start = now;
        var p = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target).toLocaleString('es-CO');
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString('es-CO');
      };
      setTimeout(function () {
        el.textContent = '0';
        requestAnimationFrame(step);
      }, wait);
    };
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach(reveal);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        reveal(entry.target);
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }

  function setupParticles(hero) {
    var canvas = $('[data-particles]');
    if (!canvas) return null;
    var ctx = canvas.getContext ? canvas.getContext('2d') : null;
    var lowEnd = (navigator.deviceMemory && navigator.deviceMemory < 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    var small = window.matchMedia('(max-width: 720px)').matches;
    if (!ctx || reduced || !hero || (small && navigator.deviceMemory && navigator.deviceMemory < 4)) { canvas.hidden = true; return null; }
    var coarse = window.matchMedia('(pointer: coarse)').matches;
    var count = small ? 4 : (lowEnd ? 10 : 20);
    var minGap = coarse ? 33 : 0;
    var w = 1, h = 1, parts = [], raf = 0, last = 0, heroVisible = true;
    var rnd = function (a, b) { return a + Math.random() * (b - a); };
    function resize() {
      var rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      var dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1 : 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      parts.forEach(function (p) { if (p.x > w || p.y > h) { p.x = rnd(0, w); p.y = rnd(0, h); } });
    }
    function frame(now) {
      if (reduced) { raf = 0; ctx.clearRect(0, 0, w, h); return; }
      raf = requestAnimationFrame(frame);
      if (now - last < minGap) return;
      var dt = Math.min(Math.max(now - last, 0), 64) / 16.67;
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -4) p.x = w + 4; else if (p.x > w + 4) p.x = -4;
        if (p.y < -4) p.y = h + 4; else if (p.y > h + 4) p.y = -4;
        var a = p.a * (0.75 + 0.25 * Math.sin(now * 0.0008 + p.ph));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fillStyle = 'rgba(223, 185, 63, ' + a.toFixed(3) + ')';
        ctx.fill();
      }
    }
    function sync() {
      var run = !document.hidden && heroVisible && !reduced;
      if (run && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
      else if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    resize();
    for (var i = 0; i < count; i++) {
      parts.push({ x: rnd(0, w), y: rnd(0, h), r: rnd(0.8, 2), vx: rnd(-0.1, 0.1), vy: rnd(-0.15, 0.05), a: rnd(0.2, 0.6), ph: rnd(0, 6.28) });
    }
    document.addEventListener('visibilitychange', sync);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; sync(); }).observe(hero);
    }
    sync();
    return { resize: resize };
  }

  function init() {
    renderPre();
    buildPreNav();
    renderTimeline();
    buildMenu();
    renderConceptsOverlay();
    attachImageFallbacks(document);
    splitHeroTitle();
    splitHeroLead();

    (function () {
      var cbody = $('[data-concepts-body]');
      if (!cbody) return;
      cbody.addEventListener('click', function (e) {
        var sum = e.target.closest('summary');
        var d = sum && sum.parentNode;
        if (!d || !d.matches('details.concept-card')) return;
        e.preventDefault();
        if (d.open && d.classList.contains('is-open')) {
          d.classList.remove('is-open');
          var fin = function () { if (!d.classList.contains('is-open')) d.open = false; };
          if (reduced) fin(); else setTimeout(fin, 360);
        } else {
          d.open = true;
          void d.offsetHeight;
          d.classList.add('is-open');
        }
      });
    })();

    var index = null;
    var getIndex = function () { return index || (index = buildIndex()); };
    if ('requestIdleCallback' in window) window.requestIdleCallback(getIndex, { timeout: 3000 });
    else setTimeout(getIndex, 1200);

    var nav = $('[data-nav]');
    var navBar = $('[data-nav-bar]');
    var pill = $('[data-pill]');
    var ring = $('[data-ring]');
    var searchWrap = $('[data-search]');
    var searchTrigger = $('[data-search-trigger]');
    var input = $('[data-input]');
    var clearBtn = $('[data-clear]');
    var kbd = $('[data-kbd]');
    var results = $('[data-results]');
    var menuBtn = $('[data-menu-btn]');
    var menu = $('[data-menu]');
    var menuHandle = $('[data-sheet-handle]');
    var menuClose = $('[data-menu-close]');
    var searchClose = $('[data-search-close]');
    var sheetBackdrop = $('[data-sheet-backdrop]');
    var conceptsBtn = $('[data-concepts-btn]');
    var conceptsOverlay = $('#conceptos-biblioteca');
    var status = $('[data-status]');
    var toTop = $('[data-top]');
    var hero = $('[data-hero]');
    var closeFooter = $('#cierre');

    var lastFocus = null;
    var activeIndex = -1;
    var flatResults = [];
    var searchTimer = 0;
    var renderToken = 0;
    var menuDragging = false;
    var backdropTimer = 0;

    var isMobileQuery = window.matchMedia('(max-width: 720px)');
    var isMobile = isMobileQuery.matches;
    function onMobileChange(e) {
      isMobile = e.matches;
      closeSearch();
      if (!menu.hidden) closeMenu();
      clearTimeout(backdropTimer);
      sheetBackdrop.hidden = true;
      sheetBackdrop.classList.remove('is-visible');
      syncDock();
    }
    if (isMobileQuery.addEventListener) isMobileQuery.addEventListener('change', onMobileChange);
    else if (isMobileQuery.addListener) isMobileQuery.addListener(onMobileChange);

    if (kbd) {
      var plat = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
      kbd.textContent = /mac|iphone|ipad|ipod/i.test(plat) ? '⌘ K' : 'Ctrl K';
    }

    function setBackgroundInert(state) {
      var els = [$('main'), closeFooter];
      els.forEach(function (el) {
        if (!el) return;
        if (state) el.setAttribute('inert', '');
        else el.removeAttribute('inert');
      });
    }

    function updateClearBtn() {
      clearBtn.hidden = !input.value;
    }

    function syncDock() {
      var hide = isMobile && (searchWrap.classList.contains('is-active') || !menu.hidden || !conceptsOverlay.hidden);
      nav.classList.toggle('is-hidden', hide);
    }

    function trapTab(container, e) {
      if (e.key !== 'Tab') return;
      var f = $$('button:not([disabled]), [href], input, summary, [tabindex]:not([tabindex="-1"])', container)
        .filter(function (el) { return !el.hidden && el.getClientRects().length > 0; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (!container.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    function activateMobileSearch() {
      if (searchWrap.classList.contains('is-active')) return;
      searchWrap.classList.add('is-active');
      searchWrap.setAttribute('role', 'dialog');
      searchWrap.setAttribute('aria-modal', 'true');
      searchWrap.setAttribute('aria-labelledby', 'filSearchTitle');
      document.body.classList.add('search-active');
      updateClearBtn();
      syncDock();
      adjustForKeyboard();
    }

    function closeSearch(focusBack) {
      var wasActive = searchWrap.classList.contains('is-active');
      results.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      activeIndex = -1;
      flatResults = [];
      searchWrap.classList.remove('is-active');
      searchWrap.style.paddingBottom = '';
      searchWrap.style.top = '';
      searchWrap.style.bottom = '';
      searchWrap.style.height = '';
      searchWrap.setAttribute('role', 'search');
      searchWrap.removeAttribute('aria-modal');
      searchWrap.removeAttribute('aria-labelledby');
      nav.classList.remove('is-search-open');
      nav.classList.remove('is-keyboard');
      document.body.classList.remove('search-active');
      updateClearBtn();
      syncDock();
      if (focusBack === true && wasActive && searchTrigger) { try { searchTrigger.focus(); } catch (e) {} }
    }

    function closeMenu(focusBack) {
      if (menu.hidden) return;
      menu.hidden = true;
      menu.classList.remove('is-open');
      menu.style.transform = '';
      menu.style.transition = '';
      menu.style.animation = '';
      menuDragging = false;
      menu.removeAttribute('role');
      menu.removeAttribute('aria-modal');
      menu.removeAttribute('aria-labelledby');
      menuBtn.setAttribute('aria-expanded', 'false');
      if (isMobile) {
        sheetBackdrop.classList.remove('is-visible');
        clearTimeout(backdropTimer);
        backdropTimer = setTimeout(function () { sheetBackdrop.hidden = true; }, 300);
        document.body.classList.remove('no-scroll');
      }
      syncDock();
      if (focusBack && menuBtn) { try { menuBtn.focus(); } catch (e) {} }
    }

    function openMenu() {
      if (!menu.hidden) return;
      closeSearch();
      menu.hidden = false;
      menuBtn.setAttribute('aria-expanded', 'true');
      if (isMobile) {
        clearTimeout(backdropTimer);
        sheetBackdrop.hidden = false;
        menu.setAttribute('role', 'dialog');
        menu.setAttribute('aria-modal', 'true');
        menu.setAttribute('aria-labelledby', 'filMenuTitle');
        void menu.offsetWidth;
        menu.classList.add('is-open');
        requestAnimationFrame(function () { sheetBackdrop.classList.add('is-visible'); });
        document.body.classList.add('no-scroll');
        syncDock();
        if (menuClose) { try { menuClose.focus({ preventScroll: true }); } catch (e) {} }
      }
    }

    function scrollToConcept(id) {
      var target = document.getElementById(id);
      if (!target || target.tagName !== 'DETAILS') return;
      target.open = true;
      target.classList.add('is-open');
      var summary = target.querySelector('summary');
      setTimeout(function () {
        target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
        if (summary) { try { summary.focus({ preventScroll: true }); } catch (e) {} }
      }, 80);
    }

    function openConcepts(targetId) {
      if (!conceptsOverlay.hidden) {
        if (targetId) scrollToConcept(targetId);
        return;
      }
      var ae = document.activeElement;
      lastFocus = (ae && ae !== document.body && !searchWrap.contains(ae) && !menu.contains(ae)) ? ae : conceptsBtn;
      conceptsOverlay.hidden = false;
      document.body.classList.add('no-scroll');
      conceptsBtn.setAttribute('aria-expanded', 'true');
      setBackgroundInert(true);
      syncDock();
      if (targetId) {
        scrollToConcept(targetId);
      } else {
        var first = conceptsOverlay.querySelector('[data-concepts-close]');
        if (first) setTimeout(function () { try { first.focus(); } catch (e) {} }, 60);
      }
    }

    function closeConcepts() {
      if (conceptsOverlay.hidden) return;
      conceptsOverlay.hidden = true;
      document.body.classList.remove('no-scroll');
      conceptsBtn.setAttribute('aria-expanded', 'false');
      setBackgroundInert(false);
      syncDock();
      if (lastFocus && lastFocus.focus) {
        try { lastFocus.focus(); } catch (e) {}
        lastFocus = null;
      }
    }

    function forceVisibleChain(el) {
      var node = el;
      while (node && node !== document.body) {
        if (node.classList && (node.classList.contains('period') || node.classList.contains('interlude') || node.classList.contains('presocraticos') || node.classList.contains('filosofia-intro') || node.classList.contains('close'))) {
          node.style.contentVisibility = 'visible';
        }
        node = node.parentNode;
      }
    }

    function navigateTo(id, opts) {
      opts = opts || {};
      if (CONCEPTS.some(function (c) { return c.id === id; })) {
        closeSearch();
        closeMenu();
        openConcepts(id);
        if (opts.blur !== false) { try { input.blur(); } catch (e) {} }
        return;
      }
      var el = document.getElementById(id);
      if (!el) return;
      closeSearch();
      closeMenu();
      closeConcepts();
      forceVisibleChain(el);
      $$('.pre-card, .ph-row', el).forEach(function (r) { r.classList.add('is-in'); });
      if (el.classList.contains('pre-card') || el.classList.contains('ph-row')) el.classList.add('is-in');
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      requestAnimationFrame(function () {
        var behavior = reduced ? 'auto' : 'smooth';
        el.scrollIntoView({ behavior: behavior, block: 'start' });
        setTimeout(function () {
          try { el.focus({ preventScroll: true }); } catch (e) {}
          try { history.replaceState(null, '', '#' + id); } catch (e) {}
          if (!reduced) el.style.contentVisibility = '';
        }, reduced ? 0 : 500);
      });
      if (opts.blur !== false) { try { input.blur(); } catch (e) {} }
    }

    function highlight(text, tokens) {
      var str = String(text);
      var normalized = [];
      var indexMap = [];
      var i, ch;
      for (i = 0; i < str.length; i++) {
        ch = str[i];
        var nf = ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        if (!nf.length) continue;
        for (var k = 0; k < nf.length; k++) {
          normalized.push(nf[k]);
          indexMap.push(i);
        }
      }
      var normStr = normalized.join('');
      var marked = new Array(str.length).fill(false);
      tokens.forEach(function (t) {
        if (!t) return;
        var from = 0;
        while (true) {
          var idx = normStr.indexOf(t, from);
          if (idx < 0) break;
          var startOrig = indexMap[idx];
          var endOrig = indexMap[idx + t.length - 1];
          for (var m = startOrig; m <= endOrig; m++) marked[m] = true;
          from = idx + t.length;
        }
      });
      var out = '', open = false;
      for (i = 0; i < str.length; i++) {
        if (marked[i] && !open) { out += '<mark>'; open = true; }
        if (!marked[i] && open) { out += '</mark>'; open = false; }
        out += escapeHtml(str[i]);
      }
      if (open) out += '</mark>';
      return out;
    }

    function renderSuggestions() {
      var recent = loadHistory();
      var html = '';
      if (recent.length) {
        html += '<div role="group" aria-label="Búsquedas recientes">' +
          '<header class="result-group-head"><h3 class="result-group-t">Recientes</h3>' +
          '<button class="result-clear-all" type="button" data-clear-history>Borrar todo</button></header>' +
          '<ul role="list">';
        recent.forEach(function (q, i) {
          html += '<li class="result-rec-row">' +
            '<button class="result-rec" type="button" data-recent-query="' + escapeHtml(q) + '" data-i="' + i + '">' +
              '<svg class="result-ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>' +
              '<span><b>' + escapeHtml(q) + '</b></span>' +
            '</button>' +
            '<button class="result-rm" type="button" aria-label="Quitar «' + escapeHtml(q) + '» de recientes" data-recent-remove="' + escapeHtml(q) + '">' +
              '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
            '</button>' +
          '</li>';
        });
        html += '</ul></div>';
      }
      html += '<div role="group" aria-label="Búsquedas sugeridas">' +
        '<h3 class="result-group-t">Sugerencias</h3>';
      SEARCH_SUGGESTIONS.forEach(function (s, i) {
        html += '<button class="result-sug" type="button" data-suggestion="' + escapeHtml(s.id) + '" data-suggestion-label="' + escapeHtml(s.label) + '" data-i="' + i + '">' +
          '<svg class="result-ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>' +
          '<span><b>' + escapeHtml(s.label) + '</b></span>' +
        '</button>';
      });
      html += '</div>';
      return html;
    }

    function renderResultsPanel() {
      var token = ++renderToken;
      var q = input.value.trim();
      closeMenu();
      results.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      if (!q) {
        if (token !== renderToken) return;
        results.innerHTML = renderSuggestions();
        status.textContent = '';
        activeIndex = -1;
        flatResults = [];
        return;
      }
      var tokens = normalizeForSearch(q).split(/\s+/).filter(Boolean);
      var hits = getIndex().map(function (x) {
        if (!tokens.every(function (t) { return x.haystack.indexOf(t) !== -1; })) return null;
        var score = 0;
        tokens.forEach(function (t) {
          if (x.titleFold.indexOf(t) === 0) score += 4;
          else if (x.titleFold.indexOf(t) !== -1) score += 3;
          else score += 1;
        });
        return { entry: x, score: score };
      }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).slice(0, 14);

      if (token !== renderToken) return;

      flatResults = [];
      activeIndex = -1;

      if (!hits.length) {
        results.innerHTML = '<div class="result-empty"><b>Sin resultados</b>No encontramos «' + escapeHtml(q) + '». Prueba otra palabra.</div>';
        status.textContent = 'Sin resultados';
        return;
      }

      var html = '';
      var i = 0;
      ['Filósofos', 'Periodos', 'Conceptos'].forEach(function (type) {
        var group = hits.filter(function (h) { return h.entry.type === type; });
        if (!group.length) return;
        html += '<div role="group" aria-label="' + type + '"><h3 class="result-group-t">' + type + '</h3>';
        group.forEach(function (h) {
          flatResults.push(h.entry);
          html += '<div class="result-opt" role="option" id="fil-o-' + i + '" aria-selected="false" data-result-index="' + i + '">' +
            '<span><b>' + highlight(h.entry.title, tokens) + '</b><small>' + highlight(h.entry.sub, tokens) + '</small></span>' +
          '</div>';
          i++;
        });
        html += '</div>';
      });
      results.innerHTML = html;
      status.textContent = flatResults.length + (flatResults.length === 1 ? ' resultado' : ' resultados');
    }

    function setResultActive(n) {
      if (!flatResults.length) return;
      activeIndex = (n + flatResults.length) % flatResults.length;
      $$('.result-opt', results).forEach(function (el, i) {
        el.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
      });
      input.setAttribute('aria-activedescendant', 'fil-o-' + activeIndex);
      var cur = $('#fil-o-' + activeIndex);
      if (cur) cur.scrollIntoView({ block: 'nearest' });
    }

    function handleRecentClick(query) {
      pushHistory(query);
      input.value = query;
      updateClearBtn();
      renderResultsPanel();
    }
    function handleSuggestionNavigate(id, label) {
      if (label) pushHistory(label);
      input.value = '';
      updateClearBtn();
      navigateTo(id);
    }
    function handleResultNavigate(entry) {
      var q = input.value.trim();
      if (q) pushHistory(q);
      input.value = '';
      updateClearBtn();
      navigateTo(entry.id);
    }

    function adjustForKeyboard() {
      var vv = window.visualViewport;
      if (!vv || !isMobile) return;
      var kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      if (kb > 80) nav.classList.add('is-keyboard');
      else if (kb < 40) nav.classList.remove('is-keyboard');
      if (!searchWrap.classList.contains('is-active')) { searchWrap.style.cssText = ''; return; }
      if (kb > 80 || vv.offsetTop > 0) {
        searchWrap.style.top = vv.offsetTop + 'px';
        searchWrap.style.bottom = 'auto';
        searchWrap.style.height = vv.height + 'px';
        searchWrap.style.paddingBottom = kb > 80 ? '16px' : '';
      } else {
        searchWrap.style.top = '';
        searchWrap.style.bottom = '';
        searchWrap.style.height = '';
        searchWrap.style.paddingBottom = '';
      }
    }
    if (window.visualViewport) {
      var vvRaf = 0;
      var onVV = function () {
        if (vvRaf) return;
        vvRaf = requestAnimationFrame(function () { vvRaf = 0; adjustForKeyboard(); });
      };
      window.visualViewport.addEventListener('resize', onVV);
      window.visualViewport.addEventListener('scroll', onVV);
    }

    input.addEventListener('input', function () {
      clearTimeout(searchTimer);
      updateClearBtn();
      searchTimer = setTimeout(renderResultsPanel, 120);
    });
    input.addEventListener('focus', function () {
      if (isMobile) activateMobileSearch();
      nav.classList.add('is-search-open');
      renderResultsPanel();
      adjustForKeyboard();
    });
    input.addEventListener('blur', function () {
      if (isMobile) return;
      setTimeout(function () {
        if (!searchWrap.contains(document.activeElement) && !results.contains(document.activeElement)) {
          closeSearch();
        }
      }, 140);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (results.hidden) renderResultsPanel();
        if (flatResults.length) setResultActive(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (flatResults.length) setResultActive(activeIndex - 1);
      } else if (e.key === 'Enter') {
        if (!results.hidden && flatResults.length) {
          e.preventDefault();
          if (activeIndex < 0) activeIndex = 0;
          handleResultNavigate(flatResults[activeIndex]);
        }
      } else if (e.key === 'Escape') {
        if (!results.hidden) {
          e.preventDefault();
          closeSearch(isMobile);
          try { input.blur(); } catch (err) {}
        } else if (input.value) {
          input.value = '';
          updateClearBtn();
        } else if (isMobile && searchWrap.classList.contains('is-active')) {
          e.preventDefault();
          closeSearch(true);
          try { input.blur(); } catch (err) {}
        }
      }
    });

    results.addEventListener('mousedown', function (e) {
      if (e.target.closest('[data-result-index], [data-recent-query], [data-suggestion], [data-recent-remove], [data-clear-history]')) {
        e.preventDefault();
      }
    });
    results.addEventListener('click', function (e) {
      var rm = e.target.closest('[data-recent-remove]');
      if (rm) {
        e.preventDefault(); e.stopPropagation();
        removeHistory(rm.dataset.recentRemove);
        renderResultsPanel();
        return;
      }
      var clr = e.target.closest('[data-clear-history]');
      if (clr) {
        e.preventDefault();
        clearHistory();
        renderResultsPanel();
        return;
      }
      var recent = e.target.closest('[data-recent-query]');
      if (recent) {
        e.preventDefault();
        handleRecentClick(recent.dataset.recentQuery);
        return;
      }
      var sug = e.target.closest('[data-suggestion]');
      if (sug) {
        e.preventDefault();
        handleSuggestionNavigate(sug.dataset.suggestion, sug.dataset.suggestionLabel);
        return;
      }
      var opt = e.target.closest('[data-result-index]');
      if (opt) {
        e.preventDefault();
        var entry = flatResults[Number(opt.dataset.resultIndex)];
        if (entry) handleResultNavigate(entry);
      }
    });
    results.addEventListener('mousemove', function (e) {
      var opt = e.target.closest('[data-result-index]');
      if (opt && Number(opt.dataset.resultIndex) !== activeIndex) {
        setResultActive(Number(opt.dataset.resultIndex));
      }
    });

    clearBtn.addEventListener('click', function () {
      input.value = '';
      updateClearBtn();
      renderResultsPanel();
      try { input.focus(); } catch (e) {}
    });

    if (searchClose) searchClose.addEventListener('click', function () {
      closeSearch(true);
      try { input.blur(); } catch (e) {}
    });
    searchWrap.addEventListener('keydown', function (e) {
      if (isMobile && searchWrap.classList.contains('is-active')) trapTab(searchWrap, e);
    });

    if (searchTrigger) searchTrigger.addEventListener('click', function () {
      if (isMobile) {
        activateMobileSearch();
        try { input.focus(); } catch (e) {}
        renderResultsPanel();
        adjustForKeyboard();
      } else {
        try { input.focus(); } catch (e) {}
        nav.classList.add('is-search-open');
        renderResultsPanel();
      }
    });

    menuBtn.addEventListener('click', function () {
      if (menu.hidden) openMenu();
      else closeMenu(true);
    });
    if (sheetBackdrop) sheetBackdrop.addEventListener('click', function () { closeMenu(true); });
    if (menuClose) menuClose.addEventListener('click', function () { closeMenu(true); });
    menu.addEventListener('keydown', function (e) {
      if (isMobile && !menu.hidden) trapTab(menu, e);
    });

    if (menuHandle) {
      var startY = 0, curY = 0;
      menuHandle.addEventListener('pointerdown', function (e) {
        if (!isMobile || menu.hidden) return;
        menuDragging = true;
        startY = e.clientY;
        curY = 0;
        try { menuHandle.setPointerCapture(e.pointerId); } catch (err) {}
        menu.style.transition = 'none';
      });
      menuHandle.addEventListener('pointermove', function (e) {
        if (!menuDragging) return;
        curY = Math.max(0, e.clientY - startY);
        menu.style.transform = 'translateY(' + curY + 'px)';
      });
      var endDrag = function (cancelled) {
        if (!menuDragging) return;
        menuDragging = false;
        var dy = curY;
        curY = 0;
        if (!cancelled && dy > 80) { closeMenu(true); return; }
        menu.style.transition = 'transform .25s var(--ease)';
        menu.style.transform = '';
        setTimeout(function () { if (!menuDragging) menu.style.transition = ''; }, 260);
      };
      menuHandle.addEventListener('pointerup', function () { endDrag(false); });
      menuHandle.addEventListener('pointercancel', function () { endDrag(true); });
    }

    conceptsBtn.addEventListener('click', function () {
      if (conceptsOverlay.hidden) openConcepts();
      else closeConcepts();
    });
    $$('[data-concepts-close]', conceptsOverlay).forEach(function (b) {
      b.addEventListener('click', closeConcepts);
    });
    conceptsOverlay.addEventListener('click', function (e) {
      if (e.target === conceptsOverlay) { closeConcepts(); return; }
      var chip = e.target.closest('[data-related]');
      if (chip) {
        e.preventDefault();
        scrollToConcept(chip.dataset.related);
      }
    });
    conceptsOverlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeConcepts(); return; }
      if (e.key === 'Tab') {
        var focusables = $$('button:not([disabled]), [href], summary, [tabindex]:not([tabindex="-1"])', conceptsOverlay)
          .filter(function (el) { return el.offsetParent !== null; });
        if (!focusables.length) return;
        var first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    document.addEventListener('click', function (e) {
      if (searchWrap.contains(e.target)) return;
      if (e.target.closest('[data-search-trigger]')) return;
      if (!results.hidden) closeSearch();
    });
    document.addEventListener('click', function (e) {
      if (!menu.hidden && !e.target.closest('[data-menu]') && !e.target.closest('[data-menu-btn]')) {
        closeMenu();
      }
    });
    document.addEventListener('click', function (e) {
      var goEl = e.target.closest('[data-go]');
      if (!goEl) return;
      var goId = goEl.dataset.go;
      if (!/^[A-Za-z0-9_-]+$/.test(goId)) return;
      e.preventDefault();
      navigateTo(goId);
    });

    document.addEventListener('keydown', function (e) {
      if (!conceptsOverlay.hidden) {
        if (e.key === 'Escape') return;
        var activeEl0 = document.activeElement || {};
        var inField0 = /INPUT|TEXTAREA/.test(activeEl0.tagName || '');
        if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) return;
        if (e.key === '/' && !inField0) return;
      }
      var activeEl = document.activeElement || {};
      var inField = /INPUT|TEXTAREA/.test(activeEl.tagName || '');
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (isMobile) activateMobileSearch();
        try { input.focus(); } catch (err) {}
        nav.classList.add('is-search-open');
        updateClearBtn();
        renderResultsPanel();
        return;
      }
      if (e.key === '/' && !inField) {
        e.preventDefault();
        if (isMobile) activateMobileSearch();
        try { input.focus(); } catch (err) {}
        nav.classList.add('is-search-open');
        updateClearBtn();
        renderResultsPanel();
        return;
      }
      if (e.key === 'Escape') {
        if (!conceptsOverlay.hidden) return;
        if (!menu.hidden) { closeMenu(true); return; }
        if (!results.hidden || (isMobile && searchWrap.classList.contains('is-active'))) { closeSearch(isMobile); return; }
      }
    });

    if (navBar && pill) {
      var pillTargets = $$('.nav-home, .nav-mark, .nav-btn, .nav-search-trigger, .nav-exit', navBar);
      var showPill = function (el) {
        var r = el.getBoundingClientRect();
        var pr = navBar.getBoundingClientRect();
        pill.style.left = (r.left - pr.left) + 'px';
        pill.style.width = r.width + 'px';
        pill.style.opacity = '1';
      };
      var hidePill = function () { pill.style.opacity = '0'; };
      pillTargets.forEach(function (t) {
        t.addEventListener('mouseenter', function () { showPill(t); });
        t.addEventListener('focus', function () { showPill(t); });
      });
      navBar.addEventListener('mouseleave', hidePill);
      navBar.addEventListener('focusout', function (e) {
        if (!navBar.contains(e.relatedTarget)) hidePill();
      });
    }

    if ('IntersectionObserver' in window) {
      var revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          revealIO.unobserve(entry.target);
          if (entry.target.classList.contains('ph-row')) {
            entry.target.style.willChange = 'transform, opacity';
            setTimeout(function () {
              if (entry.target) entry.target.style.willChange = '';
            }, 1000);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
      $$('.pre-card, .ph-row, .period-head, .interlude, .close-asks li, .filosofia-rasgo').forEach(function (el) { revealIO.observe(el); });
    } else {
      $$('.pre-card, .ph-row, .period-head, .interlude, .close-asks li, .filosofia-rasgo').forEach(function (el) { el.classList.add('is-in'); });
    }

    var preGrid = $('[data-pre-grid]');
    if (preGrid) {
      var prePrev = $('[data-pre-prev]');
      var preNext = $('[data-pre-next]');
      var preDots = $('[data-pre-dots]');
      var setActive = function (idx) {
        if (!preDots) return;
        $$('.pre-dot-btn', preDots).forEach(function (b, i) {
          b.classList.toggle('is-active', i === idx);
          if (i === idx) b.setAttribute('aria-current', 'true');
          else b.removeAttribute('aria-current');
        });
        if (prePrev) prePrev.disabled = idx === 0;
        if (preNext) preNext.disabled = idx === PRE.length - 1;
      };
      var currentIdx = function () {
        if (!preDots) return 0;
        var btns = $$('.pre-dot-btn', preDots);
        for (var i = 0; i < btns.length; i++) if (btns[i].classList.contains('is-active')) return i;
        return 0;
      };
      var goTo = function (idx) {
        var cards = $$('.pre-card', preGrid);
        if (cards[idx]) cards[idx].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
      };
      if (prePrev) prePrev.addEventListener('click', function () { var i = currentIdx(); if (i > 0) goTo(i - 1); });
      if (preNext) preNext.addEventListener('click', function () { var i = currentIdx(); if (i < PRE.length - 1) goTo(i + 1); });
      if (preDots) preDots.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-dot-index]');
        if (btn) goTo(Number(btn.dataset.dotIndex));
      });
      var preRaf = 0;
      preGrid.addEventListener('scroll', function () {
        if (preRaf) return;
        preRaf = requestAnimationFrame(function () {
          preRaf = 0;
          var cards = $$('.pre-card', preGrid);
          var gr = preGrid.getBoundingClientRect();
          var center = gr.left + gr.width / 2;
          var closest = 0, dist = Infinity;
          cards.forEach(function (c, i) {
            var r = c.getBoundingClientRect();
            var d = Math.abs(r.left + r.width / 2 - center);
            if (d < dist) { dist = d; closest = i; }
          });
          setActive(closest);
        });
      }, { passive: true });
      setActive(0);
    }

    var heroScroll = $('.hero-scroll');
    var heroAway = false;
    var scrollRaf = 0;
    var updateScroll = function () {
      scrollRaf = 0;
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      if (ring) {
        var circ = 2 * Math.PI * 18;
        ring.style.strokeDasharray = String(circ);
        ring.style.strokeDashoffset = String(circ * (1 - p));
      }
      if (heroScroll) {
        var away = y > 120;
        if (away !== heroAway) { heroAway = away; heroScroll.classList.toggle('is-away', away); }
      }
      if (toTop) {
        var hideTop = y < 500;
        if (toTop.hidden !== hideTop) toTop.hidden = hideTop;
      }
    };
    window.addEventListener('scroll', function () {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(updateScroll);
    }, { passive: true });
    var resizeTimer = 0;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (scrollRaf) cancelAnimationFrame(scrollRaf);
        if (particles) particles.resize();
        scrollRaf = requestAnimationFrame(updateScroll);
        if (isMobile) adjustForKeyboard();
      }, 150);
    }, { passive: true });
    updateScroll();

    if (toTop) toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });

    setupSpecular(hero);
    setupParallax(hero);
    setupCardWill();
    setupTilt();
    setupCounters();
    var particles = setupParticles(hero);

    var initialHash = decodeURIComponent((location.hash || '').slice(1));
    if (initialHash) {
      setTimeout(function () {
        if (CONCEPTS.some(function (c) { return c.id === initialHash; })) {
          openConcepts(initialHash);
        } else if (document.getElementById(initialHash)) {
          navigateTo(initialHash, { blur: false });
        }
      }, 300);
    }
  }

  function boot() {
    var root = document.documentElement;
    if (!flag(INTRO_KEY)) root.classList.add('has-intro');
    try {
      init();
      setupIntro(setupTour());
    } catch (err) {
      root.classList.remove('has-intro');
      document.body.classList.remove('no-scroll');
      $$('.pre-card, .ph-row, .interlude, .close-asks li, .filosofia-rasgo').forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();