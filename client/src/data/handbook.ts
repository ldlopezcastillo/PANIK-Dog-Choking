import { EMERGENCY_DIRECTORY } from "./directory";

// ════════════════════════════════════════════════════════════════
// HANDBOOK_PAGES — "My Dog Is Choking" System
// 15 pages · Same PANIK original manual architecture
// ════════════════════════════════════════════════════════════════

export const HANDBOOK_PAGES = [
  {
    id: 1,
    title: "My Dog Is Choking",
    subtitle: "What do I do in the first 60 seconds?",
    badge: "IMMEDIATE ACTION SYSTEM · USA",
    type: "cover",
    bgImage: "/dog-choking-closeup.png",
    description: "Tactical decision manual and rapid triage for pet owners under extreme stress. Choking and airway obstruction by foreign body."
  },
  {
    id: 2,
    title: "Why This Manual Exists",
    subtitle: "Panic paralyzes. Preparation saves lives.",
    type: "editorial",
    content: "When a dog chokes, the first 60 to 90 seconds are the 'Golden Window.' Unlike poisoning, there is no time to call first: the brain begins to suffer oxygen deprivation damage within minutes. Panic causes people to search online, scream, or blindly reach into the dog's mouth — pushing the object even deeper. This physical manual/PDF prepares you BEFORE the emergency by memorizing the correct sequence. The interactive app guides you step by step DURING the crisis, without needing to read long paragraphs. Together, they form an operating system designed to act with precision when every second counts."
  },
  {
    id: 3,
    title: "Most Common Causes",
    subtitle: "What triggers choking in dogs at home",
    type: "data",
    content: "Most choking episodes happen during play or unsupervised feeding. Knowing the most likely object helps you anticipate the risk before it occurs.",
    stats: [
      { label: "Bones & Food Chunks", value: "38%", desc: "Chicken bones, ribs, and large treat or meat pieces." },
      { label: "Balls & Toys", value: "29%", desc: "Tennis balls, small rubber toys, or broken toy parts." },
      { label: "Sticks & Wood", value: "18%", desc: "Splintered branches during fetch or outdoor play." },
      { label: "Household Objects", value: "15%", desc: "Bottle caps, needles, fish hooks, snagged collars." }
    ]
  },
  {
    id: 4,
    title: "Warning Signs",
    subtitle: "Learn to assess severity at a glance",
    type: "semaphore",
    levels: [
      {
        color: "red",
        title: "RED: CRITICAL OBSTRUCTION",
        desc: "Not breathing, blue/purple/gray gums, losing consciousness, unable to swallow or drooling uncontrollably, pawing at face desperately.",
        action: "Apply the Heimlich maneuver immediately. Call the vet while you act. Transport without waiting for improvement."
      },
      {
        color: "yellow",
        title: "YELLOW: PARTIAL OBSTRUCTION",
        desc: "Coughing forcefully but some air is getting through, neck extended forward, raspy breathing sounds, agitated but still responsive.",
        action: "Keep the dog calm. No water or food. Call the vet and monitor every minute."
      },
      {
        color: "green",
        title: "GREEN: EPISODE RESOLVED",
        desc: "Coughed hard and expelled or swallowed the object, breathing normally, pink gums, stable behavior.",
        action: "Observe for 20–30 minutes. Check the mouth for residue. Call the vet to document the episode."
      }
    ]
  },
  {
    id: 5,
    title: "Five Prevention Habits",
    subtitle: "How to dog-proof your home against choking",
    type: "prevention",
    habits: [
      { num: "01", title: "Right-Size Toys Always", desc: "Any toy or ball that fits entirely in your dog's mouth without touching the back teeth is a tracheal obstruction risk." },
      { num: "02", title: "Supervised Bone Time Only", desc: "Never leave your dog alone with chicken, rib, or turkey bones. They splinter into sharp shards that lodge or puncture." },
      { num: "03", title: "Remove Broken Toys Immediately", desc: "Pull any toy with loose parts, exposed stuffing, or detached rubber pieces right away." },
      { num: "04", title: "Supervised Fetch Sessions", desc: "Avoid long, thin sticks — they splinter in the mouth and throat when bitten or when the dog falls on them." },
      { num: "05", title: "Restrict Sewing & Fishing Areas", desc: "Needles, thread, fish hooks, and bottle caps must be out of reach; they are easily swallowed and extremely dangerous." }
    ]
  },
  {
    id: 6,
    title: "Tactical Preparedness Kit",
    subtitle: "What to have ready before the crisis",
    type: "kit",
    bgImage: "/panik_emergency_kit_choking.png",
    sections: [
      {
        title: "EQUIPMENT",
        items: ["Clean towels or cloth to grip and dry", "Cell phone flashlight always charged", "Short leash for emergency transport", "Rigid box or board for carrying small dogs"]
      },
      {
        title: "PRIOR KNOWLEDGE",
        items: ["Memorize the Heimlich maneuver for your dog's size", "Identify the fastest route to the nearest 24-hour emergency vet", "Save your dog's approximate weight in your phone", "Practice checking your dog's mouth without causing fear"]
      },
      {
        title: "CONTACTS",
        items: ["Primary vet phone number saved and visible", "Two nearest 24-hour emergency hospitals", "PANIK emergency line for your area", "Neighbor or family member who can help transport"]
      }
    ]
  },
  {
    id: 7,
    title: "Scenario 01: Bone Lodged",
    subtitle: "The most common and most dangerous cause",
    type: "scenario",
    bgImage: "/panik_scenario_bone.png",
    dangerLevel: "RED / YELLOW (Depends on location)",
    whatToDo: [
      "If the bone is lodged in the throat and the dog cannot breathe or swallow: apply the Heimlich maneuver immediately.",
      "If the dog is coughing forcefully but air is getting through, keep them calm — natural coughing may dislodge the bone on its own.",
      "If you can see the bone and it is loose in the mouth, remove it with two fingers WITHOUT pushing it deeper."
    ],
    whatNOTToDo: [
      "NEVER reach in blindly if you cannot see the object — you may push it deeper and fully close the airway.",
      "Do not give water or food thinking it will 'help wash it down.' This can worsen the obstruction or cause aspiration."
    ],
    vetScript: "My dog got a bone stuck about [X] minutes ago. They [were / were not] able to cough it out. Their gums are [color]. They [are / are not] having trouble breathing."
  },
  {
    id: 8,
    title: "Scenario 02: Ball or Toy",
    subtitle: "Full tracheal blockage in seconds",
    type: "scenario",
    bgImage: "/panik_scenario_ball.png",
    dangerLevel: "ABSOLUTE RED",
    whatToDo: [
      "If the ball is lodged in the throat and blocking breathing: apply the Heimlich maneuver immediately, do not wait.",
      "Push from behind the ribcage upward with controlled force — the goal is to generate a forced cough that expels the object.",
      "If the dog loses consciousness, check the mouth and remove the object only if you can see it and reach it without pushing it deeper."
    ],
    whatNOTToDo: [
      "NEVER try to 'push' the ball toward the stomach thinking 'it won't cause harm there' — it can get stuck further down and cause internal damage.",
      "Do not waste time identifying the exact object before acting. Act first, identify after."
    ],
    vetScript: "My dog had a ball/toy in their mouth and choked about [X] minutes ago. I [was / was not] able to dislodge it with the Heimlich. They are currently [breathing with difficulty / breathing normally]."
  },
  {
    id: 9,
    title: "Scenario 03: Splintered Stick",
    subtitle: "Double risk: obstruction and puncture",
    type: "scenario",
    bgImage: "/panik_scenario_stick.png",
    dangerLevel: "RED / YELLOW",
    whatToDo: [
      "If the stick is lodged across the mouth or throat and the dog cannot close their mouth: do NOT pull it — seek veterinary help to remove it safely.",
      "If there is breathing difficulty due to airway obstruction: apply the Heimlich maneuver as you would with any solid object.",
      "Check for active bleeding in the mouth or throat — this indicates a possible puncture and requires immediate transport regardless of breathing status."
    ],
    whatNOTToDo: [
      "NEVER forcefully pull a visible stick or splinter — improper removal can cause major internal lacerations.",
      "Do not assume that 'if they coughed and seem fine' there is no risk. Splinters can puncture tissue and cause infection hours later."
    ],
    vetScript: "My dog bit a stick and [choked / injured their mouth] about [X] minutes ago. There [is / is no] visible bleeding. They [are / are not] having trouble breathing."
  },
  {
    id: 10,
    title: "Scenario 04: Sharp Object",
    subtitle: "Needles, fish hooks, and bottle caps — silent danger",
    type: "scenario",
    bgImage: "/panik_scenario_sharp.png",
    dangerLevel: "ABSOLUTE RED",
    whatToDo: [
      "If the object is visible and loose in the mouth: remove it with extreme care only if it is not embedded in tissue.",
      "If the object is embedded (fish hook, lodged needle) do NOT remove it yourself — transport immediately to a vet without further manipulation.",
      "If there is breathing difficulty due to obstruction: apply the Heimlich maneuver, but with more controlled movements to avoid pushing the object into tissue."
    ],
    whatNOTToDo: [
      "NEVER try to pull out a lodged hook or needle — you may tear tissue and cause a major hemorrhage.",
      "Do not ignore the situation if the dog 'seems fine' after swallowing something sharp — internal damage may not be immediately visible."
    ],
    vetScript: "My dog [swallowed / choked on] a sharp object ([needle / fish hook / bottle cap]) about [X] minutes ago. It [is / is not] visibly embedded. They [are / are not] breathing with difficulty."
  },
  {
    id: 11,
    title: "Scenario 05: Collar or Leash Caught",
    subtitle: "Mechanical asphyxiation — not from a swallowed object",
    type: "scenario",
    bgImage: "/panik_scenario_leash.png",
    dangerLevel: "ABSOLUTE RED",
    whatToDo: [
      "If the collar or leash is caught on something and the dog is choking from pulling: cut the leash or collar immediately — do not try to untangle it.",
      "If the collar became too tight from swelling or snagging: cut the leash first, then carefully loosen the collar.",
      "Once freed, check whether they are breathing and whether the gums return to pink within the first few seconds."
    ],
    whatNOTToDo: [
      "NEVER waste time looking for a lock key or trying to untie knots — cut the material with scissors or a knife immediately.",
      "Do not fully remove the collar if you suspect a neck injury — cut only what is needed to relieve pressure and transport carefully."
    ],
    vetScript: "My dog's collar/leash got caught and [choked / applied pressure] for approximately [X] minutes. They [have / have not] returned to normal breathing."
  },
  {
    id: 12,
    title: "Quick Decision Semaphore",
    subtitle: "Pocket reference — print or save to your phone",
    type: "semaphore_quick",
    redSymptoms: ["Not breathing or gasping with no air entering", "Blue, purple, or gray gums", "Loss of consciousness or collapse", "Unable to swallow / drooling uncontrollably", "Pawing at face desperately"],
    yellowSymptoms: ["Coughing forcefully but some air is getting through", "Neck stretched forward when breathing", "Raspy or wheezing sounds when inhaling", "Agitated but still responds to their name", "Has been in this state for more than 1 minute"],
    greenSymptoms: ["Coughed hard and expelled or swallowed the object", "Normal, quiet breathing", "Healthy pink gum color", "Calm or curious behavior, no signs of distress"]
  },
  {
    id: 13,
    title: `Emergency Directory ${EMERGENCY_DIRECTORY.region}`,
    subtitle: "Save these numbers in your contacts right now",
    type: "directory",
    bgImage: "/panik_phone_emergency.png",
    contacts: EMERGENCY_DIRECTORY.contacts
  },
  {
    id: 14,
    title: "Access Your Interactive Guide",
    subtitle: "The full system in the palm of your hand",
    type: "cta_page",
    content: "This PDF manual prepares you to memorize the correct sequence before a crisis hits. However, in the exact moment your dog is choking, there is no time to read: you need a tactical interface that tells you exactly what to do in 3 taps. Open the mobile-first interactive guide right now, add it to your phone's home screen, and keep your head clear when every second counts."
  },
  {
    id: 15,
    title: "Save this manual.",
    subtitle: "Share the interactive guide.",
    type: "closing",
    web: "somospanik.com",
    social: ["@somospanik", "@somos.panik"],
    disclaimer: "PANIK is a registered trademark. This manual is a quick-action guide and does not replace the diagnosis of a licensed veterinary professional."
  }
];