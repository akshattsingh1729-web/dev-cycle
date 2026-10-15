/**
 * DEV CYCLE - VELOX FITNESS & CYCLES
 * Central Data Store and Product Catalog
 * All prices in Indian National Rupees (INR / ₹)
 */

window.DEV_CONFIG = {
  brandName: "DEV CYCLE",
  subTitle: "VELOX FITNESS & CYCLES",
  tagline: "RIDE BEYOND LIMITS.",
  phone: "+91 7717745050",
  whatsappNumber: "7717745050",
  whatsappMessage: "Hello Dev Cycle, I would like to inquire about your premium cycles & gym equipment.",
  email: "concierge@devcycle.in",
  address: "Akharaghat main road,opposite to Help Clinic, Zeromile, Muzaffarpur, Bihar 842002",
  businessHours: "Mon - Sun: 07:30 AM – 09:00 PM IST",
  supportHours: "24/7 Concierge & WhatsApp Assistance",
  currency: "₹"
};

window.PRODUCTS_DATA = [
  // ===================== PERFORMANCE BICYCLES =====================
  {
    id: "bike-01",
    name: "Velox Apex S5 Carbon Aero",
    category: "cycles",
    subCategory: "Road Racing",
    brand: "Velox Apex",
    price: 385000,
    originalPrice: 425000,
    discount: "9% OFF",
    rating: 4.9,
    reviewsCount: 38,
    isFeatured: true,
    badge: "Flagship Aero",
    image: "assets/images/bike_road.jpg",
    colors: [
      { name: "Stealth Onyx", hex: "#111315" },
      { name: "Electric Lime", hex: "#10b981" },
      { name: "Hyper Platinum", hex: "#e2e8f0" }
    ],
    specs: {
      frame: "Toray T1100 1K Monocoque Carbon",
      groupset: "Shimano Dura-Ace Di2 12-Speed Electronic",
      brakes: "Hydraulic Disc 160mm Ice-Tech Freeza",
      wheelset: "DT Swiss ARC 1100 Dicut 50mm Carbon",
      weight: "6.85 kg",
      tires: "Continental Grand Prix 5000 S TR 28mm"
    },
    description: "Built for pure unadulterated velocity. The Velox Apex S5 features aerodynamic tube profiles shaped in wind tunnels, seamless internal cable routing, and ultra-stiff power transfer."
  },
  {
    id: "bike-02",
    name: "Trek Madone SLR 9 Gen 7",
    category: "cycles",
    subCategory: "Road Racing",
    brand: "Trek",
    price: 920000,
    originalPrice: 980000,
    discount: "6% OFF",
    rating: 5.0,
    reviewsCount: 24,
    isFeatured: true,
    badge: "WorldTour Proven",
    image: "assets/images/hero_ebike.jpg",
    colors: [
      { name: "Deep Matte Black", hex: "#18181b" },
      { name: "Neon Race Green", hex: "#22c55e" },
      { name: "Metallic Chrome", hex: "#cbd5e1" }
    ],
    specs: {
      frame: "800 Series OCLV Carbon with IsoFlow",
      groupset: "SRAM RED eTap AXS Wireless 12-Speed",
      brakes: "SRAM Red eTap Hydraulic Disc",
      wheelset: "Bontrager Aeolus RSL 51 Carbon",
      weight: "7.10 kg",
      tires: "Pirelli P Zero Race TLR 28c"
    },
    description: "The ultimate race bike. IsoFlow technology delivers compliant aerodynamic performance, shedding grams while smoothing road imperfections."
  },
  {
    id: "bike-03",
    name: "Velox Terra Gravel Carbon X",
    category: "cycles",
    subCategory: "Gravel & Adventure",
    brand: "Velox Apex",
    price: 245000,
    originalPrice: 270000,
    discount: "9% OFF",
    rating: 4.8,
    reviewsCount: 19,
    isFeatured: false,
    badge: "Adventure Ready",
    image: "assets/images/bike_road.jpg",
    colors: [
      { name: "Graphite Slate", hex: "#334155" },
      { name: "Forest Olive", hex: "#15803d" },
      { name: "Stealth Black", hex: "#0f172a" }
    ],
    specs: {
      frame: "High-Modulus Carbon Gravel Geometry",
      groupset: "Shimano GRX RX820 1x12 Speed",
      brakes: "Shimano GRX Hydraulic",
      wheelset: "DT Swiss G1800 Spline 25",
      weight: "8.4 kg",
      tires: "Maxxis Rambler 700x45c Tubeless Ready"
    },
    description: "Conquer remote gravel roads, singletracks, and all-weather adventures with 45mm tire clearance and ultra-durable carbon dampening."
  },
  {
    id: "bike-04",
    name: "Specialized Stumpjumper Pro Carbon",
    category: "cycles",
    subCategory: "Mountain Bikes (MTB)",
    brand: "Specialized",
    price: 495000,
    originalPrice: 530000,
    discount: "7% OFF",
    rating: 4.9,
    reviewsCount: 31,
    isFeatured: true,
    badge: "Trail King",
    image: "assets/images/ebike_mtb.jpg",
    colors: [
      { name: "Satin Carbon", hex: "#1c1917" },
      { name: "Acid Mint", hex: "#34d399" }
    ],
    specs: {
      frame: "FACT 11m Carbon Trail Chassis",
      groupset: "SRAM X01 Eagle AXS 12-Speed Wireless",
      brakes: "SRAM Code RSC 4-Piston Hydraulic",
      wheelset: "Roval Traverse Carbon 29",
      weight: "12.8 kg",
      tires: "Butcher GRID T9 Front / Purgatory T7 Rear"
    },
    description: "The definitive trail bike. Unmatched suspension kinematics, SWAT internal storage box, and geometry adjustability for steep technical descents."
  },

  // ===================== ELECTRIC CYCLES (E-BIKES) =====================
  {
    id: "ebike-01",
    name: "Velox Volt HyperDrive E-Road",
    category: "electric-cycles",
    subCategory: "Performance E-Road",
    brand: "Velox Apex",
    price: 360000,
    originalPrice: 395000,
    discount: "9% OFF",
    rating: 4.9,
    reviewsCount: 42,
    isFeatured: true,
    badge: "Smart Assist",
    image: "assets/images/hero_ebike.jpg",
    colors: [
      { name: "Cyber Lime", hex: "#10b981" },
      { name: "Stealth Onyx", hex: "#18181b" },
      { name: "Cosmic Silver", hex: "#94a3b8" }
    ],
    specs: {
      motorPower: "250W Bafang M820 Mid-Drive (75Nm)",
      battery: "720Wh LG High-Density Lithium-Ion",
      range: "140 km (Eco) / 85 km (Sport)",
      chargeTime: "3.5 Hours Fast Charge",
      speed: "32 km/h Assist Limit",
      frame: "Aero Monocoque Carbon Fiber",
      brakes: "Magura MT7 Hydraulic Disc 180mm",
      gears: "Shimano Ultegra Di2 12-Speed"
    },
    description: "The benchmark for lightweight electric road bikes. Super-smooth pedal assist sensor that amplifies your cadence without motor drag above speed limits."
  },
  {
    id: "ebike-02",
    name: "Velox Lithium Apex E-MTB Full-Suspension",
    category: "electric-cycles",
    subCategory: "Mountain E-Bikes",
    brand: "Velox Apex",
    price: 420000,
    originalPrice: 460000,
    discount: "9% OFF",
    rating: 5.0,
    reviewsCount: 29,
    isFeatured: true,
    badge: "All-Terrain Beast",
    image: "assets/images/ebike_mtb.jpg",
    colors: [
      { name: "Stealth Matte Lime", hex: "#22c55e" },
      { name: "Black Shadow", hex: "#0a0a0a" }
    ],
    specs: {
      motorPower: "85Nm Bosch Performance Line CX (4th Gen)",
      battery: "750Wh Bosch PowerTube Integrated",
      range: "120 km (Tour) / 70 km (eMTB Mode)",
      chargeTime: "4.0 Hours to 100%",
      speed: "32 km/h Max Assisted Speed",
      frame: "Carbon Main Triangle + Alloy Stays",
      brakes: "Shimano XT 4-Piston 203mm Rotors",
      gears: "SRAM GX Eagle 12-Speed"
    },
    description: "Tackle steep alpine inclines effortlessly. Equipped with Fox 38 Factory Kashima fork with 160mm travel and massive 85Nm torque output."
  },
  {
    id: "ebike-03",
    name: "Velox Aurora Urban Commuter E-Bike",
    category: "electric-cycles",
    subCategory: "Urban Commuter",
    brand: "Velox Apex",
    price: 185000,
    originalPrice: 205000,
    discount: "10% OFF",
    rating: 4.8,
    reviewsCount: 56,
    isFeatured: true,
    badge: "Smart City",
    image: "assets/images/ebike_urban.jpg",
    colors: [
      { name: "Brushed Titanium", hex: "#64748b" },
      { name: "Midnight Charcoal", hex: "#1e293b" }
    ],
    specs: {
      motorPower: "250W Rear Hub Silent Drive (45Nm)",
      battery: "480Wh Integrated Samsung Cells",
      range: "95 km per single charge",
      chargeTime: "2.8 Hours Rapid Charge",
      speed: "25 km/h Compliant Limit",
      frame: "Aircraft Grade 6061-T6 Aluminum",
      brakes: "Tektro Hydraulic Disc Brakes",
      gears: "Gates Carbon Drive CDX Belt System"
    },
    description: "Zero chain grease, zero maintenance. Gates Carbon belt drive combined with seamless frame-integrated LED matrix headlamp and automatic brake tail-light."
  },

  // ===================== GYM & FITNESS EQUIPMENT =====================
  {
    id: "gym-01",
    name: "AirRunner Pro Curved Commercial Treadmill",
    category: "gym",
    subCategory: "Commercial Treadmills",
    brand: "LifeFitness",
    price: 340000,
    originalPrice: 380000,
    discount: "11% OFF",
    rating: 5.0,
    reviewsCount: 22,
    isFeatured: true,
    badge: "Non-Motorized Curved",
    image: "assets/images/gym_treadmill.jpg",
    colors: [
      { name: "Matte Carbon Slate", hex: "#18181b" },
      { name: "Gunmetal Grey", hex: "#3f3f46" }
    ],
    specs: {
      type: "Self-Powered Motorless Curved Slat Belt",
      display: "High-Contrast LCD with Watts, Pace, HR, Interval Tracking",
      speed: "Unlimited (Runner Driven)",
      beltSurface: "170 cm x 44 cm Vulcanized Rubber Slats",
      maxUserWeight: "180 kg",
      warranty: "10-Year Frame / 5-Year Belt Commercial Warranty"
    },
    description: "Burns up to 30% more calories than standard motorized treadmills. Experience natural stride mechanics with zero electrical motor resistance."
  },
  {
    id: "gym-02",
    name: "Apex Studio Smart Indoor Cycle",
    category: "gym",
    subCategory: "Exercise Bikes",
    brand: "Velox Fitness",
    price: 165000,
    originalPrice: 190000,
    discount: "13% OFF",
    rating: 4.9,
    reviewsCount: 47,
    isFeatured: true,
    badge: "Interactive Studio",
    image: "assets/images/gym_spin_bike.jpg",
    colors: [
      { name: "Neon Lime Accent", hex: "#10b981" },
      { name: "Stealth Black", hex: "#18181b" }
    ],
    specs: {
      flywheel: "18 kg Precision Magnetic Resistance",
      display: "21.5-inch 1080p Rotating Smart Touchscreen",
      connectivity: "Bluetooth 5.0, ANT+, Wi-Fi & Zwift Integration",
      pedals: "Dual SPD-compatible & Toe-Cage",
      drive: "Poly-V Kevlar Ultra-Quiet Smooth Belt",
      maxUserWeight: "150 kg"
    },
    description: "Immersive live-streamed workouts, real-time power wattage metrics, automatic electromagnetic resistance synced with virtual climbing routes."
  },
  {
    id: "gym-03",
    name: "Monster Commercial Power Rack & Smith Machine",
    category: "gym",
    subCategory: "Multi-Gym & Racks",
    brand: "Rogue",
    price: 450000,
    originalPrice: 495000,
    discount: "9% OFF",
    rating: 5.0,
    reviewsCount: 16,
    isFeatured: true,
    badge: "Commercial Heavy-Duty",
    image: "assets/images/gym_rack.jpg",
    colors: [
      { name: "Tactical Matte Black", hex: "#0f172a" },
      { name: "Lime Accents", hex: "#22c55e" }
    ],
    specs: {
      steelGauge: "11-Gauge 3x3-inch Heavy-Wall Structural Steel",
      features: "Dual Cable Functional Trainer + Smith Counter-Balanced Bar",
      weightStack: "2x 100 kg Precision Machined Steel Stacks (1:1 & 2:1)",
      accessories: "Multi-grip Chin-up bar, J-Cups, Safety Spotter Arms, Landmine",
      footprint: "210 cm (W) x 180 cm (D) x 230 cm (H)",
      capacity: "Tested to 650 kg Static Load"
    },
    description: "The complete all-in-one strength training solution for elite commercial gyms and luxury home fitness suites. Over 80+ compound and isolation exercise capabilities."
  },
  {
    id: "gym-04",
    name: "Luxury Studio Gym Consultation & Setup",
    category: "gym",
    subCategory: "Home & Commercial Packages",
    brand: "Velox Turnkey",
    price: 750000,
    originalPrice: 850000,
    discount: "Package Deal",
    rating: 5.0,
    reviewsCount: 12,
    isFeatured: false,
    badge: "Turnkey Architecture",
    image: "assets/images/gym_showroom.jpg",
    colors: [
      { name: "Custom Interior", hex: "#334155" }
    ],
    specs: {
      includes: "Architectural 3D CAD Floor Layout + Full Cardio & Strength Suite",
      flooring: "High-density Acoustic Rubber Shock Absorber Tiles",
      consultation: "On-site Spatial Ergonomics & Electrical Planning",
      maintenance: "2-Year Quarterly Preventative Maintenance Included"
    },
    description: "Custom designed private fitness centers for villas, penthouses, and corporate wellness clubs. Engineered from spatial layout to equipment delivery and certified installation."
  },

  // ===================== CYCLING ACCESSORIES =====================
  {
    id: "acc-01",
    name: "Velox Aero Carbon Road Helmet with Mag-Visor",
    category: "accessories",
    subCategory: "Helmets & Safety",
    brand: "Velox Apex",
    price: 18500,
    originalPrice: 22000,
    discount: "16% OFF",
    rating: 4.9,
    reviewsCount: 65,
    isFeatured: true,
    badge: "Aero Certified",
    image: "assets/images/accessories_gear.jpg",
    colors: [
      { name: "Matte Carbon / Lime", hex: "#10b981" },
      { name: "Stealth Carbon", hex: "#18181b" }
    ],
    specs: {
      weight: "220 grams",
      safety: "MIPS Air Node Technology + In-Mold EPS",
      ventilation: "14 Computational Fluid Dynamic Wind Channels",
      visor: "Removable Carl Zeiss Magnetic Mirrored Shield"
    },
    description: "Uncompromised wind-tunnel tested aero efficiency combined with MIPS multi-directional impact protection and magnetic visor integration."
  },
  {
    id: "acc-02",
    name: "RideMaster Pro GPS Bike Computer 4.0",
    category: "accessories",
    subCategory: "Bike Computers",
    brand: "RideMaster",
    price: 32000,
    originalPrice: 36000,
    discount: "11% OFF",
    rating: 4.8,
    reviewsCount: 88,
    isFeatured: true,
    badge: "Turn-by-Turn GPS",
    image: "assets/images/accessories_gear.jpg",
    colors: [
      { name: "Neon Lime Accent", hex: "#10b981" },
      { name: "Graphite", hex: "#374151" }
    ],
    specs: {
      screen: "2.8-inch Sunlight-Readable Color Transflective Touchscreen",
      batteryLife: "36 Hours Active Navigation",
      sensors: "Dual-Frequency Multi-Band GNSS + Barometric Altimeter",
      connectivity: "ANT+, BLE, Wi-Fi, Strava Live Segments & Radar Ready"
    },
    description: "Pinpoint satellite accuracy even under dense canopy. Full offline topographic mapping, climb profile ascent previews, and live incident detection."
  },
  {
    id: "acc-03",
    name: "Velox Carbon High-Pressure Floor Track Pump",
    category: "accessories",
    subCategory: "Pumps & Maintenance",
    brand: "Velox Apex",
    price: 9500,
    originalPrice: 11000,
    discount: "14% OFF",
    rating: 4.9,
    reviewsCount: 41,
    isFeatured: false,
    badge: "260 PSI Rated",
    image: "assets/images/accessories_gear.jpg",
    colors: [
      { name: "Anodized Lime & Black", hex: "#10b981" }
    ],
    specs: {
      barrel: "CNC Machined 6061 Aluminum + Carbon Fiber Sleeve",
      gauge: "Precision Industrial 3.5-inch Top-Mounted Analog Gauge",
      head: "Threaded Dual-Head Presta & Schrader Air Bleed Valve",
      maxPressure: "260 PSI / 18 BAR"
    },
    description: "Effortless high-pressure tire inflation. Features long braided stainless steel reinforced hose and an ultra-wide weighted die-cast base."
  },
  {
    id: "acc-04",
    name: "Aero 3K Carbon Sole Pro Road Shoes",
    category: "accessories",
    subCategory: "Apparel & Shoes",
    brand: "Velox Apex",
    price: 24000,
    originalPrice: 28000,
    discount: "14% OFF",
    rating: 5.0,
    reviewsCount: 34,
    isFeatured: true,
    badge: "Index 14.0 Stiff",
    image: "assets/images/accessories_gear.jpg",
    colors: [
      { name: "Stealth Matte Black", hex: "#18181b" }
    ],
    specs: {
      outsole: "100% Uni-Directional Toray 3K Carbon Sole",
      closure: "Dual BOA Li2 Aluminum Micro-Dial Fit System",
      upper: "Perforated Microfiber with Aerodynamic Dimple Structure",
      weight: "215g per shoe (Size 42)"
    },
    description: "Maximum wattage transfer to pedals with zero flex. Dual BOA dials allow millimeter-level tightening on the fly."
  }
];

