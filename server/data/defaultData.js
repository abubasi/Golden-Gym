const defaultPlans = [
  {
    name: "Basic",
    accessLabel: "One Month Access",
    monthly: 600,
    yearly: 5000,
    billingVisibility: ["monthly"],
    features: [
      "Gym floor access",
      "2 group classes / week",
      "Free fitness assessment",
    ],
  },
  {
    name: "Pro",
    accessLabel: "Three Month Access",
    monthly: 1600,
    yearly: 5999,
    billingVisibility: ["monthly"],
    features: [
      "All classes included",
      "2 PT sessions / month",
      "Custom diet guidance",
    ],
  },
  {
    name: "Pro Max",
    accessLabel: "Six Month Access",
    monthly: 3000,
    yearly: 8999,
    billingVisibility: ["monthly"],
    features: [
      "Unlimited class access",
      "4 PT sessions / month",
      "Nutrition and recovery reviews",
    ],
  },
  {
    name: "Elite",
    accessLabel: "One Year Access",
    monthly: 5999,
    yearly: 5999,
    billingVisibility: ["yearly"],
    features: [
      "Unlimited PT coaching",
      "Recovery lounge access",
      "Priority nutrition support",
    ],
  },
];

const defaultTrainers = [
  {
    name: "Marcus Cole",
    specialty: "Strength & Conditioning",
    bio: "Build strength, fix technique, and progress with structured coaching blocks.",
    imageUrl:
      "https://tse4.mm.bing.net/th/id/OIP.JF1Ha3zAXPKUoRrB7Oar2QHaE8?rs=1&pid=ImgDetMain&o=7&rm=3",
    rating: 5,
    active: true,
    displayOrder: 1,
  },
  {
    name: "Elena Brooks",
    specialty: "Mobility & Functional Fitness",
    bio: "Improve movement quality, flexibility, and resilience for daily life and training.",
    imageUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
    rating: 5,
    active: true,
    displayOrder: 2,
  },
  {
    name: "Adrian Ross",
    specialty: "HIIT & Fat Loss Coaching",
    bio: "High-intensity conditioning and smart fat-loss plans tailored to your schedule.",
    imageUrl:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=80",
    rating: 5,
    active: true,
    displayOrder: 3,
  },
  {
    name: "Nina Hart",
    specialty: "Body Recomposition",
    bio: "Dial in body composition with progressive training, recovery, and meal structure.",
    imageUrl:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
    rating: 5,
    active: true,
    displayOrder: 4,
  },
];

const defaultClasses = [
  {
    title: "Power Lift Lab",
    coach: "Marcus Cole",
    schedule: "Mon, Wed, Fri - 6:00 AM",
    duration: "60 min",
    intensity: "High",
    description: "Technique-focused barbell training for strength and performance gains.",
    active: true,
    displayOrder: 1,
  },
  {
    title: "Mobility Reset",
    coach: "Elena Brooks",
    schedule: "Tue, Thu - 7:00 AM",
    duration: "45 min",
    intensity: "Low",
    description: "Restore mobility, reduce stiffness, and improve movement quality.",
    active: true,
    displayOrder: 2,
  },
  {
    title: "Shred Circuit",
    coach: "Adrian Ross",
    schedule: "Mon to Sat - 7:00 PM",
    duration: "50 min",
    intensity: "High",
    description: "Fast-paced conditioning circuits to burn calories and boost endurance.",
    active: true,
    displayOrder: 3,
  },
  {
    title: "Lean Build Flow",
    coach: "Nina Hart",
    schedule: "Tue, Thu, Sat - 5:30 PM",
    duration: "55 min",
    intensity: "Medium",
    description: "Balanced programming for sculpting muscle while improving stamina.",
    active: true,
    displayOrder: 4,
  },
];

module.exports = {
  defaultPlans,
  defaultTrainers,
  defaultClasses,
};
