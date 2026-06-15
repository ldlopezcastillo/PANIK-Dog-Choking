import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { HANDBOOK_PAGES } from "@/data/handbook";
import { EMERGENCY_DIRECTORY, toTelHref } from "@/data/directory";
import {
  AlertTriangle,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Phone,
  Clock,
  CheckCircle2,
  Activity,
  ArrowLeft,
  Lock,
  KeyRound
} from "lucide-react";

export default function Home() {
  // --- ESTADO DE ACCESO / BLOQUEO ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [accessCode, setAccessCode] = useState<string>("");
  const [accessError, setAccessError] = useState<string>("");

  // Verificar si ya se ha accedido anteriormente en este dispositivo
  useEffect(() => {
    const savedAccess = localStorage.getItem("panik_authenticated");
    if (savedAccess === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedCode = accessCode.trim().toUpperCase();
    if (sanitizedCode === "PANIK-2026") {
      localStorage.setItem("panik_authenticated", "true");
      setIsAuthenticated(true);
      setAccessError("");
    } else {
      setAccessError("Código incorrecto. Verifica tu manual o correo de compra.");
    }
  };

  // --- ESTADO DEL MANUAL (HANDBOOK) ---
  const [currentPage, setCurrentPage] = useState<number>(0);

  // --- ESTADO DE LA GUÍA INTERACTIVA (MODO INTERACTIVO) ---
  const [isInteractiveMode, setIsInteractiveMode] = useState<boolean>(false);
  const [interactiveStep, setInteractiveModeStep] = useState<number>(1);
  const [showInteractiveResult, setShowInteractiveResult] = useState<boolean>(false);
  const [showInteractiveDirectory, setShowInteractiveDirectory] = useState<boolean>(false);

  // Respuestas del usuario en el Triage interactivo
  const [answers, setAnswers] = useState({
    breathing: "",   // Paso 1: ¿Respira ahora mismo?
    size: "",        // Paso 2: tamaño del perro (para Heimlich)
    signs: "",       // Paso 3: signo más grave observado
    time: "",        // Paso 4: cuánto tiempo lleva así
    extra: [] as string[] // Paso 5: síntomas adicionales (multi-select)
  });

  const resetInteractiveFlow = () => {
    setAnswers({
      breathing: "",
      size: "",
      signs: "",
      time: "",
      extra: []
    });
    setInteractiveModeStep(1);
    setShowInteractiveResult(false);
    setShowInteractiveDirectory(false);
  };

  // --- HANDLERS DE SELECCIÓN ---

  // Paso 1: ¿Respira ahora mismo?
  const handleBreathingSelect = (val: string) => {
    setAnswers(prev => ({ ...prev, breathing: val }));
    // Si NO RESPIRA: salto directo a resultado (rama crítica sin pasar por 2-5)
    if (val === "No respira / está inconsciente") {
      setShowInteractiveResult(true);
      return;
    }
    setInteractiveModeStep(2);
  };

  // Paso 2: tamaño del perro
  const handleSizeSelect = (val: string) => {
    setAnswers(prev => ({ ...prev, size: val }));
    setInteractiveModeStep(3);
  };

  // Paso 3: signo más grave observado
  const handleSignsSelect = (val: string) => {
    setAnswers(prev => ({ ...prev, signs: val }));
    setInteractiveModeStep(4);
  };

  // Paso 4: tiempo transcurrido
  const handleTimeSelect = (val: string) => {
    setAnswers(prev => ({ ...prev, time: val }));
    setInteractiveModeStep(5);
  };

  // Paso 5: síntomas adicionales (multi-select)
  const toggleExtra = (symptom: string) => {
    setAnswers(prev => {
      const exists = prev.extra.includes(symptom);
      if (exists) {
        return { ...prev, extra: prev.extra.filter(s => s !== symptom) };
      } else {
        return { ...prev, extra: [...prev.extra, symptom] };
      }
    });
  };

  const handleExtraSubmit = () => {
    setShowInteractiveResult(true);
  };

  // --- LÓGICA DE CÁLCULO DEL SEMÁFORO DE RIESGO PANIK ---
  // ROJO = OBSTRUCCIÓN CRÍTICA
  // AMARILLO = OBSTRUCCIÓN PARCIAL
  // VERDE = EPISODIO RESUELTO
  const calculateResultLevel = () => {
    const { breathing, signs, time, extra } = answers;

    // 1. No respira / inconsciente → ROJO directo (atajo desde Paso 1)
    if (breathing === "No respira / está inconsciente") {
      return "RED";
    }

    // 2. Síntomas críticos en Paso 5 (multi-select) → ROJO directo
    const criticalExtras = ["Se desmayó / perdió el conocimiento", "Dejó de moverse de golpe"];
    const hasCriticalExtra = extra.some(s => criticalExtras.includes(s));
    if (hasCriticalExtra) {
      return "RED";
    }

    // 3. Signos críticos en Paso 3 → ROJO directo
    const criticalSigns = [
      "Encías azules, moradas o grises",
      "No puede tragar / babea sin control",
      "Rasca su cara con desesperación"
    ];
    if (criticalSigns.includes(signs)) {
      return "RED";
    }

    // 4. Vomitó tras el episodio → AMARILLO (requiere monitoreo médico)
    if (extra.includes("Vomitó")) {
      return "YELLOW";
    }

    // 5. Signos moderados en Paso 3 → AMARILLO
    const moderateSigns = [
      "Tose con esfuerzo pero entra algo de aire",
      "Estira el cuello hacia adelante"
    ];
    if (moderateSigns.includes(signs)) {
      return "YELLOW";
    }

    // 6. Lleva más de 3 minutos así, sin resolverse → AMARILLO (escalar precaución)
    if (time === "Más de 3 minutos") {
      return "YELLOW";
    }

    // 7. Tosió y respira mejor + sin extras críticos → VERDE
    if (signs === "Tosió y respira mejor") {
      return "GREEN";
    }

    // 8. Por defecto: si no hay señales críticas ni moderadas → VERDE
    return "GREEN";
  };

  const resultLevel = calculateResultLevel();

  // Helper: tamaño del perro en lenguaje natural para el guion
  const sizeLabel = () => {
    switch (answers.size) {
      case "Menos de 5 kg": return "pequeño (menos de 5 kg)";
      case "5–10 kg": return "mediano-pequeño (5–10 kg)";
      case "10–20 kg": return "mediano (10–20 kg)";
      case "Más de 20 kg": return "grande (más de 20 kg)";
      default: return "de tamaño no determinado";
    }
  };

  // --- RENDERS ---

  // PANTALLA DE ACCESO RESTRINGIDO (GATEKEEPER)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Grano de película de fondo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(230,46,46,0.08)_0%,transparent_70%)] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWRGcz0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9Ii4wNSIvPgo8L3N2Zz4=')] opacity-30 pointer-events-none z-0" />

        {/* Contenedor de Acceso */}
        <div className="w-full max-w-md z-10 flex flex-col items-center">
          {/* Logo PANIK Premium */}
          <div className="flex flex-col items-center mb-8">
            <img
              src="/logo-panik.png"
              alt="PANIK Logo"
              className="h-[64px] object-contain mb-4 filter drop-shadow-[0_0_15px_rgba(230,46,46,0.3)]"
            />
            <span className="font-sans text-[10px] tracking-[0.3em] text-[#E62E2E] font-bold">EMERGENCY OPERATING SYSTEM</span>
          </div>

          <Card className="w-full bg-[#121212]/80 border border-[#E62E2E]/30 backdrop-blur-xl rounded-none shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <CardContent className="p-8 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#E62E2E]/10 border border-[#E62E2E]/30 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5 text-[#E62E2E]" />
              </div>

              <h2 className="font-serif text-2xl font-bold text-center mb-2 tracking-wide">ACCESO RESTRINGIDO</h2>
              <p className="font-sans text-xs text-[#AAAAAA] text-center mb-6 leading-relaxed">
                Ingresa tu código PANIK exclusivo para desbloquear el manual de decisión táctica y la guía interactiva.
              </p>

              <form onSubmit={handleAccessSubmit} className="w-full space-y-4">
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAAAAA]" />
                  <Input
                    type="text"
                    placeholder="PANIK-XXXX"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full bg-black/50 border border-[#333333] focus:border-[#E62E2E] text-white text-center font-sans tracking-[0.2em] uppercase rounded-none h-12 pl-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>

                {accessError && (
                  <div className="flex items-center gap-2 text-[#E62E2E] bg-[#E62E2E]/10 border border-[#E62E2E]/20 p-3 text-xs font-sans">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{accessError}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#E62E2E] hover:bg-[#c22020] text-white font-sans font-bold tracking-widest rounded-none h-12 text-xs transition-all active:scale-[0.98]"
                >
                  DESBLOQUEAR SISTEMA
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Pie de página de seguridad */}
          <div className="mt-8 flex items-center gap-2 text-[#AAAAAA] font-sans text-[9px] tracking-wider">
            <ShieldAlert className="w-3 h-3 text-[#E62E2E]" />
            <span>SISTEMA DE SEGURIDAD PANIK © 2026</span>
          </div>
        </div>
      </div>
    );
  }

  // MODO INTERACTIVO (GUÍA DE DECISIÓN RÁPIDA)
  if (isInteractiveMode) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-between relative overflow-hidden font-sans">
        {/* Textura de Grano Cinematográfico */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(230,46,46,0.05)_0%,transparent_70%)] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWRGcz0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9Ii4wNSIvPgo8L3N2Zz4=')] opacity-35 pointer-events-none z-0" />

        {/* HEADER TÁCTICO */}
        <header className="border-b border-[#1A1A1A] bg-black/80 backdrop-blur-md p-4 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <img src="/logo-panik.png" alt="PANIK Logo" className="h-[32px] object-contain" />
            <div className="h-4 w-[1px] bg-[#333333]" />
            <span className="text-[10px] tracking-widest text-[#E62E2E] font-bold">MODO INTERACTIVO</span>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setIsInteractiveMode(false);
              resetInteractiveFlow();
            }}
            className="text-[#AAAAAA] hover:text-white text-xs tracking-wider font-bold flex items-center gap-1 hover:bg-transparent p-0"
          >
            <ArrowLeft className="w-4 h-4" /> VOLVER AL MANUAL
          </Button>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 flex flex-col justify-center px-4 py-6 max-w-lg mx-auto w-full z-10">

          {/* DIRECTORIO DE EMERGENCIA DENTRO DEL MODO INTERACTIVO */}
          {showInteractiveDirectory ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="font-serif text-2xl font-bold tracking-wide text-white">DIRECTORIO DE EMERGENCIA</h2>
                <p className="text-xs text-[#AAAAAA]">Toca cualquier tarjeta para llamar directamente desde tu celular.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {EMERGENCY_DIRECTORY.contacts.map((c, idx) => (
                  <a
                    href={toTelHref(c.phone)}
                    key={idx}
                    className="bg-[#121212] border border-[#333333] hover:border-[#E62E2E] p-4 flex items-center justify-between transition-all duration-300 group"
                  >
                    <div>
                      <h4 className="font-sans font-bold text-sm text-white group-hover:text-[#E62E2E] transition-colors">{c.name}</h4>
                      <p className="text-[11px] text-[#AAAAAA] mt-0.5">{c.desc}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-[#E62E2E] font-bold">{c.phone}</span>
                      <div className="w-8 h-8 rounded-full bg-[#E62E2E]/10 flex items-center justify-center border border-[#E62E2E]/20 group-hover:bg-[#E62E2E] group-hover:text-white transition-all">
                        <Phone className="w-4 h-4 text-[#E62E2E] group-hover:text-white" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  onClick={() => setShowInteractiveDirectory(false)}
                  className="flex-1 bg-transparent border border-[#333333] hover:bg-[#121212] text-white rounded-none h-12 text-xs font-bold tracking-wider"
                >
                  VOLVER AL RESULTADO
                </Button>
              </div>
            </div>
          ) : showInteractiveResult ? (
            /* PANTALLA DE RESULTADOS DEL TRIAGE */
            <div className="space-y-6">
              {/* Encabezado del Semáforo */}
              <div className="text-center space-y-2">
                <span className="text-[10px] tracking-[0.2em] text-[#AAAAAA] font-bold">DIAGNÓSTICO TÁCTICO</span>

                {resultLevel === "RED" && (
                  <div className="bg-[#E62E2E]/10 border border-[#E62E2E]/30 p-6 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#E62E2E]/20 border border-[#E62E2E] flex items-center justify-center mx-auto">
                      <AlertTriangle className="w-6 h-6 text-[#E62E2E]" />
                    </div>
                    <h2 className="font-serif text-3xl font-bold tracking-wide text-[#E62E2E]">ROJO: OBSTRUCCIÓN CRÍTICA</h2>
                    <p className="text-xs text-white leading-relaxed">
                      La vía respiratoria de tu perro está comprometida. Actúa de inmediato — cada segundo reduce el oxígeno disponible.
                    </p>
                  </div>
                )}

                {resultLevel === "YELLOW" && (
                  <div className="bg-[#E8A000]/10 border border-[#E8A000]/30 p-6 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#E8A000]/20 border border-[#E8A000] flex items-center justify-center mx-auto">
                      <Clock className="w-6 h-6 text-[#E8A000]" />
                    </div>
                    <h2 className="font-serif text-3xl font-bold tracking-wide text-[#E8A000]">AMARILLO: OBSTRUCCIÓN PARCIAL</h2>
                    <p className="text-xs text-white leading-relaxed">
                      Algo de aire está pasando, pero la situación puede empeorar. Monitorea de cerca y prepárate para escalar a Heimlich.
                    </p>
                  </div>
                )}

                {resultLevel === "GREEN" && (
                  <div className="bg-[#1E8A3E]/10 border border-[#1E8A3E]/30 p-6 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#1E8A3E]/20 border border-[#1E8A3E] flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6 text-[#1E8A3E]" />
                    </div>
                    <h2 className="font-serif text-3xl font-bold tracking-wide text-[#1E8A3E]">VERDE: EPISODIO RESUELTO</h2>
                    <p className="text-xs text-white leading-relaxed">
                      Tu perro parece haber superado el episodio. Aún así, monitorea de cerca y revisa que no haya residuos.
                    </p>
                  </div>
                )}
              </div>

              {/* Contenido de Acción */}
              <div className="space-y-4">
                <div className="bg-[#121212] border border-[#222222] p-5 space-y-3">
                  <h4 className="font-sans font-bold text-xs text-white tracking-wider">QUÉ HACER AHORA:</h4>
                  <ul className="text-xs text-[#AAAAAA] space-y-2 list-disc pl-4 leading-relaxed">
                    {resultLevel === "RED" && (
                      <>
                        <li>Abre la boca de tu perro: si ves el objeto y puedes agarrarlo con dos dedos sin empujarlo, retíralo.</li>
                        <li>Si no sale, aplica la maniobra de Heimlich según el tamaño de tu perro (ver manual completo, Escenario correspondiente).</li>
                        <li>Llama al veterinario de emergencias MIENTRAS aplicas la maniobra — no esperes a terminar para pedir ayuda.</li>
                        <li>Si pierde el conocimiento, revisa que la vía esté libre y traslada de inmediato con la cabeza extendida, no doblada.</li>
                      </>
                    )}
                    {resultLevel === "YELLOW" && (
                      <>
                        <li>Mantén a tu perro tranquilo — no lo fuerces a moverse ni a caminar.</li>
                        <li>No le des agua ni comida mientras la obstrucción no se resuelva por completo.</li>
                        <li>Si tose con fuerza, déjalo: la tos natural puede expulsar el objeto solo.</li>
                        <li>Llama a tu veterinario ahora para describir la situación y recibir indicaciones específicas.</li>
                      </>
                    )}
                    {resultLevel === "GREEN" && (
                      <>
                        <li>Revisa la boca de tu perro: ¿ves restos del objeto o algo más adentro?</li>
                        <li>Ofrécele agua en pequeñas cantidades y observa si traga con normalidad.</li>
                        <li>Observa su respiración durante los siguientes 20 a 30 minutos.</li>
                        <li>Llama al veterinario de todas formas para documentar el episodio, aunque parezca resuelto.</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="bg-[#121212] border border-[#222222] p-5 space-y-3">
                  <h4 className="font-sans font-bold text-xs text-[#E62E2E] tracking-wider">QUÉ NO HACER NUNCA:</h4>
                  <p className="text-xs text-[#AAAAAA] leading-relaxed">
                    {resultLevel === "RED" && "NUNCA metas la mano a ciegas si no ves el objeto — puedes empujarlo más adentro y cerrar la vía por completo. No apliques RCP si hay obstrucción visible sin despejarla primero. No aplique más de 3 ciclos de Heimlich sin resultado: traslada de inmediato."}
                    {resultLevel === "YELLOW" && "NUNCA le des agua, comida o aceite pensando que 'ayudará a pasar' el objeto — puede empeorar la obstrucción o provocar aspiración hacia los pulmones. No esperes pasivamente si las encías comienzan a cambiar de color."}
                    {resultLevel === "GREEN" && "NUNCA asumas que 'ya pasó todo' sin observación. Algunos objetos quedan parcialmente atorados y la inflamación de garganta puede aparecer horas después, sin síntomas inmediatos."}
                  </p>
                </div>

                {/* Guion para el veterinario */}
                <div className="bg-[#1A1A1A] border border-[#E62E2E]/20 p-5 space-y-3">
                  <h4 className="font-sans font-bold text-xs text-white tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#E62E2E]" /> QUÉ DECIRLE AL VETERINARIO:
                  </h4>
                  <p className="text-xs text-white italic bg-black/40 p-3 border-l-2 border-[#E62E2E] leading-relaxed">
                    "Mi perro es {sizeLabel()}. Creo que tiene algo atorado o tuvo un episodio de asfixia hace aproximadamente {answers.time || "un tiempo que no pude determinar"}. {answers.breathing === "No respira / está inconsciente" ? "No estaba respirando al momento del episodio." : `Su estado al momento era: ${answers.breathing || "no determinado"}.`} {answers.signs ? `Observé lo siguiente: ${answers.signs}.` : ""} {answers.extra.length > 0 ? `También presentó: ${answers.extra.join(", ")}.` : "No presentó síntomas adicionales."} ¿Puedo ir ahora?"
                  </p>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-4 flex flex-col gap-3">
                <Button
                  onClick={() => setShowInteractiveDirectory(true)}
                  className="w-full bg-[#E62E2E] hover:bg-[#c22020] text-white rounded-none h-12 text-xs font-bold tracking-wider transition-all"
                >
                  VER DIRECTORIO DE EMERGENCIA {EMERGENCY_DIRECTORY.region}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetInteractiveFlow}
                  className="w-full bg-transparent border border-[#333333] hover:bg-[#121212] text-white rounded-none h-12 text-xs font-bold tracking-wider"
                >
                  VOLVER A EMPEZAR EL DIAGNÓSTICO
                </Button>
              </div>
            </div>
          ) : (
            /* FLUJO DE PREGUNTAS PASO A PASO */
            <div className="space-y-6">

              {/* Barra de Progreso Táctica */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] tracking-widest text-[#AAAAAA] font-bold">
                  <span>SISTEMA DE TRIAGE CANINO</span>
                  <span>PASO {interactiveStep} DE 5</span>
                </div>
                <div className="h-1 bg-[#1A1A1A] w-full">
                  <div
                    className="h-full bg-[#E62E2E] transition-all duration-300"
                    style={{ width: `${(interactiveStep / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* PANTALLA 1: ¿Respira ahora mismo? */}
              {interactiveStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl font-bold tracking-wide text-white text-center">¿Respira ahora mismo?</h3>
                  <p className="text-xs text-[#AAAAAA] text-center">Si no respira, te llevamos directo al protocolo crítico.</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      "No respira / está inconsciente",
                      "No sé / no estoy seguro",
                      "Respira con dificultad o hace ruidos raros",
                      "Tosió y ya está más tranquilo"
                    ].map((item, idx) => (
                      <Button
                        key={idx}
                        onClick={() => handleBreathingSelect(item)}
                        className="w-full bg-[#121212] hover:bg-[#1A1A1A] border border-[#333333] hover:border-[#E62E2E] text-white text-left justify-start rounded-none h-14 px-6 text-sm font-sans tracking-wide transition-all"
                      >
                        <span className="text-[#E62E2E] font-bold mr-3 font-mono">0{idx+1}.</span> {item}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* PANTALLA 2: ¿Qué tamaño es tu perro? */}
              {interactiveStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl font-bold tracking-wide text-white text-center">¿Qué tamaño es tu perro?</h3>
                  <p className="text-xs text-[#AAAAAA] text-center">Esto determina la técnica de Heimlich correcta.</p>
                  <div className="grid grid-cols-1 gap-2">
                    {["Menos de 5 kg", "5–10 kg", "10–20 kg", "Más de 20 kg", "No sé"].map((item, idx) => (
                      <Button
                        key={idx}
                        onClick={() => handleSizeSelect(item)}
                        className="w-full bg-[#121212] hover:bg-[#1A1A1A] border border-[#333333] hover:border-[#E62E2E] text-white text-left justify-start rounded-none h-14 px-6 text-sm font-sans tracking-wide transition-all"
                      >
                        <span className="text-[#E62E2E] font-bold mr-3 font-mono">0{idx+1}.</span> {item}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setInteractiveModeStep(1)}
                    className="text-[#AAAAAA] hover:text-white text-xs tracking-wider font-bold flex items-center gap-1 mx-auto mt-4"
                  >
                    <ChevronLeft className="w-4 h-4" /> REGRESAR
                  </Button>
                </div>
              )}

              {/* PANTALLA 3: ¿Qué ves en este momento? */}
              {interactiveStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl font-bold tracking-wide text-white text-center">¿Qué ves en este momento?</h3>
                  <p className="text-xs text-[#AAAAAA] text-center">Elige el signo más grave que observas ahora.</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      "Encías azules, moradas o grises",
                      "No puede tragar / babea sin control",
                      "Rasca su cara con desesperación",
                      "Tose con esfuerzo pero entra algo de aire",
                      "Estira el cuello hacia adelante",
                      "Tosió y respira mejor"
                    ].map((item, idx) => (
                      <Button
                        key={idx}
                        onClick={() => handleSignsSelect(item)}
                        className="w-full bg-[#121212] hover:bg-[#1A1A1A] border border-[#333333] hover:border-[#E62E2E] text-white text-left justify-start rounded-none h-14 px-6 text-sm font-sans tracking-wide transition-all"
                      >
                        <span className="text-[#E62E2E] font-bold mr-3 font-mono">0{idx+1}.</span> {item}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setInteractiveModeStep(2)}
                    className="text-[#AAAAAA] hover:text-white text-xs tracking-wider font-bold flex items-center gap-1 mx-auto mt-4"
                  >
                    <ChevronLeft className="w-4 h-4" /> REGRESAR
                  </Button>
                </div>
              )}

              {/* PANTALLA 4: ¿Cuánto tiempo lleva así? */}
              {interactiveStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl font-bold tracking-wide text-white text-center">¿Cuánto tiempo lleva así?</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {["Menos de 1 minuto", "1–3 minutos", "Más de 3 minutos", "No sé"].map((item, idx) => (
                      <Button
                        key={idx}
                        onClick={() => handleTimeSelect(item)}
                        className="w-full bg-[#121212] hover:bg-[#1A1A1A] border border-[#333333] hover:border-[#E62E2E] text-white text-left justify-start rounded-none h-14 px-6 text-sm font-sans tracking-wide transition-all"
                      >
                        <span className="text-[#E62E2E] font-bold mr-3 font-mono">0{idx+1}.</span> {item}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setInteractiveModeStep(3)}
                    className="text-[#AAAAAA] hover:text-white text-xs tracking-wider font-bold flex items-center gap-1 mx-auto mt-4"
                  >
                    <ChevronLeft className="w-4 h-4" /> REGRESAR
                  </Button>
                </div>
              )}

              {/* PANTALLA 5: ¿Tiene algo de esto también? (Selección Múltiple) */}
              {interactiveStep === 5 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl font-bold tracking-wide text-white text-center">¿Tiene algo de esto también?</h3>
                  <p className="text-xs text-[#AAAAAA] text-center">Selecciona todos los que apliquen actualmente.</p>

                  <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
                    {[
                      "No, nada más",
                      "Se desmayó / perdió el conocimiento",
                      "Vomitó",
                      "Dejó de moverse de golpe",
                      "Sigue tosiendo fuerte"
                    ].map((symptom, idx) => {
                      const isSelected = answers.extra.includes(symptom);
                      return (
                        <Button
                          key={idx}
                          onClick={() => {
                            if (symptom === "No, nada más") {
                              setAnswers(prev => ({ ...prev, extra: ["No, nada más"] }));
                            } else {
                              setAnswers(prev => ({
                                ...prev,
                                extra: prev.extra.filter(s => s !== "No, nada más")
                              }));
                              toggleExtra(symptom);
                            }
                          }}
                          className={`w-full text-left justify-start rounded-none h-14 px-6 text-sm font-sans tracking-wide transition-all ${
                            isSelected
                              ? "bg-[#E62E2E] hover:bg-[#c22020] text-white border border-[#E62E2E]"
                              : "bg-[#121212] hover:bg-[#1A1A1A] border border-[#333333]"
                          }`}
                        >
                          <span className={`font-mono font-bold mr-3 ${isSelected ? "text-white" : "text-[#E62E2E]"}`}>
                            {isSelected ? "✓" : `0${idx+1}.`}
                          </span>
                          {symptom}
                        </Button>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setInteractiveModeStep(4)}
                      className="flex-1 bg-transparent border border-[#333333] hover:bg-[#121212] text-white rounded-none h-12 text-xs font-bold tracking-wider"
                    >
                      REGRESAR
                    </Button>
                    <Button
                      onClick={handleExtraSubmit}
                      disabled={answers.extra.length === 0}
                      className="flex-1 bg-[#E62E2E] hover:bg-[#c22020] text-white rounded-none h-12 text-xs font-bold tracking-wider disabled:opacity-50"
                    >
                      VER RESULTADO
                    </Button>
                  </div>
                </div>
              )}

            </div>
          )}
        </main>

        {/* FOOTER TÁCTICO */}
        <footer className="border-t border-[#1A1A1A] p-4 text-center text-[#AAAAAA] text-[9px] tracking-widest z-10 bg-black/50">
          SISTEMA DE DECISIÓN CLÍNICA PANIK © 2026 · NO REEMPLAZA ATENCIÓN VETERINARIA
        </footer>
      </div>
    );
  }

  // MODO HANDBOOK (REVISTA EDITORIAL)
  const page = HANDBOOK_PAGES[currentPage];

  const handleNext = () => {
    if (currentPage < HANDBOOK_PAGES.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-between relative overflow-hidden font-sans">

      {/* Textura de Grano Cinematográfico y Efectos de Iluminación */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(230,46,46,0.04)_0%,transparent_70%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWRGcz0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9Ii4wNSIvPgo8L3N2Zz4=')] opacity-30 pointer-events-none z-0" />

      {/* HEADER EDITORIAL */}
      <header className="border-b border-[#1A1A1A] bg-black/60 backdrop-blur-md p-4 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <img src="/logo-panik.png" alt="PANIK Logo" className="h-[32px] md:h-[42px] object-contain" />
          <div className="h-4 w-[1px] bg-[#333333]" />
          <span className="text-[9px] md:text-[10px] tracking-widest text-[#AAAAAA] font-bold">EMERGENCY OPERATING SYSTEM</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsInteractiveMode(true)}
            className="bg-[#E62E2E] hover:bg-[#c22020] text-white text-[10px] md:text-xs tracking-wider font-bold rounded-none px-4 h-9 transition-all active:scale-[0.98]"
          >
            GUÍA INTERACTIVA
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.removeItem("panik_authenticated");
              setIsAuthenticated(false);
              setAccessCode("");
            }}
            className="text-[#AAAAAA] hover:text-[#E62E2E] text-[10px] tracking-wider font-bold flex items-center gap-1 hover:bg-transparent p-0"
          >
            <Lock className="w-3.5 h-3.5" /> BLOQUEAR
          </Button>
        </div>
      </header>

      {/* CONTENIDO DE PÁGINA (ESTILO EDITORIAL ASIMÉTRICO) */}
      <main className="flex-1 flex flex-col justify-center px-4 md:px-8 py-6 md:py-12 max-w-5xl mx-auto w-full z-10">

        {/* RENDER SEGÚN TIPO DE PÁGINA */}
        {page.type === "cover" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative min-h-[60vh]">
            {/* Imagen de fondo integrada de forma asimétrica */}
            {page.bgImage && (
              <div className="lg:col-span-7 w-full h-[250px] sm:h-[350px] lg:h-[500px] relative overflow-hidden border border-[#1A1A1A] group">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0A0A0A] z-10" />
                <img
                  src={page.bgImage}
                  alt="Dog choking closeup"
                  className="w-full h-full object-cover object-center filter grayscale contrast-125 brightness-75 transition-all duration-700 group-hover:scale-105"
                />
              </div>
            )}

            <div className="lg:col-span-5 space-y-6 lg:pl-4 text-center lg:text-left">
              <span className="text-[10px] md:text-xs tracking-[0.2em] text-[#E62E2E] font-bold block">{page.badge}</span>
              <div className="space-y-2">
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
                  {page.title}
                </h1>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#E62E2E] italic">
                  {page.subtitle}
                </h2>
              </div>
              <p className="text-xs md:text-sm text-[#AAAAAA] max-w-md mx-auto lg:mx-0 leading-relaxed">
                {page.description}
              </p>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button
                  onClick={handleNext}
                  className="bg-[#E62E2E] hover:bg-[#c22020] text-white font-sans font-bold tracking-widest rounded-none h-12 text-xs px-8 transition-all active:scale-[0.98]"
                >
                  INICIAR MANUAL
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsInteractiveMode(true)}
                  className="bg-transparent border border-[#333333] hover:bg-[#121212] text-white font-sans font-bold tracking-widest rounded-none h-12 text-xs px-8"
                >
                  ABRIR GUÍA INTERACTIVA
                </Button>
              </div>
            </div>
          </div>
        ) : page.type === "editorial" ? (
          <div className="max-w-3xl mx-auto space-y-6 text-center">
            <span className="text-[10px] tracking-[0.3em] text-[#E62E2E] font-bold">SEC. {currentPage + 1} / {HANDBOOK_PAGES.length}</span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-wide text-white">{page.title}</h2>
            <h3 className="font-serif text-xl sm:text-2xl text-[#E62E2E] italic">{page.subtitle}</h3>
            <div className="h-[1px] w-16 bg-[#E62E2E] mx-auto my-6" />
            <p className="text-sm sm:text-base text-white leading-relaxed font-sans max-w-2xl mx-auto text-justify">
              {page.content}
            </p>
          </div>
        ) : page.type === "data" ? (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <span className="text-[10px] tracking-[0.3em] text-[#E62E2E] font-bold">SEC. {currentPage + 1} / {HANDBOOK_PAGES.length}</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide text-white">{page.title}</h2>
              <p className="text-xs text-[#AAAAAA] max-w-md mx-auto">{page.content}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {page.stats?.map((stat, idx) => (
                <div key={idx} className="bg-[#121212] border border-[#222222] p-6 space-y-4 relative overflow-hidden group hover:border-[#E62E2E] transition-all duration-300">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#E62E2E]/5 to-transparent pointer-events-none" />
                  <span className="font-mono text-[10px] text-[#E62E2E] font-bold">0{idx+1}</span>
                  <div className="space-y-1">
                    <span className="font-serif text-4xl font-bold text-white tracking-tight">{stat.value}</span>
                    <h4 className="font-sans font-bold text-xs text-white tracking-wider">{stat.label}</h4>
                  </div>
                  <p className="text-[11px] text-[#AAAAAA] leading-relaxed">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : page.type === "semaphore" ? (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <span className="text-[10px] tracking-[0.3em] text-[#E62E2E] font-bold">SEC. {currentPage + 1} / {HANDBOOK_PAGES.length}</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide text-white">{page.title}</h2>
              <p className="text-xs text-[#AAAAAA]">{page.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {page.levels?.map((lvl, idx) => {
                const isRed = lvl.color === "red";
                const isYellow = lvl.color === "yellow";
                const colorHex = isRed ? "#E62E2E" : isYellow ? "#E8A000" : "#1E8A3E";
                return (
                  <div
                    key={idx}
                    className="border p-6 space-y-4 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01]"
                    style={{
                      backgroundColor: `${colorHex}08`,
                      borderColor: `${colorHex}30`
                    }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorHex }} />
                        <h4 className="font-sans font-bold text-xs tracking-wider" style={{ color: colorHex }}>{lvl.title}</h4>
                      </div>
                      <p className="text-xs text-white leading-relaxed">{lvl.desc}</p>
                    </div>
                    <div className="pt-4 border-t border-[#222222] space-y-1">
                      <span className="text-[9px] tracking-widest text-[#AAAAAA] font-bold block">ACCIÓN INMEDIATA:</span>
                      <p className="text-xs text-[#AAAAAA] italic leading-relaxed">{lvl.action}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : page.type === "prevention" ? (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <span className="text-[10px] tracking-[0.3em] text-[#E62E2E] font-bold">SEC. {currentPage + 1} / {HANDBOOK_PAGES.length}</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide text-white">{page.title}</h2>
              <p className="text-xs text-[#AAAAAA]">{page.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {page.habits?.map((h, idx) => (
                <div key={idx} className="bg-[#121212] border border-[#222222] p-5 space-y-4 flex flex-col justify-between hover:border-[#E62E2E] transition-all duration-300">
                  <span className="font-serif text-3xl font-bold text-[#E62E2E]">{h.num}</span>
                  <div className="space-y-2">
                    <h4 className="font-sans font-bold text-xs text-white tracking-wider leading-tight">{h.title}</h4>
                    <p className="text-[11px] text-[#AAAAAA] leading-relaxed">{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : page.type === "kit" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {page.bgImage && (
              <div className="lg:col-span-5 w-full h-[250px] sm:h-[350px] lg:h-[450px] relative overflow-hidden border border-[#1A1A1A]">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0A0A0A] z-10" />
                <img
                  src={page.bgImage}
                  alt="Emergency kit"
                  className="w-full h-full object-cover filter grayscale contrast-125 brightness-75"
                />
              </div>
            )}

            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] tracking-[0.3em] text-[#E62E2E] font-bold">SEC. {currentPage + 1} / {HANDBOOK_PAGES.length}</span>
                <h2 className="font-serif text-3xl font-bold tracking-wide text-white">{page.title}</h2>
                <p className="text-xs text-[#AAAAAA]">{page.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {page.sections?.map((sec, idx) => (
                  <div key={idx} className="bg-[#121212] border border-[#222222] p-4 space-y-3">
                    <h4 className="font-sans font-bold text-[10px] text-[#E62E2E] tracking-widest">{sec.title}</h4>
                    <ul className="space-y-2">
                      {sec.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="text-[11px] text-white leading-relaxed flex items-start gap-1.5">
                          <span className="text-[#E62E2E] mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : page.type === "scenario" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {page.bgImage && (
              <div className="lg:col-span-5 w-full h-[250px] sm:h-[350px] lg:h-[450px] relative overflow-hidden border border-[#1A1A1A]">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0A0A0A] z-10" />
                <img
                  src={page.bgImage}
                  alt="Scenario visual"
                  className="w-full h-full object-cover filter grayscale contrast-125 brightness-75"
                />
              </div>
            )}

            <div className={`space-y-6 ${page.bgImage ? "lg:col-span-7" : "lg:col-span-12 max-w-3xl mx-auto"}`}>
              <div className="space-y-1">
                <span className="text-[10px] tracking-[0.3em] text-[#E62E2E] font-bold">SEC. {currentPage + 1} / {HANDBOOK_PAGES.length}</span>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-serif text-3xl font-bold tracking-wide text-white">{page.title}</h2>
                  <span className="bg-[#E62E2E]/10 border border-[#E62E2E]/30 text-[#E62E2E] text-[9px] font-bold tracking-wider px-2.5 py-1 uppercase rounded-none">
                    PELIGRO: {page.dangerLevel}
                  </span>
                </div>
                <p className="text-xs text-[#AAAAAA]">{page.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#121212] border border-[#222222] p-5 space-y-3">
                  <h4 className="font-sans font-bold text-xs text-white tracking-wider">QUÉ HACER:</h4>
                  <ul className="text-xs text-[#AAAAAA] space-y-2 list-disc pl-4 leading-relaxed">
                    {page.whatToDo?.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>

                <div className="bg-[#121212] border border-[#222222] p-5 space-y-3">
                  <h4 className="font-sans font-bold text-xs text-[#E62E2E] tracking-wider">QUÉ NO HACER NUNCA:</h4>
                  <ul className="text-xs text-[#AAAAAA] space-y-2 list-disc pl-4 leading-relaxed">
                    {page.whatNOTToDo?.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
              </div>

              {page.vetScript && (
                <div className="bg-[#1A1A1A] border border-[#E62E2E]/20 p-5 space-y-2">
                  <h4 className="font-sans font-bold text-xs text-white tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#E62E2E]" /> GUION PARA EL VETERINARIO:
                  </h4>
                  <p className="text-xs text-[#AAAAAA] italic leading-relaxed">
                    {page.vetScript}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : page.type === "semaphore_quick" ? (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <span className="text-[10px] tracking-[0.3em] text-[#E62E2E] font-bold">SEC. {currentPage + 1} / {HANDBOOK_PAGES.length}</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide text-white">{page.title}</h2>
              <p className="text-xs text-[#AAAAAA]">{page.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Rojo */}
              <div className="bg-[#E62E2E]/5 border border-[#E62E2E]/20 p-6 space-y-4">
                <h4 className="font-sans font-bold text-sm text-[#E62E2E] tracking-wider border-b border-[#E62E2E]/20 pb-2">ROJO: OBSTRUCCIÓN CRÍTICA</h4>
                <ul className="space-y-2">
                  {page.redSymptoms?.map((s, idx) => (
                    <li key={idx} className="text-xs text-[#AAAAAA] leading-relaxed flex items-start gap-1.5">
                      <span className="text-[#E62E2E]">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Amarillo */}
              <div className="bg-[#E8A000]/5 border border-[#E8A000]/20 p-6 space-y-4">
                <h4 className="font-sans font-bold text-sm text-[#E8A000] tracking-wider border-b border-[#E8A000]/20 pb-2">AMARILLO: OBSTRUCCIÓN PARCIAL</h4>
                <ul className="space-y-2">
                  {page.yellowSymptoms?.map((s, idx) => (
                    <li key={idx} className="text-xs text-[#AAAAAA] leading-relaxed flex items-start gap-1.5">
                      <span className="text-[#E8A000]">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Verde */}
              <div className="bg-[#1E8A3E]/5 border border-[#1E8A3E]/20 p-6 space-y-4">
                <h4 className="font-sans font-bold text-sm text-[#1E8A3E] tracking-wider border-b border-[#1E8A3E]/20 pb-2">VERDE: EPISODIO RESUELTO</h4>
                <ul className="space-y-2">
                  {page.greenSymptoms?.map((s, idx) => (
                    <li key={idx} className="text-xs text-[#AAAAAA] leading-relaxed flex items-start gap-1.5">
                      <span className="text-[#1E8A3E]">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : page.type === "directory" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {page.bgImage && (
              <div className="lg:col-span-5 w-full h-[250px] sm:h-[350px] lg:h-[450px] relative overflow-hidden border border-[#1A1A1A]">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0A0A0A] z-10" />
                <img
                  src={page.bgImage}
                  alt="Phone emergency"
                  className="w-full h-full object-cover filter grayscale contrast-125 brightness-75"
                />
              </div>
            )}

            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] tracking-[0.3em] text-[#E62E2E] font-bold">SEC. {currentPage + 1} / {HANDBOOK_PAGES.length}</span>
                <h2 className="font-serif text-3xl font-bold tracking-wide text-white">{page.title}</h2>
                <p className="text-xs text-[#AAAAAA]">{page.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {page.contacts?.map((c, idx) => (
                  <a
                    href={toTelHref(c.phone)}
                    key={idx}
                    className="bg-[#121212] border border-[#222222] hover:border-[#E62E2E] p-4 flex items-center justify-between transition-all group"
                  >
                    <div>
                      <h4 className="font-sans font-bold text-xs text-white group-hover:text-[#E62E2E] transition-colors">{c.name}</h4>
                      <p className="text-[10px] text-[#AAAAAA] mt-0.5">{c.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#E62E2E] font-bold">{c.phone}</span>
                      <Phone className="w-3.5 h-3.5 text-[#E62E2E]" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : page.type === "cta_page" ? (
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <span className="text-[10px] tracking-[0.3em] text-[#E62E2E] font-bold">SEC. {currentPage + 1} / {HANDBOOK_PAGES.length}</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide text-white">{page.title}</h2>
            <h3 className="font-serif text-xl sm:text-2xl text-[#E62E2E] italic">{page.subtitle}</h3>
            <div className="h-[1px] w-16 bg-[#E62E2E] mx-auto my-4" />
            <p className="text-xs sm:text-sm text-[#AAAAAA] leading-relaxed max-w-xl mx-auto text-justify">
              {page.content}
            </p>
            <div className="pt-6">
              <Button
                onClick={() => setIsInteractiveMode(true)}
                className="bg-[#E62E2E] hover:bg-[#c22020] text-white font-sans font-bold tracking-widest rounded-none h-14 text-xs px-10 transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(230,46,46,0.3)]"
              >
                ABRIR GUÍA INTERACTIVA
              </Button>
            </div>
          </div>
        ) : (
          /* PÁGINA DE CIERRE */
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="flex flex-col items-center mb-6">
              <img src="/logo-panik.png" alt="PANIK Logo" className="h-[64px] object-contain mb-4 filter drop-shadow-[0_0_15px_rgba(230,46,46,0.2)]" />
              <span className="text-[10px] tracking-[0.3em] text-[#E62E2E] font-bold">EMERGENCY OPERATING SYSTEM</span>
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-4xl font-bold tracking-wide text-white">{page.title}</h2>
              <h3 className="font-serif text-2xl text-[#E62E2E] italic">{page.subtitle}</h3>
            </div>

            <div className="h-[1px] w-16 bg-[#E62E2E] mx-auto my-4" />

            <div className="space-y-4">
              <span className="font-mono text-sm text-white tracking-widest block">{page.web}</span>
              <div className="flex justify-center gap-6 text-xs text-[#AAAAAA] font-mono tracking-wider">
                {page.social?.map((s, idx) => <span key={idx}>{s}</span>)}
              </div>
            </div>

            <p className="text-[9px] text-[#AAAAAA] max-w-md mx-auto leading-relaxed pt-8 border-t border-[#1A1A1A]">
              {page.disclaimer}
            </p>
          </div>
        )}

      </main>

      {/* CONTROLES DE NAVEGACIÓN EDITORIAL */}
      <footer className="border-t border-[#1A1A1A] p-4 flex items-center justify-between z-10 bg-black/40">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentPage === 0}
          className="text-[#AAAAAA] hover:text-white text-xs tracking-widest font-bold disabled:opacity-30 hover:bg-transparent"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> ANTERIOR
        </Button>

        <div className="flex items-center gap-1.5">
          {HANDBOOK_PAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`h-1 transition-all duration-300 ${
                idx === currentPage
                  ? "w-6 bg-[#E62E2E]"
                  : "w-1.5 bg-[#333333] hover:bg-[#555555]"
              }`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          onClick={handleNext}
          disabled={currentPage === HANDBOOK_PAGES.length - 1}
          className="text-[#AAAAAA] hover:text-white text-xs tracking-widest font-bold disabled:opacity-30 hover:bg-transparent"
        >
          SIGUIENTE <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </footer>
    </div>
  );
}
