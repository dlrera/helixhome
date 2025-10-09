import { PrismaClient, AssetCategory, Frequency, Difficulty } from '@prisma/client'

const prisma = new PrismaClient()

export const maintenanceTemplates = [
  // HVAC Category
  {
    name: 'Change HVAC Filter',
    description: 'Replace or clean HVAC system air filters to maintain air quality and system efficiency',
    category: AssetCategory.HVAC,
    defaultFrequency: Frequency.MONTHLY,
    estimatedDurationMinutes: 10,
    difficulty: Difficulty.EASY,
    instructions: JSON.stringify([
      'Turn off the HVAC system',
      'Locate the filter access panel',
      'Remove the old filter, noting the airflow direction',
      'Insert the new filter with arrows pointing toward the unit',
      'Close the access panel',
      'Turn the system back on',
      'Record the filter size for future reference'
    ]),
    requiredTools: JSON.stringify(['New filter', 'Vacuum (optional)', 'Marker to date filter']),
    safetyPrecautions: JSON.stringify(['Turn off system before changing filter', 'Wear dust mask if sensitive to dust']),
    isSystemTemplate: true,
    isActive: true
  },
  {
    name: 'Service HVAC System',
    description: 'Annual professional inspection and maintenance of heating and cooling system',
    category: AssetCategory.HVAC,
    defaultFrequency: Frequency.ANNUAL,
    estimatedDurationMinutes: 60,
    difficulty: Difficulty.PROFESSIONAL,
    instructions: JSON.stringify([
      'Schedule appointment with licensed HVAC technician',
      'Clear area around indoor and outdoor units',
      'Ensure easy access to all components',
      'Have system documentation ready',
      'Be present during inspection to ask questions',
      'Request service report and recommendations'
    ]),
    requiredTools: JSON.stringify(['Phone to schedule service', 'System documentation']),
    safetyPrecautions: JSON.stringify(['Use only licensed professionals', 'Never attempt complex repairs yourself']),
    isSystemTemplate: true,
    isActive: true
  },
  {
    name: 'Clean AC Condenser Coils',
    description: 'Clean outdoor AC unit coils to maintain cooling efficiency',
    category: AssetCategory.HVAC,
    defaultFrequency: Frequency.ANNUAL,
    estimatedDurationMinutes: 30,
    difficulty: Difficulty.MODERATE,
    instructions: JSON.stringify([
      'Turn off power to the unit at the breaker',
      'Remove debris from around the unit',
      'Remove the top grille or fan assembly if necessary',
      'Spray coils with coil cleaner or mild detergent solution',
      'Rinse thoroughly with garden hose (not high pressure)',
      'Straighten any bent fins with fin comb',
      'Reassemble unit and restore power'
    ]),
    requiredTools: JSON.stringify(['Garden hose', 'Coil cleaner', 'Fin comb', 'Screwdriver', 'Gloves']),
    safetyPrecautions: JSON.stringify(['Always turn off power at breaker', 'Never use high pressure water', 'Wear protective gloves']),
    isSystemTemplate: true,
    isActive: true
  },

  // Plumbing Category
  {
    name: 'Flush Water Heater',
    description: 'Drain sediment from water heater tank to maintain efficiency and extend life',
    category: AssetCategory.PLUMBING,
    defaultFrequency: Frequency.ANNUAL,
    estimatedDurationMinutes: 45,
    difficulty: Difficulty.MODERATE,
    instructions: JSON.stringify([
      'Turn off power (electric) or gas supply',
      'Turn off cold water supply valve',
      'Attach garden hose to drain valve',
      'Open hot water tap nearby to allow air in',
      'Open drain valve and let tank empty',
      'Turn on cold water briefly to flush sediment',
      'Close drain valve, remove hose, refill tank',
      'Restore power/gas only after tank is full'
    ]),
    requiredTools: JSON.stringify(['Garden hose', 'Bucket', 'Gloves', 'Safety glasses']),
    safetyPrecautions: JSON.stringify(['Water will be very hot', 'Turn off power/gas first', 'Never drain completely if very old']),
    isSystemTemplate: true,
    isActive: true
  },
  {
    name: 'Check Washing Machine Hoses',
    description: 'Inspect washing machine water supply hoses for wear, bulges, or leaks',
    category: AssetCategory.PLUMBING,
    defaultFrequency: Frequency.ANNUAL,
    estimatedDurationMinutes: 15,
    difficulty: Difficulty.EASY,
    instructions: JSON.stringify([
      'Pull washer away from wall for access',
      'Inspect both hot and cold supply hoses',
      'Look for cracks, bulges, or wear at connections',
      'Check for moisture or mineral deposits (indicates slow leak)',
      'Feel along entire length for soft spots',
      'Tighten connections if loose',
      'Replace hoses if over 5 years old or showing wear'
    ]),
    requiredTools: JSON.stringify(['Flashlight', 'Pliers (if tightening needed)', 'Towel']),
    safetyPrecautions: JSON.stringify(['Turn off water supply before removing hoses', 'Have towels ready for drips']),
    isSystemTemplate: true,
    isActive: true
  },
  {
    name: 'Run Water in Unused Drains',
    description: 'Run water in rarely-used drains to maintain trap seals and prevent sewer gas',
    category: AssetCategory.PLUMBING,
    defaultFrequency: Frequency.MONTHLY,
    estimatedDurationMinutes: 5,
    difficulty: Difficulty.EASY,
    instructions: JSON.stringify([
      'Identify all rarely-used drains (guest bath, floor drains, etc.)',
      'Run water for 30 seconds in each sink',
      'Flush unused toilets',
      'Pour a gallon of water in floor drains',
      'Run rarely-used showers for a minute',
      'Add a tablespoon of mineral oil to slow evaporation (optional)'
    ]),
    requiredTools: JSON.stringify(['Bucket for floor drains', 'Mineral oil (optional)']),
    safetyPrecautions: JSON.stringify(['Check for leaks when running water', 'Ensure drains are flowing properly']),
    isSystemTemplate: true,
    isActive: true
  },
  {
    name: 'Test Sump Pump',
    description: 'Test sump pump operation to ensure it will work when needed',
    category: AssetCategory.PLUMBING,
    defaultFrequency: Frequency.QUARTERLY,
    estimatedDurationMinutes: 15,
    difficulty: Difficulty.EASY,
    instructions: JSON.stringify([
      'Remove sump pump cover',
      'Check for debris in pit',
      'Pour water slowly until float triggers pump',
      'Verify pump activates and water drains',
      'Check discharge pipe outside for flow',
      'Listen for unusual noises',
      'Test backup power source if present'
    ]),
    requiredTools: JSON.stringify(['Bucket of water', 'Flashlight', 'Gloves']),
    safetyPrecautions: JSON.stringify(['Keep electrical cords away from water', 'Never put hands near pump intake']),
    isSystemTemplate: true,
    isActive: true
  },

  // Appliances Category
  {
    name: 'Clean Refrigerator Coils',
    description: 'Clean dust and debris from refrigerator coils to maintain cooling efficiency',
    category: AssetCategory.APPLIANCE,
    defaultFrequency: Frequency.SEMIANNUAL,
    estimatedDurationMinutes: 30,
    difficulty: Difficulty.MODERATE,
    instructions: JSON.stringify([
      'Unplug refrigerator or turn off circuit breaker',
      'Locate coils (back or bottom of unit)',
      'Remove base grille if coils are underneath',
      'Use coil brush or vacuum to remove dust',
      'Clean fan blades if accessible',
      'Vacuum floor area under/behind fridge',
      'Replace grille and restore power'
    ]),
    requiredTools: JSON.stringify(['Coil cleaning brush', 'Vacuum with hose attachment', 'Flashlight', 'Screwdriver']),
    safetyPrecautions: JSON.stringify(['Always unplug before cleaning', 'Be gentle with coil fins', 'Have someone help move heavy unit']),
    isSystemTemplate: true,
    isActive: true
  },
  {
    name: 'Clean Range Hood Filter',
    description: 'Clean or replace range hood grease filter to maintain ventilation',
    category: AssetCategory.APPLIANCE,
    defaultFrequency: Frequency.MONTHLY,
    estimatedDurationMinutes: 20,
    difficulty: Difficulty.EASY,
    instructions: JSON.stringify([
      'Turn off range hood',
      'Remove filter(s) from hood',
      'For metal filters: soak in hot soapy water with degreaser',
      'Scrub with soft brush if needed',
      'For charcoal filters: replace (cannot be cleaned)',
      'Wipe hood interior with degreaser',
      'Rinse and dry metal filter thoroughly',
      'Reinstall filter'
    ]),
    requiredTools: JSON.stringify(['Degreasing dish soap', 'Hot water', 'Soft brush', 'Cleaning cloths']),
    safetyPrecautions: JSON.stringify(['Let filter cool before removing', 'Use gloves with hot water and degreaser']),
    isSystemTemplate: true,
    isActive: true
  },
  {
    name: 'Clean Garbage Disposal',
    description: 'Clean and deodorize garbage disposal to prevent odors and maintain operation',
    category: AssetCategory.APPLIANCE,
    defaultFrequency: Frequency.MONTHLY,
    estimatedDurationMinutes: 10,
    difficulty: Difficulty.EASY,
    instructions: JSON.stringify([
      'Turn off disposal and unplug if possible',
      'Check for visible debris with flashlight (never put hand in)',
      'Pour 1/2 cup baking soda down disposal',
      'Add 1 cup white vinegar and let foam',
      'Wait 5-10 minutes',
      'Flush with hot water while running disposal',
      'Grind ice cubes and citrus peels for freshness'
    ]),
    requiredTools: JSON.stringify(['Baking soda', 'White vinegar', 'Ice cubes', 'Citrus peels', 'Flashlight']),
    safetyPrecautions: JSON.stringify(['Never put hand in disposal', 'Always run water when operating', 'Turn off power when cleaning']),
    isSystemTemplate: true,
    isActive: true
  },
  {
    name: 'Clean Dryer Vent',
    description: 'Clean lint from dryer vent system to prevent fires and improve efficiency',
    category: AssetCategory.APPLIANCE,
    defaultFrequency: Frequency.QUARTERLY,
    estimatedDurationMinutes: 30,
    difficulty: Difficulty.MODERATE,
    instructions: JSON.stringify([
      'Unplug dryer and pull away from wall',
      'Disconnect vent hose from dryer',
      'Use vent brush to clean hose thoroughly',
      'Go outside and clean exterior vent',
      'Vacuum area behind dryer',
      'Reconnect vent hose securely',
      'Run empty cycle to test airflow'
    ]),
    requiredTools: JSON.stringify(['Dryer vent brush kit', 'Vacuum', 'Screwdriver', 'Flashlight']),
    safetyPrecautions: JSON.stringify(['Unplug dryer first', 'Check for gas leaks if gas dryer', 'Ensure proper reconnection']),
    isSystemTemplate: true,
    isActive: true
  },

  // Safety Category (using ELECTRICAL for safety items)
  {
    name: 'Test Smoke Detectors',
    description: 'Test all smoke detectors and replace batteries as needed',
    category: AssetCategory.ELECTRICAL,
    defaultFrequency: Frequency.MONTHLY,
    estimatedDurationMinutes: 15,
    difficulty: Difficulty.EASY,
    instructions: JSON.stringify([
      'Alert family members before testing',
      'Press test button on each detector',
      'Verify alarm sounds clearly',
      'Replace batteries in any weak-sounding units',
      'Test interconnected alarms (all should sound)',
      'Vacuum or dust detector vents',
      'Record test date and any batteries replaced'
    ]),
    requiredTools: JSON.stringify(['Step ladder', '9V batteries', 'Vacuum with brush attachment', 'Test log']),
    safetyPrecautions: JSON.stringify(['Use stable ladder', 'Have someone spot you', 'Replace detector if over 10 years old']),
    isSystemTemplate: true,
    isActive: true
  },
  {
    name: 'Test GFCI Outlets',
    description: 'Test ground fault circuit interrupter outlets for proper operation',
    category: AssetCategory.ELECTRICAL,
    defaultFrequency: Frequency.MONTHLY,
    estimatedDurationMinutes: 10,
    difficulty: Difficulty.EASY,
    instructions: JSON.stringify([
      'Locate all GFCI outlets (kitchen, bathroom, garage, outdoor)',
      'Plug in a lamp or device to verify power',
      'Press TEST button - device should turn off',
      'Press RESET button - device should turn on',
      'If test fails, replace outlet immediately',
      'Test GFCI breakers in panel the same way',
      'Record any failures for electrician'
    ]),
    requiredTools: JSON.stringify(['Lamp or phone charger for testing', 'Label maker to mark outlets']),
    safetyPrecautions: JSON.stringify(['Never test with wet hands', 'Replace failed GFCIs immediately', 'Use licensed electrician for replacements']),
    isSystemTemplate: true,
    isActive: true
  },
  {
    name: 'Inspect Fire Extinguisher',
    description: 'Check fire extinguisher pressure and accessibility',
    category: AssetCategory.ELECTRICAL,
    defaultFrequency: Frequency.ANNUAL,
    estimatedDurationMinutes: 5,
    difficulty: Difficulty.EASY,
    instructions: JSON.stringify([
      'Check pressure gauge - needle should be in green zone',
      'Verify pin and tamper seal are intact',
      'Check for visible damage or corrosion',
      'Ensure mounting bracket is secure',
      'Verify extinguisher is easily accessible',
      'Read instructions to stay familiar',
      'Note expiration or service date'
    ]),
    requiredTools: JSON.stringify(['None required', 'Replacement extinguisher if expired']),
    safetyPrecautions: JSON.stringify(['Replace if pressure low', 'Service every 6 years', 'Replace every 12 years']),
    isSystemTemplate: true,
    isActive: true
  },

  // Outdoor Category
  {
    name: 'Clean Gutters',
    description: 'Remove leaves and debris from gutters and downspouts',
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
      'Install gutter guards if desired'
    ]),
    requiredTools: JSON.stringify(['Extension ladder', 'Gutter scoop', 'Garden hose', 'Gloves', 'Bucket', 'Safety glasses']),
    safetyPrecautions: JSON.stringify(['Never work alone', 'Use ladder stabilizer', 'Avoid power lines', 'Don\'t work in wet conditions']),
    isSystemTemplate: true,
    isActive: true
  },
  {
    name: 'Check Roof and Attic',
    description: 'Visual inspection of roof condition and attic for issues',
    category: AssetCategory.OUTDOOR,
    defaultFrequency: Frequency.SEMIANNUAL,
    estimatedDurationMinutes: 60,
    difficulty: Difficulty.MODERATE,
    instructions: JSON.stringify([
      'From ground, check for missing/damaged shingles',
      'Look for sagging areas or damaged flashing',
      'Check gutters for shingle granules (indicates wear)',
      'In attic, look for water stains or wet spots',
      'Check for adequate insulation',
      'Ensure vents are clear and unblocked',
      'Look for signs of pests or animals',
      'Document any issues with photos'
    ]),
    requiredTools: JSON.stringify(['Binoculars', 'Flashlight', 'Camera', 'Notepad', 'Dust mask for attic']),
    safetyPrecautions: JSON.stringify(['Don\'t walk on roof', 'Wear mask in attic', 'Watch for nails and insulation']),
    isSystemTemplate: true,
    isActive: true
  },
  {
    name: 'Winterize Outdoor Faucets',
    description: 'Prepare outdoor water faucets for freezing temperatures',
    category: AssetCategory.OUTDOOR,
    defaultFrequency: Frequency.ANNUAL,
    estimatedDurationMinutes: 30,
    difficulty: Difficulty.EASY,
    instructions: JSON.stringify([
      'Locate indoor shutoff valves for outdoor faucets',
      'Turn off water supply to outdoor faucets',
      'Go outside and open faucets to drain water',
      'Leave outdoor faucets open',
      'Remove and store hoses indoors',
      'Install faucet covers for extra protection',
      'Check for any drips at shutoff valves'
    ]),
    requiredTools: JSON.stringify(['Faucet covers', 'Adjustable wrench', 'Bucket for drips', 'Towels']),
    safetyPrecautions: JSON.stringify(['Complete before first freeze', 'Know location of main shutoff', 'Fix any leaking valves']),
    isSystemTemplate: true,
    isActive: true
  },
  {
    name: 'Clean Chimney',
    description: 'Professional chimney cleaning and inspection for safe operation',
    category: AssetCategory.OUTDOOR,
    defaultFrequency: Frequency.ANNUAL,
    estimatedDurationMinutes: 120,
    difficulty: Difficulty.PROFESSIONAL,
    instructions: JSON.stringify([
      'Schedule certified chimney sweep',
      'Clear area around fireplace',
      'Remove grate and andirons',
      'Cover nearby furniture',
      'Provide access to roof if needed',
      'Ask about inspection findings',
      'Request written report',
      'Schedule any needed repairs'
    ]),
    requiredTools: JSON.stringify(['Phone to schedule service', 'Drop cloths', 'Vacuum for cleanup']),
    safetyPrecautions: JSON.stringify(['Use only certified professionals', 'Never use fireplace if issues found', 'Install carbon monoxide detectors']),
    isSystemTemplate: true,
    isActive: true
  },
  {
    name: 'Seal Deck/Fence',
    description: 'Apply sealant or stain to protect wood deck and fence from weather',
    category: AssetCategory.OUTDOOR,
    defaultFrequency: Frequency.ANNUAL,
    estimatedDurationMinutes: 240,
    difficulty: Difficulty.MODERATE,
    instructions: JSON.stringify([
      'Check weather - need 2-3 dry days',
      'Clean deck/fence with appropriate cleaner',
      'Let dry completely (24-48 hours)',
      'Sand rough spots if needed',
      'Apply sealant/stain with brush or sprayer',
      'Work in sections for even coverage',
      'Apply second coat if recommended',
      'Allow full cure time before use'
    ]),
    requiredTools: JSON.stringify(['Deck cleaner', 'Pressure washer or hose', 'Sealant/stain', 'Brushes or sprayer', 'Drop cloths', 'Sandpaper']),
    safetyPrecautions: JSON.stringify(['Wear protective equipment', 'Ensure good ventilation', 'Keep off deck during drying']),
    isSystemTemplate: true,
    isActive: true
  },
  {
    name: 'Clean Window Wells',
    description: 'Remove debris from window wells to prevent water damage and improve emergency egress',
    category: AssetCategory.OUTDOOR,
    defaultFrequency: Frequency.SEMIANNUAL,
    estimatedDurationMinutes: 45,
    difficulty: Difficulty.EASY,
    instructions: JSON.stringify([
      'Remove window well covers if present',
      'Remove leaves, debris, and trash',
      'Check drain at bottom if present',
      'Clear drain with snake if clogged',
      'Check window well liner for damage',
      'Ensure proper gravel depth (6-8 inches)',
      'Clean window from inside and out',
      'Replace or clean covers'
    ]),
    requiredTools: JSON.stringify(['Gloves', 'Bucket', 'Shovel', 'Drain snake if needed', 'Gravel if needed']),
    safetyPrecautions: JSON.stringify(['Watch for spiders and pests', 'Ensure ladder is stable if needed', 'Check for proper emergency egress']),
    isSystemTemplate: true,
    isActive: true
  }
]

export async function seedMaintenanceTemplates() {
  console.log('Seeding maintenance templates...')

  for (const template of maintenanceTemplates) {
    await prisma.maintenanceTemplate.create({
      data: template
    })
  }

  console.log(`Seeded ${maintenanceTemplates.length} maintenance templates`)
}