window.FEATURED_BRANDS = [
  { name: "Specialized", country: "USA", category: "Cycles & E-Bikes", tagline: "Innovate or Die" },
  { name: "Trek", country: "USA", category: "Cycles & E-Bikes", tagline: "Born in Wisconsin" },
  { name: "Velox Apex", country: "Global", category: "Pro Cycles & Studio", tagline: "Pure Speed Engineering" },
  { name: "Scott", country: "Switzerland", category: "Cycles & Gear", tagline: "No Shortcuts" },
  { name: "Giant", country: "Taiwan", category: "Cycles & E-Bikes", tagline: "Ride Unleashed" },
  { name: "LifeFitness", country: "USA", category: "Gym Equipment", tagline: "The World's Benchmark" },
  { name: "Rogue", country: "USA", category: "Strength & Racks", tagline: "Forged in Steel" },
  { name: "Shimano", country: "Japan", category: "Drivetrains", tagline: "Closer to Nature" }
];

window.TESTIMONIALS_DATA = [
  {
    name: "Vikram Malhotra",
    role: "Triathlete & Ironman Finisher, Bengaluru",
    rating: 5,
    bike: "Velox Apex S5 Carbon Aero",
    quote: "Dev Cycle gave me the most precise bike fitting session I've ever experienced in India. The Velox Apex S5 shaved 4 minutes off my 40km Olympic distance split. Top-tier mechanics and unmatched professionalism.",
    verified: true,
    date: "March 2026"
  },
  {
    name: "Dr. Ananya Sen",
    role: "Cardiologist & Daily Commuter, Mumbai",
    rating: 5,
    bike: "Velox Aurora Urban E-Bike",
    quote: "Switching to the Aurora Urban E-Bike transformed my 14km daily hospital commute. Silent belt drive, incredible battery range, and the Dev Cycle team delivered it completely assembled right to my doorstep.",
    verified: true,
    date: "February 2026"
  },
  {
    name: "Rohan Singhal",
    role: "Fitness Club Owner, Delhi NCR",
    rating: 5,
    bike: "Monster Commercial Power Rack & AirRunner Suite",
    quote: "We outfitted our new 5,000 sq ft fitness center through Dev Cycle's commercial consultation. From 3D space layouts to heavy-gauge rack installations, their team executed with Porsche-grade precision.",
    verified: true,
    date: "January 2026"
  }
];

window.FAQ_DATA = [
  {
    q: "Do you offer test rides prior to purchase?",
    a: "Yes! We offer 30-minute dedicated test rides for all premium performance road bikes and electric bicycles at our Bengaluru flagship showroom outdoor track. You can book an appointment directly using our online booking tool."
  },
  {
    q: "How does nationwide doorstep delivery and assembly work?",
    a: "Every bicycle is 98% pre-assembled and tuned by certified mechanics in our workshop, packed in heavy-duty custom travel boxes, and delivered with white-glove courier support. In major metro cities, our mobile technician arrives to set up the handlebar, pedals, and perform a personalized saddle fit."
  },
  {
    q: "What is your warranty policy on frames and electric battery units?",
    a: "All carbon and alloy frames carry a manufacturer lifetime warranty against structural manufacturing defects. Electric bike lithium battery packs and drive motors carry an extensive 2-year / 25,000 km replacement warranty."
  },
  {
    q: "Can you design and install custom home or commercial gyms?",
    a: "Absolutely. Our Turnkey Gym division provides end-to-end 3D CAD layout planning, acoustic rubber flooring installation, and heavy equipment calibration for both private residential gyms and commercial health clubs."
  }
];
