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
  // --- ACCESS / LOCK STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [accessCode, setAccessCode] = useState<string>("");
  const [accessError, setAccessError] = useState<string>("");

  // Check if access was previously granted on this device
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
      setAccessError("Incorrect code. Check your manual or purchase confirmation email.");
    }
  };

  // --- HANDBOOK STATE ---
  const [currentPage, setCurrentPage] = useState<number>(0);

  // --- INTERACTIVE GUIDE STATE ---
  const [isInteractiveMode, setIsInteractiveMode] = useState<boolean>(false);
  const [interactiveStep, setInteractiveModeStep] = useState<number>(1);
  const [showInteractiveResult, setShowInteractiveResult] = useState<boolean>(false);
  const [showInteractiveDirectory, setShowInteractiveDirectory] = useState<boolean>(false);

  // User answers in the interactive triage
  const [answers, setAnswers] = useState({
    breathing: "",   // Step 1: Is the dog breathing right now?
    size: "",        // Step 2: Dog size (for Heimlich technique)
    signs: "",       // Step 3: Most severe sign observed
    time: "",        // Step 4: How long has this been going on
    extra: [] as string[] // Step 5: Additional symptoms (multi-select)
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

  // --- SELECTION HANDLERS ---

  // Step 1: Is the dog breathing right now?
  const handleBreathingSelect = (val: string) => {
    setAnswers(prev => ({ ...prev, breathing: val }));
    // NOT BREATHING: jump directly to result (critical branch, skips steps 2–5)
    if (val === "Not breathing / unconscious") {
      setShowInteractiveResult(true);
      return;
    }
    setInteractiveModeStep(2);
  };

  // Step 2: Dog size
  const handleSizeSelect = (val: string) => {
    setAnswers(prev => ({ ...prev, size: val }));
    setInteractiveModeStep(3);
  };

  // Step 3: Most severe sign observed
  const handleSignsSelect = (val: string) => {
    setAnswers(prev => ({ ...prev, signs: val }));
    setInteractiveModeStep(4);
  };

  // Step 4: Time elapsed
  const handleTimeSelect = (val: string) => {
    setAnswers(prev => ({ ...prev, time: val }));
    setInteractiveModeStep(5);
  };

  // Step 5: Additional symptoms (multi-select)
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

  // --- PANIK RISK SEMAPHORE SCORING LOGIC ---
  // RED    = CRITICAL OBSTRUCTION
  // YELLOW = PARTIAL OBSTRUCTION
  // GREEN  = EPISODE RESOLVED
  const calculateResultLevel = () => {
    const { breathing, signs, time, extra } = answers;

    // 1. Not breathing / unconscious → RED directly (shortcut from Step 1)
    if (breathing === "Not breathing / unconscious") {
      return "RED";
    }

    // 2. Critical symptoms in Step 5 (multi-select) → RED directly
    const criticalExtras = ["Fainted / lost consciousness", "Stopped moving suddenly"];
    const hasCriticalExtra = extra.some(s => criticalExtras.includes(s));
    if (hasCriticalExtra) {
      return "RED";
    }

    // 3. Critical signs in Step 3 → RED directly
    const criticalSigns = [
      "Blue, purple, or gray gums",
      "Cannot swallow / drooling uncontrollably",
      "Pawing at face desperately"
    ];
    if (criticalSigns.includes(signs)) {
      return "RED";
    }

    // 4. Vomited after the episode → YELLOW (requires medical monitoring)
    if (extra.includes("Vomited")) {
      return "YELLOW";
    }

    // 5. Moderate signs in Step 3 → YELLOW
    const moderateSigns = [
      "Coughing forcefully but some air is getting through",
      "Neck stretched forward"
    ];
    if (moderateSigns.includes(signs)) {
      return "YELLOW";
    }

    // 6. Going on for more than 3 minutes, unresolved → YELLOW (escalate caution)
    if (time === "More than 3 minutes") {
      return "YELLOW";
    }

    // 7. Coughed and breathing better + no critical extras → GREEN
    if (signs === "Coughed and breathing better") {
      return "GREEN";
    }

    // 8. Default: no critical or moderate signs → GREEN
    return "GREEN";
  };

  const resultLevel = calculateResultLevel();

  // Helper: dog size in natural language for the vet script
  const sizeLabel = () => {
    switch (answers.size) {
      case "Under 10 lbs": return "small (under 10 lbs)";
      case "10–25 lbs": return "medium-small (10–25 lbs)";
      case "25–50 lbs": return "medium (25–50 lbs)";
      case "Over 50 lbs": return "large (over 50 lbs)";
      default: return "undetermined size";
    }
  };

  // --- RENDERS ---

  // RESTRICTED ACCESS SCREEN (GATEKEEPER)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Film grain background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(230,46,46,0.08)_0%,transparent_70%)] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWRGcz0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9Ii4wNSIvPgo8L3N2Zz4=')] opacity-30 pointer-events-none z-0" />

        {/* Access Container */}
        <div className="w-full max-w-md z-10 flex flex-col items-center">
          {/* PANIK Premium Logo */}
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

              <h2 className="font-serif text-2xl font-bold text-center mb-2 tracking-wide">RESTRICTED ACCESS</h2>
              <p className="font-sans text-xs text-[#AAAAAA] text-center mb-6 leading-relaxed">
                Enter your exclusive PANIK code to unlock the tactical decision manual and interactive guide.
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
                  UNLOCK SYSTEM
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security footer */}
          <div className="mt-8 flex items-center gap-2 text-[#AAAAAA] font-sans text-[9px] tracking-wider">
            <ShieldAlert className="w-3 h-3 text-[#E62E2E]" />
            <span>PANIK SECURITY SYSTEM © 2026</span>
          </div>
        </div>
      </div>
    );
  }

  // INTERACTIVE MODE (RAPID DECISION GUIDE)
  if (isInteractiveMode) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-between relative overflow-hidden font-sans">
        {/* Cinematic grain texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(230,46,46,0.05)_0%,transparent_70%)] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWRGcz0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9Ii4wNSIvPgo8L3N2Zz4=')] opacity-35 pointer-events-none z-0" />

        {/* TACTICAL HEADER */}
        <header className="border-b border-[#1A1A1A] bg-black/80 backdrop-blur-md p-4 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <img src="/logo-panik.png" alt="PANIK Logo" className="h-[32px] object-contain" />
            <div className="h-4 w-[1px] bg-[#333333]" />
            <span className="text-[10px] tracking-widest text-[#E62E2E] font-bold">INTERACTIVE MODE</span>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setIsInteractiveMode(false);
              resetInteractiveFlow();
            }}
            className="text-[#AAAAAA] hover:text-white text-xs tracking-wider font-bold flex items-center gap-1 hover:bg-transparent p-0"
          >
            <ArrowLeft className="w-4 h-4" /> BACK TO MANUAL
          </Button>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col justify-center px-4 py-6 max-w-lg mx-auto w-full z-10">

          {/* EMERGENCY DIRECTORY INSIDE INTERACTIVE MODE */}
          {showInteractiveDirectory ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="font-serif text-2xl font-bold tracking-wide text-white">EMERGENCY DIRECTORY</h2>
                <p className="text-xs text-[#AAAAAA]">Tap any card to call directly from your phone.</p>
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
                  BACK TO RESULT
                </Button>
              </div>
            </div>
          ) : showInteractiveResult ? (
            /* TRIAGE RESULTS SCREEN */
            <div className="space-y-6">
              {/* Semaphore Header */}
              <div className="text-center space-y-2">
                <span className="text-[10px] tracking-[0.2em] text-[#AAAAAA] font-bold">TACTICAL ASSESSMENT</span>

                {resultLevel === "RED" && (
                  <div className="bg-[#E62E2E]/10 border border-[#E62E2E]/30 p-6 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#E62E2E]/20 border border-[#E62E2E] flex items-center justify-center mx-auto">
                      <AlertTriangle className="w-6 h-6 text-[#E62E2E]" />
                    </div>
                    <h2 className="font-serif text-3xl font-bold tracking-wide text-[#E62E2E]">RED: CRITICAL OBSTRUCTION</h2>
                    <p className="text-xs text-white leading-relaxed">
                      Your dog's airway is compromised. Act immediately — every second reduces available oxygen.
                    </p>
                  </div>
                )}

                {resultLevel === "YELLOW" && (
                  <div className="bg-[#E8A000]/10 border border-[#E8A000]/30 p-6 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#E8A000]/20 border border-[#E8A000] flex items-center justify-center mx-auto">
                      <Clock className="w-6 h-6 text-[#E8A000]" />
                    </div>
                    <h2 className="font-serif text-3xl font-bold tracking-wide text-[#E8A000]">YELLOW: PARTIAL OBSTRUCTION</h2>
                    <p className="text-xs text-white leading-relaxed">
                      Some air is getting through, but the situation can worsen. Monitor closely and be ready to escalate to the Heimlich maneuver.
                    </p>
                  </div>
                )}

                {resultLevel === "GREEN" && (
                  <div className="bg-[#1E8A3E]/10 border border-[#1E8A3E]/30 p-6 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#1E8A3E]/20 border border-[#1E8A3E] flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6 text-[#1E8A3E]" />
                    </div>
                    <h2 className="font-serif text-3xl font-bold tracking-wide text-[#1E8A3E]">GREEN: EPISODE RESOLVED</h2>
                    <p className="text-xs text-white leading-relaxed">
                      Your dog appears to have gotten through the episode. Still, monitor closely and check for any remaining debris.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Content */}
              <div className="space-y-4">
                <div className="bg-[#121212] border border-[#222222] p-5 space-y-3">
                  <h4 className="font-sans font-bold text-xs text-white tracking-wider">WHAT TO DO NOW:</h4>
                  <ul className="text-xs text-[#AAAAAA] space-y-2 list-disc pl-4 leading-relaxed">
                    {resultLevel === "RED" && (
                      <>
                        <li>Open your dog's mouth: if you can see the object and grab it with two fingers without pushing it deeper, remove it.</li>
                        <li>If it won't come out, apply the Heimlich maneuver based on your dog's size (see the full manual, corresponding Scenario).</li>
                        <li>Call an emergency vet WHILE applying the maneuver — do not wait until you're done to ask for help.</li>
                        <li>If the dog loses consciousness, check that the airway is clear and transport immediately with the head extended, not bent.</li>
                      </>
                    )}
                    {resultLevel === "YELLOW" && (
                      <>
                        <li>Keep your dog calm — do not force them to move or walk.</li>
                        <li>Do not give water or food while the obstruction is not fully resolved.</li>
                        <li>If coughing forcefully, let it happen: natural coughing can dislodge the object on its own.</li>
                        <li>Call your vet now to describe the situation and receive specific instructions.</li>
                      </>
                    )}
                    {resultLevel === "GREEN" && (
                      <>
                        <li>Check your dog's mouth: do you see any remnants of the object or anything else inside?</li>
                        <li>Offer small amounts of water and observe whether they swallow normally.</li>
                        <li>Watch their breathing for the next 20 to 30 minutes.</li>
                        <li>Call the vet anyway to document the episode, even if everything seems fine.</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="bg-[#121212] border border-[#222222] p-5 space-y-3">
                  <h4 className="font-sans font-bold text-xs text-[#E62E2E] tracking-wider">WHAT NEVER TO DO:</h4>
                  <p className="text-xs text-[#AAAAAA] leading-relaxed">
                    {resultLevel === "RED" && "NEVER reach in blindly if you cannot see the object — you may push it deeper and fully close the airway. Do not attempt CPR if there is a visible obstruction without clearing it first. Do not apply more than 3 Heimlich cycles without result: transport immediately."}
                    {resultLevel === "YELLOW" && "NEVER give water, food, or oil thinking it will 'help it pass' — it can worsen the obstruction or cause aspiration into the lungs. Do not wait passively if the gums start to change color."}
                    {resultLevel === "GREEN" && "NEVER assume 'it's all over' without monitoring. Some objects remain partially lodged and throat swelling can appear hours later, with no immediate symptoms."}
                  </p>
                </div>

                {/* Vet script */}
                <div className="bg-[#1A1A1A] border border-[#E62E2E]/20 p-5 space-y-3">
                  <h4 className="font-sans font-bold text-xs text-white tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#E62E2E]" /> WHAT TO TELL THE VET:
                  </h4>
                  <p className="text-xs text-white italic bg-black/40 p-3 border-l-2 border-[#E62E2E] leading-relaxed">
                    "My dog is {sizeLabel()}. I think they have something stuck or had a choking episode approximately {answers.time || "an undetermined amount of time"} ago. {answers.breathing === "Not breathing / unconscious" ? "They were not breathing at the time of the episode." : `Their condition at the time was: ${answers.breathing || "undetermined"}.`} {answers.signs ? `I observed the following: ${answers.signs}.` : ""} {answers.extra.length > 0 ? `They also showed: ${answers.extra.join(", ")}.` : "No additional symptoms were observed."} Should I come in now?"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col gap-3">
                <Button
                  onClick={() => setShowInteractiveDirectory(true)}
                  className="w-full bg-[#E62E2E] hover:bg-[#c22020] text-white rounded-none h-12 text-xs font-bold tracking-wider transition-all"
                >
                  VIEW EMERGENCY DIRECTORY {EMERGENCY_DIRECTORY.region}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetInteractiveFlow}
                  className="w-full bg-transparent border border-[#333333] hover:bg-[#121212] text-white rounded-none h-12 text-xs font-bold tracking-wider"
                >
                  START TRIAGE OVER
                </Button>
              </div>
            </div>
          ) : (
            /* STEP-BY-STEP QUESTION FLOW */
            <div className="space-y-6">

              {/* Tactical Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] tracking-widest text-[#AAAAAA] font-bold">
                  <span>CANINE TRIAGE SYSTEM</span>
                  <span>STEP {interactiveStep} OF 5</span>
                </div>
                <div className="h-1 bg-[#1A1A1A] w-full">
                  <div
                    className="h-full bg-[#E62E2E] transition-all duration-300"
                    style={{ width: `${(interactiveStep / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* SCREEN 1: Is the dog breathing right now? */}
              {interactiveStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl font-bold tracking-wide text-white text-center">Is your dog breathing right now?</h3>
                  <p className="text-xs text-[#AAAAAA] text-center">If not breathing, we'll take you straight to the critical protocol.</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      "Not breathing / unconscious",
                      "Not sure / can't tell",
                      "Breathing with difficulty or making strange sounds",
                      "Coughed and seems calmer now"
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

              {/* SCREEN 2: How big is your dog? */}
              {interactiveStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl font-bold tracking-wide text-white text-center">How big is your dog?</h3>
                  <p className="text-xs text-[#AAAAAA] text-center">This determines the correct Heimlich maneuver technique.</p>
                  <div className="grid grid-cols-1 gap-2">
                    {["Under 10 lbs", "10–25 lbs", "25–50 lbs", "Over 50 lbs", "Not sure"].map((item, idx) => (
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
                    <ChevronLeft className="w-4 h-4" /> GO BACK
                  </Button>
                </div>
              )}

              {/* SCREEN 3: What do you see right now? */}
              {interactiveStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl font-bold tracking-wide text-white text-center">What do you see right now?</h3>
                  <p className="text-xs text-[#AAAAAA] text-center">Choose the most severe sign you are currently observing.</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      "Blue, purple, or gray gums",
                      "Cannot swallow / drooling uncontrollably",
                      "Pawing at face desperately",
                      "Coughing forcefully but some air is getting through",
                      "Neck stretched forward",
                      "Coughed and breathing better"
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
                    <ChevronLeft className="w-4 h-4" /> GO BACK
                  </Button>
                </div>
              )}

              {/* SCREEN 4: How long has this been going on? */}
              {interactiveStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl font-bold tracking-wide text-white text-center">How long has this been going on?</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {["Less than 1 minute", "1–3 minutes", "More than 3 minutes", "Not sure"].map((item, idx) => (
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
                    <ChevronLeft className="w-4 h-4" /> GO BACK
                  </Button>
                </div>
              )}

              {/* SCREEN 5: Anything else? (Multi-select) */}
              {interactiveStep === 5 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl font-bold tracking-wide text-white text-center">Anything else going on?</h3>
                  <p className="text-xs text-[#AAAAAA] text-center">Select all that currently apply.</p>

                  <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
                    {[
                      "None of the above",
                      "Fainted / lost consciousness",
                      "Vomited",
                      "Stopped moving suddenly",
                      "Still coughing hard"
                    ].map((symptom, idx) => {
                      const isSelected = answers.extra.includes(symptom);
                      return (
                        <Button
                          key={idx}
                          onClick={() => {
                            if (symptom === "None of the above") {
                              setAnswers(prev => ({ ...prev, extra: ["None of the above"] }));
                            } else {
                              setAnswers(prev => ({
                                ...prev,
                                extra: prev.extra.filter(s => s !== "None of the above")
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
                      GO BACK
                    </Button>
                    <Button
                      onClick={handleExtraSubmit}
                      disabled={answers.extra.length === 0}
                      className="flex-1 bg-[#E62E2E] hover:bg-[#c22020] text-white rounded-none h-12 text-xs font-bold tracking-wider disabled:opacity-50"
                    >
                      SEE RESULT
                    </Button>
                  </div>
                </div>
              )}

            </div>
          )}
        </main>

        {/* TACTICAL FOOTER */}
        <footer className="border-t border-[#1A1A1A] p-4 text-center text-[#AAAAAA] text-[9px] tracking-widest z-10 bg-black/50">
          PANIK CLINICAL DECISION SYSTEM © 2026 · DOES NOT REPLACE VETERINARY CARE
        </footer>
      </div>
    );
  }

  // HANDBOOK MODE (EDITORIAL MAGAZINE)
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

      {/* Cinematic grain texture and lighting effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(230,46,46,0.04)_0%,transparent_70%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWRGcz0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9Ii4wNSIvPgo8L3N2Zz4=')] opacity-30 pointer-events-none z-0" />

      {/* EDITORIAL HEADER */}
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
            INTERACTIVE GUIDE
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
            <Lock className="w-3.5 h-3.5" /> LOCK
          </Button>
        </div>
      </header>

      {/* PAGE CONTENT (ASYMMETRIC EDITORIAL STYLE) */}
      <main className="flex-1 flex flex-col justify-center px-4 md:px-8 py-6 md:py-12 max-w-5xl mx-auto w-full z-10">

        {/* RENDER BY PAGE TYPE */}
        {page.type === "cover" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative min-h-[60vh]">
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
                  START MANUAL
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsInteractiveMode(true)}
                  className="bg-transparent border border-[#333333] hover:bg-[#121212] text-white font-sans font-bold tracking-widest rounded-none h-12 text-xs px-8"
                >
                  OPEN INTERACTIVE GUIDE
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
                      <span className="text-[9px] tracking-widest text-[#AAAAAA] font-bold block">IMMEDIATE ACTION:</span>
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
                    DANGER: {page.dangerLevel}
                  </span>
                </div>
                <p className="text-xs text-[#AAAAAA]">{page.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#121212] border border-[#222222] p-5 space-y-3">
                  <h4 className="font-sans font-bold text-xs text-white tracking-wider">WHAT TO DO:</h4>
                  <ul className="text-xs text-[#AAAAAA] space-y-2 list-disc pl-4 leading-relaxed">
                    {page.whatToDo?.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>

                <div className="bg-[#121212] border border-[#222222] p-5 space-y-3">
                  <h4 className="font-sans font-bold text-xs text-[#E62E2E] tracking-wider">WHAT NEVER TO DO:</h4>
                  <ul className="text-xs text-[#AAAAAA] space-y-2 list-disc pl-4 leading-relaxed">
                    {page.whatNOTToDo?.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                </div>
              </div>

              {page.vetScript && (
                <div className="bg-[#1A1A1A] border border-[#E62E2E]/20 p-5 space-y-2">
                  <h4 className="font-sans font-bold text-xs text-white tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#E62E2E]" /> VET SCRIPT:
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
              {/* Red */}
              <div className="bg-[#E62E2E]/5 border border-[#E62E2E]/20 p-6 space-y-4">
                <h4 className="font-sans font-bold text-sm text-[#E62E2E] tracking-wider border-b border-[#E62E2E]/20 pb-2">RED: CRITICAL OBSTRUCTION</h4>
                <ul className="space-y-2">
                  {page.redSymptoms?.map((s, idx) => (
                    <li key={idx} className="text-xs text-[#AAAAAA] leading-relaxed flex items-start gap-1.5">
                      <span className="text-[#E62E2E]">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Yellow */}
              <div className="bg-[#E8A000]/5 border border-[#E8A000]/20 p-6 space-y-4">
                <h4 className="font-sans font-bold text-sm text-[#E8A000] tracking-wider border-b border-[#E8A000]/20 pb-2">YELLOW: PARTIAL OBSTRUCTION</h4>
                <ul className="space-y-2">
                  {page.yellowSymptoms?.map((s, idx) => (
                    <li key={idx} className="text-xs text-[#AAAAAA] leading-relaxed flex items-start gap-1.5">
                      <span className="text-[#E8A000]">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Green */}
              <div className="bg-[#1E8A3E]/5 border border-[#1E8A3E]/20 p-6 space-y-4">
                <h4 className="font-sans font-bold text-sm text-[#1E8A3E] tracking-wider border-b border-[#1E8A3E]/20 pb-2">GREEN: EPISODE RESOLVED</h4>
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
                OPEN INTERACTIVE GUIDE
              </Button>
            </div>
          </div>
        ) : (
          /* CLOSING PAGE */
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

      {/* EDITORIAL NAVIGATION CONTROLS */}
      <footer className="border-t border-[#1A1A1A] p-4 flex items-center justify-between z-10 bg-black/40">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentPage === 0}
          className="text-[#AAAAAA] hover:text-white text-xs tracking-widest font-bold disabled:opacity-30 hover:bg-transparent"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> PREVIOUS
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
          NEXT <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </footer>
    </div>
  );
}