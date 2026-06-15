import { EMERGENCY_DIRECTORY } from "./directory";

// ════════════════════════════════════════════════════════════════
// HANDBOOK_PAGES — Sistema "Mi perro se está ahogando"
// 15 páginas · Misma arquitectura del manual PANIK original
// ════════════════════════════════════════════════════════════════

export const HANDBOOK_PAGES = [
  {
    id: 1,
    title: "Mi perro se está ahogando",
    subtitle: "¿Qué hago en los primeros 60 segundos?",
    badge: "SISTEMA DE ACCIÓN INMEDIATA · CDMX",
    type: "cover",
    bgImage: "/dog-choking-closeup.png",
    description: "Manual de decisión táctica y diagnóstico rápido para dueños de mascotas bajo tensión extrema. Atragantamiento y asfixia por cuerpo extraño."
  },
  {
    id: 2,
    title: "Por qué existe este manual",
    subtitle: "El pánico paraliza. La preparación salva vidas.",
    type: "editorial",
    content: "Cuando un perro se atraganta, los primeros 60 a 90 segundos son la 'Ventana de Oro'. A diferencia de una intoxicación, aquí no hay tiempo para llamar primero: el cerebro empieza a sufrir daño por falta de oxígeno en minutos. El pánico hace que la gente busque en internet, grite, o intente sacar el objeto a ciegas empujándolo más adentro. Este manual físico/PDF te prepara ANTES de la emergencia, memorizando la secuencia correcta en tu cuerpo. La app interactiva te guía paso a paso DURANTE la crisis, sin necesidad de leer párrafos largos. Juntos, forman un ecosistema operativo diseñado para actuar con precisión quirúrgica cuando el reloj no perdona."
  },
  {
    id: 3,
    title: "Causas Más Comunes",
    subtitle: "Qué provoca atragantamiento en perros dentro del hogar",
    type: "data",
    content: "La mayoría de los episodios de atragantamiento ocurren durante el juego o la alimentación sin supervisión. Conocer el objeto más probable ayuda a anticipar el riesgo antes de que ocurra.",
    stats: [
      { label: "Huesos y Trozos de Comida", value: "38%", desc: "Huesos de pollo, costillas y trozos grandes de premio o carne." },
      { label: "Pelotas y Juguetes", value: "29%", desc: "Pelotas de tenis, juguetes de hule pequeños o partes rotas de juguetes." },
      { label: "Palos y Madera", value: "18%", desc: "Ramas astilladas durante el juego de buscar y traer." },
      { label: "Objetos del Hogar", value: "15%", desc: "Tapas de botella, agujas, anzuelos, collares enganchados." }
    ]
  },
  {
    id: 4,
    title: "Señales de Alarma",
    subtitle: "Aprende a diagnosticar la gravedad visualmente",
    type: "semaphore",
    levels: [
      {
        color: "red",
        title: "ROJO: OBSTRUCCIÓN CRÍTICA",
        desc: "No respira, encías azules/moradas/grises, pierde el conocimiento, no puede tragar o babea sin control, rasca su cara con desesperación.",
        action: "Maniobra de Heimlich inmediata. Llama al veterinario mientras actúas. Traslado sin esperar mejoría."
      },
      {
        color: "yellow",
        title: "AMARILLO: OBSTRUCCIÓN PARCIAL",
        desc: "Tose con esfuerzo pero entra algo de aire, estira el cuello hacia adelante, hace ruidos roncos al respirar, está inquieto pero responde.",
        action: "Mantén la calma del perro. No le des agua ni comida. Llama al veterinario y monitorea cada minuto."
      },
      {
        color: "green",
        title: "VERDE: EPISODIO RESUELTO",
        desc: "Tosió con fuerza, expulsó el objeto o tragó, respira con normalidad, encías rosadas, comportamiento estable.",
        action: "Observa 20-30 minutos. Revisa la boca por residuos. Llama al veterinario para documentar el episodio."
      }
    ]
  },
  {
    id: 5,
    title: "Cinco Hábitos de Prevención",
    subtitle: "Cómo blindar tu hogar contra atragantamientos",
    type: "prevention",
    habits: [
      { num: "01", title: "Tamaño Correcto de Juguetes", desc: "Cualquier juguete o pelota que entre completo en la boca de tu perro sin tocar los dientes traseros es un riesgo de obstrucción de tráquea." },
      { num: "02", title: "Huesos Bajo Supervisión Total", desc: "Nunca dejes a tu perro solo con huesos de pollo, costilla o pavo. Se fragmentan en astillas filosas que se atoran o perforan." },
      { num: "03", title: "Revisa Juguetes Rotos al Instante", desc: "Retira de inmediato cualquier juguete con piezas sueltas, rellenos expuestos o partes de hule desprendidas." },
      { num: "04", title: "Supervisión en el Juego de Traer", desc: "Evita palos largos y delgados — se astillan en la boca y la garganta al morder o caer mal." },
      { num: "05", title: "Áreas de Costura y Anzuelos Restringidas", desc: "Agujas, hilo, anzuelos de pesca y tapas de botella deben quedar fuera del alcance; son tragados con facilidad y son extremadamente peligrosos." }
    ]
  },
  {
    id: 6,
    title: "Kit de Preparación Táctica",
    subtitle: "Lo que debes tener listo antes de la crisis",
    type: "kit",
    bgImage: "/panik_emergency_kit_choking.png",
    sections: [
      {
        title: "EQUIPAMIENTO",
        items: ["Toallas o tela limpia para sujetar y secar", "Linterna de celular siempre cargada", "Correa corta para traslado de emergencia", "Caja o tabla rígida para cargar perros pequeños"]
      },
      {
        title: "CONOCIMIENTO PREVIO",
        items: ["Memoriza la maniobra de Heimlich para el tamaño de tu perro", "Identifica la ruta más rápida al hospital veterinario 24h", "Guarda el peso aproximado de tu perro en el celular", "Practica revisar la boca de tu perro sin que se asuste"]
      },
      {
        title: "CONTACTOS",
        items: ["Teléfono del veterinario de cabecera guardado y visible", "Número de 2 hospitales 24 horas cercanos", "Línea de emergencia PANIK de tu ciudad", "Contacto de un vecino o familiar que pueda ayudarte a trasladar"]
      }
    ]
  },
  {
    id: 7,
    title: "Escenario 01: Hueso Atorado",
    subtitle: "La causa más común y más peligrosa",
    type: "scenario",
    bgImage: "/panik_scenario_bone.png",
    dangerLevel: "ROJO / AMARILLO (Según ubicación)",
    whatToDo: [
      "Si el hueso está atorado en la garganta y el perro no respira o no puede tragar: aplica Heimlich de inmediato.",
      "Si el perro tose con esfuerzo pero entra aire, mantenlo en calma — la tos puede expulsarlo solo.",
      "Si logras ver el hueso y está suelto en la boca, retíralo con dos dedos SIN empujarlo más adentro."
    ],
    whatNOTToDo: [
      "NUNCA metas la mano a ciegas si no ves el objeto — puedes empujarlo más profundo y cerrar la vía por completo.",
      "No le des agua ni comida pensando que 'ayudará a pasarlo'. Puede empeorar la obstrucción o provocar aspiración."
    ],
    vetScript: "Mi perro se atoró con un hueso hace [X] minutos. [Pudo / no pudo] expulsarlo. Sus encías están [color]. [Está / no está] respirando con dificultad."
  },
  {
    id: 8,
    title: "Escenario 02: Pelota o Juguete",
    subtitle: "Bloqueo total de tráquea en segundos",
    type: "scenario",
    bgImage: "/panik_scenario_ball.png",
    dangerLevel: "ROJO ABSOLUTO",
    whatToDo: [
      "Si la pelota quedó alojada en la garganta y bloquea la respiración: Heimlich inmediato, sin esperar.",
      "Empuja desde atrás de las costillas hacia arriba con fuerza controlada — el objetivo es generar una tos forzada que expulse el objeto.",
      "Si el perro pierde el conocimiento, revisa la boca y retira el objeto solo si lo ves y puedes alcanzarlo sin empujarlo."
    ],
    whatNOTToDo: [
      "NUNCA intentes 'empujar' la pelota hacia el estómago pensando que 'allá no hace daño' — puede quedar igualmente atorada más abajo y causar daño interno.",
      "No pierdas tiempo buscando el objeto exacto antes de actuar. Actúa primero, identifica después."
    ],
    vetScript: "Mi perro tenía una pelota/juguete en la boca y se atoró hace [X] minutos. [Logré / no logré] sacarla con Heimlich. Actualmente [respira con dificultad / respira normal]."
  },
  {
    id: 9,
    title: "Escenario 03: Palo Astillado",
    subtitle: "Riesgo doble: obstrucción y perforación",
    type: "scenario",
    bgImage: "/panik_scenario_stick.png",
    dangerLevel: "ROJO / AMARILLO",
    whatToDo: [
      "Si el palo está atravesado en la boca o garganta y el perro no puede cerrar la boca: NO lo jales — busca ayuda veterinaria para retirarlo de forma segura.",
      "Si hay dificultad para respirar por obstrucción de vía aérea: aplica Heimlich igual que con cualquier objeto sólido.",
      "Revisa si hay sangrado activo en la boca o garganta — esto indica posible perforación y requiere traslado inmediato sin importar si respira bien."
    ],
    whatNOTToDo: [
      "NUNCA jales un palo o astilla visible con fuerza — puedes causar laceraciones internas mayores al retirarlo mal.",
      "No asumas que 'si ya tosió y parece estar bien' no hay riesgo. Las astillas pueden perforar tejido y causar infección horas después."
    ],
    vetScript: "Mi perro mordió un palo y [se atoró / se lastimó la boca] hace [X] minutos. [Hay / no hay] sangrado visible. [Está / no está] respirando con dificultad."
  },
  {
    id: 10,
    title: "Escenario 04: Objeto Punzante",
    subtitle: "Agujas, anzuelos y tapas — peligro silencioso",
    type: "scenario",
    bgImage: "/panik_scenario_sharp.png",
    dangerLevel: "ROJO ABSOLUTO",
    whatToDo: [
      "Si el objeto está visible y suelto en la boca: retíralo con cuidado extremo solo si no está incrustado en tejido.",
      "Si el objeto está incrustado (anzuelo, aguja clavada) NO lo retires tú — traslado inmediato al veterinario sin manipular más.",
      "Si hay dificultad respiratoria por obstrucción: Heimlich, pero con movimientos más controlados para no empujar el objeto contra tejido."
    ],
    whatNOTToDo: [
      "NUNCA intentes retirar un anzuelo o aguja clavada jalando — puedes desgarrar tejido y causar una hemorragia mayor.",
      "No ignores la situación si el perro 'parece estar bien' después de tragar algo punzante — el daño interno puede no ser visible de inmediato."
    ],
    vetScript: "Mi perro [tragó / se atoró con] un objeto punzante ([aguja / anzuelo / tapa]) hace [X] minutos. [Está / no está] incrustado visible. [Respira con dificultad / respira normal]."
  },
  {
    id: 11,
    title: "Escenario 05: Correa o Collar Atrapado",
    subtitle: "Asfixia mecánica, no por objeto tragado",
    type: "scenario",
    bgImage: "/panik_scenario_leash.png",
    dangerLevel: "ROJO ABSOLUTO",
    whatToDo: [
      "Si el collar o correa está enganchado en algo y el perro se está ahorcando al jalar: corta la correa o el collar de inmediato, no intentes desenredarlo.",
      "Si el collar quedó demasiado apretado por hinchazón o por engancharse: corta la correa primero, afloja el collar después con cuidado.",
      "Una vez liberado, revisa si respira y si las encías recuperan color rosado en los primeros segundos."
    ],
    whatNOTToDo: [
      "NUNCA pierdas tiempo buscando las llaves del candado o intentando desenredar nudos — corta el material con tijeras o navaja de inmediato.",
      "No retires el collar por completo si sospechas lesión cervical — corta solo lo necesario para liberar la presión y traslada con cuidado."
    ],
    vetScript: "El collar/correa de mi perro quedó atrapado y [se ahorcó / hizo presión] durante aproximadamente [X] minutos. [Recuperó / no ha recuperado] su respiración normal."
  },
  {
    id: 12,
    title: "Semáforo de Decisión Rápida",
    subtitle: "Referencia de bolsillo para imprimir o guardar",
    type: "semaphore_quick",
    redSymptoms: ["No respira o boqueo sin aire entrando", "Encías azules, moradas o grises", "Pérdida de conocimiento o colapso", "No puede tragar / babeo sin control", "Rasca su cara con desesperación"],
    yellowSymptoms: ["Tose con esfuerzo pero entra algo de aire", "Estira el cuello hacia adelante al respirar", "Ruidos roncos o silbidos al inhalar", "Inquietud marcada pero responde a su nombre", "Lleva más de 1 minuto en el mismo estado"],
    greenSymptoms: ["Tosió fuerte y expulsó el objeto o lo tragó", "Respiración normal y silenciosa", "Encías de color rosa saludable", "Comportamiento tranquilo o curioso, sin angustia"]
  },
  {
    id: 13,
    title: `Directorio de Emergencias ${EMERGENCY_DIRECTORY.region}`,
    subtitle: "Guarda estos números en tus contactos de inmediato",
    type: "directory",
    bgImage: "/panik_phone_emergency.png",
    contacts: EMERGENCY_DIRECTORY.contacts
  },
  {
    id: 14,
    title: "Accede a tu Guía Interactiva",
    subtitle: "El sistema completo en la palma de tu mano",
    type: "cta_page",
    content: "Este manual en PDF te prepara para memorizar la secuencia correcta antes de la crisis. Sin embargo, en el momento exacto del atragantamiento, no hay tiempo para leer: necesitas una interfaz táctica que te diga exactamente qué hacer en 3 clics. Abre la guía interactiva mobile-first ahora mismo, agrégala a la pantalla de inicio de tu celular y mantén la calma tecnológica cuando los segundos cuenten."
  },
  {
    id: 15,
    title: "Guarda este manual.",
    subtitle: "Comparte la guía interactiva.",
    type: "closing",
    web: "somospanik.com",
    social: ["@somospanik", "@somos.panik"],
    disclaimer: "PANIK es una marca registrada. Este manual es una guía de acción rápida y no sustituye el diagnóstico de un médico veterinario profesional."
  }
];
