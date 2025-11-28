import { AssetCategory, Frequency, Difficulty } from '@prisma/client'

/**
 * Template Pack seed data for the Expanded Template Library feature.
 * Each pack contains a group of related maintenance templates.
 *
 * Based on the schema:
 * - TemplatePack: Groups templates by theme/purpose
 * - MaintenanceTemplate: Individual maintenance tasks with pack relation
 */

interface TemplateData {
  name: string
  description: string
  category: AssetCategory
  defaultFrequency: Frequency
  estimatedDurationMinutes: number
  difficulty: Difficulty
  instructions: string // JSON string
  requiredTools: string // JSON string
  safetyPrecautions: string // JSON string
  tags: string[]
  season?: string
  isSystemTemplate: boolean
  isActive: boolean
}

interface PackData {
  id: string // Fixed ID for idempotent upserts
  name: string
  description: string
  category?: AssetCategory
  tags: string[]
  applicableClimateZones: string[]
  minHomeAge?: number
  maxHomeAge?: number
  isSystemPack: boolean
  isActive: boolean
  templates: TemplateData[]
}

export const SYSTEM_PACKS: PackData[] = [
  // ===========================================
  // Pack 1: Seasonal Essentials
  // ===========================================
  {
    id: 'pack-seasonal-essentials',
    name: 'Seasonal Essentials',
    description:
      'Keep your home in top shape year-round with these essential seasonal maintenance tasks. Perfect for any climate.',
    tags: ['Seasonal', 'General', 'Preventive'],
    applicableClimateZones: ['Humid', 'Cold', 'Temperate', 'Arid'], // All climates
    isSystemPack: true,
    isActive: true,
    templates: [
      {
        name: 'Gutter Cleaning',
        description:
          'Remove leaves and debris from gutters and downspouts to prevent water damage. Essential spring and fall maintenance.',
        category: AssetCategory.OUTDOOR,
        defaultFrequency: Frequency.SEMIANNUAL,
        estimatedDurationMinutes: 120,
        difficulty: Difficulty.MODERATE,
        instructions: JSON.stringify([
          'Set up ladder safely on level ground',
          'Wear gloves and use gutter scoop or trowel',
          'Remove debris working toward downspout',
          'Check for proper gutter slope (1/4" per 10 feet)',
          'Flush gutters with hose',
          'Check downspouts for clogs',
          'Check for leaks or damage',
        ]),
        requiredTools: JSON.stringify([
          'Extension ladder',
          'Gutter scoop',
          'Garden hose',
          'Work gloves',
          'Safety glasses',
        ]),
        safetyPrecautions: JSON.stringify([
          'Never work alone',
          'Use ladder stabilizer',
          'Avoid power lines',
          "Don't work in wet conditions",
        ]),
        tags: ['Seasonal', 'Water Protection', 'Spring', 'Fall'],
        season: 'Spring',
        isSystemTemplate: true,
        isActive: true,
      },
      {
        name: 'Outdoor Faucet Winterization',
        description:
          'Prepare outdoor water faucets for freezing temperatures to prevent burst pipes.',
        category: AssetCategory.OUTDOOR,
        defaultFrequency: Frequency.ANNUAL,
        estimatedDurationMinutes: 30,
        difficulty: Difficulty.EASY,
        instructions: JSON.stringify([
          'Locate indoor shutoff valves for outdoor faucets',
          'Turn off water supply to outdoor faucets',
          'Go outside and open faucets to drain water',
          'Leave outdoor faucets slightly open',
          'Remove and store garden hoses indoors',
          'Install insulated faucet covers',
        ]),
        requiredTools: JSON.stringify([
          'Insulated faucet covers',
          'Adjustable wrench',
          'Towels',
        ]),
        safetyPrecautions: JSON.stringify([
          'Complete before first freeze',
          'Know location of main water shutoff',
          'Check for drips after closing valves',
        ]),
        tags: ['Seasonal', 'Winter Prep', 'Plumbing', 'Fall'],
        season: 'Fall',
        isSystemTemplate: true,
        isActive: true,
      },
      {
        name: 'AC Coil Cleaning',
        description:
          'Clean outdoor AC condenser coils for optimal cooling efficiency before summer.',
        category: AssetCategory.HVAC,
        defaultFrequency: Frequency.ANNUAL,
        estimatedDurationMinutes: 45,
        difficulty: Difficulty.MODERATE,
        instructions: JSON.stringify([
          'Turn off power to the unit at the breaker',
          'Remove debris from around the unit (2ft clearance)',
          'Remove top grille or fan assembly',
          'Spray coils with coil cleaner solution',
          'Let solution sit for 5-10 minutes',
          'Rinse thoroughly with garden hose (not high pressure)',
          'Straighten bent fins with fin comb',
          'Reassemble and restore power',
        ]),
        requiredTools: JSON.stringify([
          'Garden hose',
          'Coil cleaner spray',
          'Fin comb',
          'Screwdriver',
          'Work gloves',
        ]),
        safetyPrecautions: JSON.stringify([
          'Always turn off power at breaker first',
          'Never use high pressure water',
          'Allow unit to dry before restoring power',
        ]),
        tags: ['Seasonal', 'HVAC', 'Efficiency', 'Spring'],
        season: 'Spring',
        isSystemTemplate: true,
        isActive: true,
      },
      {
        name: 'Furnace Filter Change',
        description:
          'Replace furnace filter before heating season for optimal air quality and efficiency.',
        category: AssetCategory.HVAC,
        defaultFrequency: Frequency.QUARTERLY,
        estimatedDurationMinutes: 10,
        difficulty: Difficulty.EASY,
        instructions: JSON.stringify([
          'Turn off HVAC system',
          'Locate filter compartment',
          'Remove old filter, note size and airflow direction',
          'Insert new filter with arrows pointing toward unit',
          'Close compartment securely',
          'Turn system back on',
          'Write date on new filter',
        ]),
        requiredTools: JSON.stringify([
          'New filter (correct size)',
          'Marker pen',
        ]),
        safetyPrecautions: JSON.stringify([
          'Turn off system before changing',
          'Wear mask if sensitive to dust',
        ]),
        tags: ['Seasonal', 'HVAC', 'Air Quality', 'Fall'],
        season: 'Fall',
        isSystemTemplate: true,
        isActive: true,
      },
    ],
  },

  // ===========================================
  // Pack 2: Safety First
  // ===========================================
  {
    id: 'pack-safety-first',
    name: 'Safety First',
    description:
      'Critical safety checks every homeowner should perform regularly. Protect your family with these essential tests.',
    tags: ['Safety', 'Critical', 'Family Protection'],
    applicableClimateZones: ['Humid', 'Cold', 'Temperate', 'Arid'], // All climates
    isSystemPack: true,
    isActive: true,
    templates: [
      {
        name: 'Smoke Detector Test',
        description:
          'Monthly test of all smoke detectors to ensure they are functioning properly.',
        category: AssetCategory.ELECTRICAL,
        defaultFrequency: Frequency.MONTHLY,
        estimatedDurationMinutes: 10,
        difficulty: Difficulty.EASY,
        instructions: JSON.stringify([
          'Alert household members before testing',
          'Press and hold test button on each detector',
          'Verify alarm sounds loudly and clearly',
          'Check that interconnected alarms all sound',
          'Vacuum dust from detector vents',
          'Note any weak-sounding alarms for battery change',
        ]),
        requiredTools: JSON.stringify([
          'Step ladder',
          'Vacuum with brush attachment',
        ]),
        safetyPrecautions: JSON.stringify([
          'Warn family members before testing',
          'Use stable step ladder',
          'Replace detectors older than 10 years',
        ]),
        tags: ['Safety', 'Fire Prevention', 'Monthly'],
        isSystemTemplate: true,
        isActive: true,
      },
      {
        name: 'Smoke Detector Battery Change',
        description:
          'Annual battery replacement in all smoke detectors, even those with 10-year batteries.',
        category: AssetCategory.ELECTRICAL,
        defaultFrequency: Frequency.ANNUAL,
        estimatedDurationMinutes: 20,
        difficulty: Difficulty.EASY,
        instructions: JSON.stringify([
          'Remove detector from mounting bracket',
          'Open battery compartment',
          'Remove old battery and dispose properly',
          'Insert fresh 9V battery (check expiration)',
          'Close compartment and remount detector',
          'Press test button to verify operation',
          'Record date of battery change',
        ]),
        requiredTools: JSON.stringify([
          '9V batteries (quality brand)',
          'Step ladder',
          'Marker for date',
        ]),
        safetyPrecautions: JSON.stringify([
          'Use only recommended battery type',
          'Replace detector if damaged',
          'Change batteries in spring or fall (daylight saving)',
        ]),
        tags: ['Safety', 'Fire Prevention', 'Annual'],
        isSystemTemplate: true,
        isActive: true,
      },
      {
        name: 'Fire Extinguisher Inspection',
        description:
          'Annual inspection of fire extinguisher pressure, accessibility, and condition.',
        category: AssetCategory.ELECTRICAL,
        defaultFrequency: Frequency.ANNUAL,
        estimatedDurationMinutes: 10,
        difficulty: Difficulty.EASY,
        instructions: JSON.stringify([
          'Check pressure gauge - needle should be in green zone',
          'Verify safety pin and tamper seal are intact',
          'Inspect for visible damage, rust, or dents',
          'Ensure mounting bracket is secure',
          'Confirm easy access (not blocked)',
          'Review operating instructions',
          'Check expiration and service date',
        ]),
        requiredTools: JSON.stringify(['None required']),
        safetyPrecautions: JSON.stringify([
          'Replace if pressure is low',
          'Professional service every 6 years',
          'Replace unit every 12 years',
        ]),
        tags: ['Safety', 'Fire Prevention', 'Annual'],
        isSystemTemplate: true,
        isActive: true,
      },
      {
        name: 'Dryer Vent Deep Cleaning',
        description:
          'Thorough cleaning of dryer vent system to prevent house fires. Leading cause of home fires.',
        category: AssetCategory.APPLIANCE,
        defaultFrequency: Frequency.ANNUAL,
        estimatedDurationMinutes: 45,
        difficulty: Difficulty.MODERATE,
        instructions: JSON.stringify([
          'Unplug dryer from electrical outlet',
          'Pull dryer away from wall',
          'Disconnect flexible vent hose',
          'Use dryer vent brush kit to clean entire duct',
          'Go outside and clean exterior vent hood',
          'Vacuum lint from behind and under dryer',
          'Reconnect vent hose with proper clamps',
          'Push dryer back and plug in',
          'Run empty cycle to verify airflow',
        ]),
        requiredTools: JSON.stringify([
          'Dryer vent brush kit (rotating)',
          'Vacuum with hose attachment',
          'Screwdriver',
          'Vent clamps',
        ]),
        safetyPrecautions: JSON.stringify([
          'Always unplug dryer first',
          'If gas dryer, check for gas leaks',
          'Ensure vent reconnects securely',
        ]),
        tags: ['Safety', 'Fire Prevention', 'Annual'],
        isSystemTemplate: true,
        isActive: true,
      },
      {
        name: 'Carbon Monoxide Detector Test',
        description:
          'Test CO detectors to protect against invisible, odorless carbon monoxide gas.',
        category: AssetCategory.ELECTRICAL,
        defaultFrequency: Frequency.MONTHLY,
        estimatedDurationMinutes: 5,
        difficulty: Difficulty.EASY,
        instructions: JSON.stringify([
          'Press and hold test button',
          'Listen for alarm sequence',
          'Check display (if digital) for proper operation',
          'Verify detector location is appropriate',
          'Replace batteries if alarm is weak',
        ]),
        requiredTools: JSON.stringify(['None required']),
        safetyPrecautions: JSON.stringify([
          'Install on every level of home',
          'Replace detector every 5-7 years',
          'If alarm sounds for real, evacuate immediately',
        ]),
        tags: ['Safety', 'CO Protection', 'Monthly'],
        isSystemTemplate: true,
        isActive: true,
      },
    ],
  },

  // ===========================================
  // Pack 3: Appliance Care
  // ===========================================
  {
    id: 'pack-appliance-care',
    name: 'Appliance Care',
    description:
      'Extend the life of your major appliances and improve efficiency with these essential maintenance tasks.',
    category: AssetCategory.APPLIANCE,
    tags: ['Appliance', 'Efficiency', 'Cost Savings'],
    applicableClimateZones: ['Humid', 'Cold', 'Temperate', 'Arid'], // All climates
    isSystemPack: true,
    isActive: true,
    templates: [
      {
        name: 'Refrigerator Coil Cleaning',
        description:
          'Clean condenser coils to improve cooling efficiency and reduce energy costs.',
        category: AssetCategory.APPLIANCE,
        defaultFrequency: Frequency.ANNUAL,
        estimatedDurationMinutes: 30,
        difficulty: Difficulty.MODERATE,
        instructions: JSON.stringify([
          'Unplug refrigerator',
          'Locate coils (back or underneath)',
          'Remove base grille if coils are underneath',
          'Use coil brush to gently remove dust',
          'Vacuum loose debris',
          'Clean fan blades if accessible',
          'Replace grille and plug back in',
        ]),
        requiredTools: JSON.stringify([
          'Coil cleaning brush',
          'Vacuum with hose attachment',
          'Flashlight',
          'Screwdriver',
        ]),
        safetyPrecautions: JSON.stringify([
          'Always unplug before cleaning',
          'Be gentle with delicate coil fins',
          'Have help moving heavy refrigerators',
        ]),
        tags: ['Appliance', 'Efficiency', 'Annual'],
        isSystemTemplate: true,
        isActive: true,
      },
      {
        name: 'Dishwasher Filter Cleaning',
        description:
          'Clean dishwasher filter and spray arms for better cleaning performance.',
        category: AssetCategory.APPLIANCE,
        defaultFrequency: Frequency.MONTHLY,
        estimatedDurationMinutes: 15,
        difficulty: Difficulty.EASY,
        instructions: JSON.stringify([
          'Remove bottom rack',
          'Locate and remove filter (usually twist-off)',
          'Rinse filter under hot water',
          'Scrub with soft brush to remove debris',
          'Check spray arm holes for clogs',
          'Clean spray arm holes with toothpick',
          'Wipe door edges and gasket',
          'Reinstall filter and rack',
        ]),
        requiredTools: JSON.stringify([
          'Soft brush',
          'Toothpick',
          'Clean cloth',
        ]),
        safetyPrecautions: JSON.stringify([
          'Run garbage disposal first to clear drain line',
          'Check for broken glass before reaching in',
        ]),
        tags: ['Appliance', 'Monthly', 'Cleaning'],
        isSystemTemplate: true,
        isActive: true,
      },
      {
        name: 'Washing Machine Descaling',
        description:
          'Remove mineral buildup and mold from washing machine for fresh, clean laundry.',
        category: AssetCategory.APPLIANCE,
        defaultFrequency: Frequency.QUARTERLY,
        estimatedDurationMinutes: 90,
        difficulty: Difficulty.EASY,
        instructions: JSON.stringify([
          'Run empty hot water cycle with 2 cups white vinegar',
          'Pause mid-cycle and let sit for 1 hour',
          'Complete cycle',
          'Run second empty cycle with 1/2 cup baking soda',
          'Wipe drum, door seal, and detergent dispenser',
          'Leave door open to air dry',
          'Clean exterior and control panel',
        ]),
        requiredTools: JSON.stringify([
          'White vinegar (2 cups)',
          'Baking soda (1/2 cup)',
          'Clean cloths',
          'Old toothbrush for crevices',
        ]),
        safetyPrecautions: JSON.stringify([
          'Never mix vinegar and bleach',
          'Keep door open after cleaning to prevent mold',
        ]),
        tags: ['Appliance', 'Quarterly', 'Cleaning'],
        isSystemTemplate: true,
        isActive: true,
      },
      {
        name: 'Oven Deep Clean',
        description:
          'Thorough cleaning of oven interior for safe cooking and better heat distribution.',
        category: AssetCategory.APPLIANCE,
        defaultFrequency: Frequency.QUARTERLY,
        estimatedDurationMinutes: 60,
        difficulty: Difficulty.EASY,
        instructions: JSON.stringify([
          'Remove racks and soak in hot soapy water',
          'If using self-clean: remove everything, run cycle',
          'If manual: apply oven cleaner, wait per instructions',
          'Wipe down interior walls and floor',
          'Clean oven door glass (inside and out)',
          'Scrub and dry racks',
          'Replace racks and test heat',
        ]),
        requiredTools: JSON.stringify([
          'Oven cleaner (or baking soda paste)',
          'Scrub brush',
          'Clean cloths',
          'Rubber gloves',
        ]),
        safetyPrecautions: JSON.stringify([
          'Ensure good ventilation when using cleaners',
          'Remove pets during self-clean cycle',
          'Let oven cool completely before cleaning',
        ]),
        tags: ['Appliance', 'Quarterly', 'Cleaning'],
        isSystemTemplate: true,
        isActive: true,
      },
      {
        name: 'Range Hood Filter Cleaning',
        description:
          'Clean grease filters for proper kitchen ventilation and fire prevention.',
        category: AssetCategory.APPLIANCE,
        defaultFrequency: Frequency.MONTHLY,
        estimatedDurationMinutes: 20,
        difficulty: Difficulty.EASY,
        instructions: JSON.stringify([
          'Turn off range hood',
          'Remove metal filter(s)',
          'Fill sink with hot water and degreasing dish soap',
          'Soak filters for 10-15 minutes',
          'Scrub gently with soft brush',
          'Rinse thoroughly and let dry',
          'Wipe hood interior and exterior',
          'Reinstall dry filters',
        ]),
        requiredTools: JSON.stringify([
          'Degreasing dish soap',
          'Soft brush',
          'Clean cloths',
        ]),
        safetyPrecautions: JSON.stringify([
          'Let filters cool if recently used',
          'Replace charcoal filters (cannot be cleaned)',
        ]),
        tags: ['Appliance', 'Monthly', 'Cleaning'],
        isSystemTemplate: true,
        isActive: true,
      },
    ],
  },

  // ===========================================
  // Pack 4: Older Home Care (20+ years)
  // ===========================================
  {
    id: 'pack-older-home-care',
    name: 'Older Home Care',
    description:
      'Specialized maintenance for homes 20+ years old. Address aging systems before they become problems.',
    tags: ['Older Home', 'Preventive', 'Age-Based'],
    applicableClimateZones: ['Humid', 'Cold', 'Temperate', 'Arid'],
    minHomeAge: 20,
    isSystemPack: true,
    isActive: true,
    templates: [
      {
        name: 'Electrical Panel Inspection',
        description:
          'Professional inspection of electrical panel for outdated wiring and safety hazards.',
        category: AssetCategory.ELECTRICAL,
        defaultFrequency: Frequency.ANNUAL,
        estimatedDurationMinutes: 60,
        difficulty: Difficulty.PROFESSIONAL,
        instructions: JSON.stringify([
          'Schedule licensed electrician',
          'Clear area around electrical panel',
          'Have home history/documentation ready',
          'Ask about Federal Pacific or Zinsco panels (fire hazards)',
          'Request written report of findings',
          'Get quotes for any recommended upgrades',
        ]),
        requiredTools: JSON.stringify([
          'Phone to schedule service',
          'Home documentation',
        ]),
        safetyPrecautions: JSON.stringify([
          'Never open panel yourself',
          'Use only licensed electricians',
          'Replace outdated panels immediately',
        ]),
        tags: ['Electrical', 'Safety', 'Professional', 'Older Home'],
        isSystemTemplate: true,
        isActive: true,
      },
      {
        name: 'Plumbing System Assessment',
        description:
          'Check for galvanized or polybutylene pipes that may need replacement.',
        category: AssetCategory.PLUMBING,
        defaultFrequency: Frequency.ANNUAL,
        estimatedDurationMinutes: 45,
        difficulty: Difficulty.MODERATE,
        instructions: JSON.stringify([
          'Check visible pipes in basement/crawlspace',
          'Look for galvanized steel (gray, threaded) - prone to corrosion',
          'Look for polybutylene (gray plastic) - prone to failure',
          'Check water pressure at multiple fixtures',
          'Look for signs of leaks or water damage',
          'Note any discolored water when first turned on',
          'Consider camera inspection of drain lines',
        ]),
        requiredTools: JSON.stringify([
          'Flashlight',
          'Magnet (to identify pipe material)',
          'Notepad and camera',
        ]),
        safetyPrecautions: JSON.stringify([
          'Watch for asbestos insulation on old pipes',
          'Consult plumber for major concerns',
        ]),
        tags: ['Plumbing', 'Inspection', 'Older Home'],
        isSystemTemplate: true,
        isActive: true,
      },
      {
        name: 'Foundation Inspection',
        description:
          'Check foundation for cracks, settling, and moisture issues.',
        category: AssetCategory.STRUCTURAL,
        defaultFrequency: Frequency.ANNUAL,
        estimatedDurationMinutes: 30,
        difficulty: Difficulty.MODERATE,
        instructions: JSON.stringify([
          'Walk perimeter of home exterior',
          'Look for cracks in foundation (horizontal cracks are more serious)',
          'Check for separation between foundation and siding',
          'Inspect basement/crawlspace walls',
          'Look for water stains or efflorescence (white powder)',
          'Check floors for sloping or bouncing',
          'Document any cracks with photos and measurements',
        ]),
        requiredTools: JSON.stringify([
          'Flashlight',
          'Tape measure',
          'Camera',
          'Crack monitor (optional)',
        ]),
        safetyPrecautions: JSON.stringify([
          'Consult structural engineer for large cracks',
          'Address water drainage issues promptly',
        ]),
        tags: ['Structural', 'Inspection', 'Older Home'],
        isSystemTemplate: true,
        isActive: true,
      },
    ],
  },

  // ===========================================
  // Pack 5: Cold Climate Essentials
  // ===========================================
  {
    id: 'pack-cold-climate',
    name: 'Cold Climate Essentials',
    description:
      'Essential maintenance for homes in cold climates. Prepare for harsh winters and protect against freeze damage.',
    tags: ['Climate-Specific', 'Winter', 'Cold Weather'],
    applicableClimateZones: ['Cold'],
    isSystemPack: true,
    isActive: true,
    templates: [
      {
        name: 'Heating System Pre-Season Check',
        description:
          'Prepare your heating system before winter for reliable, efficient operation.',
        category: AssetCategory.HVAC,
        defaultFrequency: Frequency.ANNUAL,
        estimatedDurationMinutes: 30,
        difficulty: Difficulty.MODERATE,
        instructions: JSON.stringify([
          'Replace furnace filter',
          'Test thermostat operation',
          'Listen for unusual noises on startup',
          'Check all vents are open and unblocked',
          'Verify pilot light or ignition (if applicable)',
          'Clean area around furnace',
          'Check carbon monoxide detector batteries',
          'Schedule professional tune-up if not done recently',
        ]),
        requiredTools: JSON.stringify([
          'New furnace filter',
          'Vacuum',
          'Flashlight',
        ]),
        safetyPrecautions: JSON.stringify([
          'If you smell gas, leave immediately and call utility',
          'Keep flammables away from furnace',
          'Professional service recommended annually',
        ]),
        tags: ['HVAC', 'Winter Prep', 'Cold Climate'],
        season: 'Fall',
        isSystemTemplate: true,
        isActive: true,
      },
      {
        name: 'Ice Dam Prevention',
        description:
          'Prevent ice dams by ensuring proper attic insulation and ventilation.',
        category: AssetCategory.STRUCTURAL,
        defaultFrequency: Frequency.ANNUAL,
        estimatedDurationMinutes: 45,
        difficulty: Difficulty.MODERATE,
        instructions: JSON.stringify([
          'Check attic insulation depth (12-14 inches recommended)',
          'Seal air leaks around light fixtures and plumbing stacks',
          'Verify soffit vents are not blocked by insulation',
          'Ensure ridge vents or attic fans are functioning',
          'Add insulation if needed',
          'Install roof heating cables on problem areas (optional)',
        ]),
        requiredTools: JSON.stringify([
          'Flashlight',
          'Tape measure',
          'Caulk gun and foam sealant',
          'Dust mask',
        ]),
        safetyPrecautions: JSON.stringify([
          'Wear mask and long sleeves in attic',
          'Use boards across joists for footing',
          'Work with buddy when in attic',
        ]),
        tags: ['Structural', 'Winter Prep', 'Cold Climate'],
        season: 'Fall',
        isSystemTemplate: true,
        isActive: true,
      },
      {
        name: 'Pipe Freeze Prevention',
        description:
          'Protect vulnerable pipes from freezing and bursting in cold weather.',
        category: AssetCategory.PLUMBING,
        defaultFrequency: Frequency.ANNUAL,
        estimatedDurationMinutes: 60,
        difficulty: Difficulty.EASY,
        instructions: JSON.stringify([
          'Identify pipes in unheated areas (basement, crawlspace, garage)',
          'Install foam pipe insulation on vulnerable pipes',
          'Use heat tape on extremely vulnerable sections',
          'Seal gaps where cold air enters',
          'Know location of main water shutoff',
          'During extreme cold: open cabinet doors, drip faucets',
        ]),
        requiredTools: JSON.stringify([
          'Foam pipe insulation',
          'Heat tape (for extreme cases)',
          'Utility knife',
          'Duct tape',
        ]),
        safetyPrecautions: JSON.stringify([
          'Follow heat tape instructions carefully',
          'If pipes freeze, never use open flame to thaw',
        ]),
        tags: ['Plumbing', 'Winter Prep', 'Cold Climate'],
        season: 'Fall',
        isSystemTemplate: true,
        isActive: true,
      },
    ],
  },

  // ===========================================
  // Pack 6: Humid Climate Care
  // ===========================================
  {
    id: 'pack-humid-climate',
    name: 'Humid Climate Care',
    description:
      'Combat moisture, mold, and humidity issues specific to humid climates.',
    tags: ['Climate-Specific', 'Moisture Control', 'Humidity'],
    applicableClimateZones: ['Humid'],
    isSystemPack: true,
    isActive: true,
    templates: [
      {
        name: 'Dehumidifier Maintenance',
        description:
          'Maintain dehumidifier for effective moisture control and air quality.',
        category: AssetCategory.HVAC,
        defaultFrequency: Frequency.MONTHLY,
        estimatedDurationMinutes: 15,
        difficulty: Difficulty.EASY,
        instructions: JSON.stringify([
          'Empty and clean water collection bucket',
          'Wash bucket with mild soap to prevent mold',
          'Remove and clean filter (vacuum or rinse)',
          'Check and clean coils if accessible',
          'Verify drainage hose is clear (if using)',
          'Check humidity settings (40-50% ideal)',
        ]),
        requiredTools: JSON.stringify([
          'Vacuum or water for filter',
          'Mild soap',
          'Clean cloth',
        ]),
        safetyPrecautions: JSON.stringify([
          'Unplug before cleaning',
          'Let coils dry before restarting',
        ]),
        tags: ['HVAC', 'Moisture Control', 'Humid Climate'],
        isSystemTemplate: true,
        isActive: true,
      },
      {
        name: 'Mold Inspection',
        description: 'Check common mold-prone areas to catch problems early.',
        category: AssetCategory.STRUCTURAL,
        defaultFrequency: Frequency.QUARTERLY,
        estimatedDurationMinutes: 30,
        difficulty: Difficulty.EASY,
        instructions: JSON.stringify([
          'Check bathroom ceilings and corners',
          'Inspect under sinks for leaks and mold',
          'Check basement/crawlspace walls',
          'Inspect window sills for condensation damage',
          'Look behind furniture against exterior walls',
          'Check HVAC closet and air handler',
          'Smell for musty odors',
        ]),
        requiredTools: JSON.stringify([
          'Flashlight',
          'Camera for documentation',
          'Moisture meter (optional)',
        ]),
        safetyPrecautions: JSON.stringify([
          'Wear N95 mask if mold is visible',
          'Do not disturb large mold areas - call professional',
        ]),
        tags: ['Structural', 'Mold Prevention', 'Humid Climate'],
        isSystemTemplate: true,
        isActive: true,
      },
      {
        name: 'Exterior Caulk Inspection',
        description:
          'Check and repair exterior caulking to prevent moisture intrusion.',
        category: AssetCategory.OUTDOOR,
        defaultFrequency: Frequency.ANNUAL,
        estimatedDurationMinutes: 60,
        difficulty: Difficulty.EASY,
        instructions: JSON.stringify([
          'Inspect caulk around windows and doors',
          'Check where siding meets trim',
          'Examine penetrations (pipes, wires, vents)',
          'Look for cracked, missing, or peeling caulk',
          'Remove old caulk with scraper or tool',
          'Apply new exterior-grade silicone caulk',
          'Smooth with wet finger or tool',
        ]),
        requiredTools: JSON.stringify([
          'Caulk gun',
          'Exterior silicone caulk',
          'Caulk removal tool',
          'Clean rags',
        ]),
        safetyPrecautions: JSON.stringify([
          'Use ladder safely',
          'Apply in dry weather above 40°F',
        ]),
        tags: ['Outdoor', 'Moisture Protection', 'Humid Climate'],
        isSystemTemplate: true,
        isActive: true,
      },
    ],
  },
]
