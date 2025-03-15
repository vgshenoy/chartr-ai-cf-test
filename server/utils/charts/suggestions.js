import { z } from 'zod'

const COUNT_SUGGESTIONS = 6

export const suggestions = [
  // Nature & Science
  {
    label: '🌿 Plant Power: Photosynthesis',
    prompt: 'Create a detailed chart explaining how photosynthesis works',
  },
  {
    label: '🌍 Climate Crisis Breakdown',
    prompt: 'Show me key climate change factors and their relationships in a chart',
  },
  {
    label: '🦑 Deep Sea Disco Dancers',
    prompt: 'Chart the fascinating world of bioluminescent sea creatures and how they glow',
  },
  {
    label: '🚀 Space Race Timeline',
    prompt: 'Create a timeline of major space exploration milestones',
  },
  {
    label: '🦠 Microbes: Nature\'s Extremists',
    prompt: 'Compare extremophile microorganisms and their survival adaptations',
  },
  {
    label: '🐠 Coral City: Population Crisis',
    prompt: 'Visualize coral reef ecosystem relationships and threats',
  },

  // Sports & Adventure
  {
    label: '🏄‍♂️ Surfing: From Zero to Hero',
    prompt: 'Make a progression chart for learning to surf',
  },
  {
    label: '🏅 Olympic Medal Mysteries',
    prompt: 'Analyze Olympic games medal count patterns over time',
  },
  {
    label: '🤿 Dive In: Scuba Essentials',
    prompt: 'Create a decision tree for scuba equipment based on experience level',
  },
  {
    label: '🏔️ Death Zone: Mountain Facts',
    prompt: 'Compare the world\'s deadliest mountains and their climbing statistics',
  },
  {
    label: '🤸 Parkour: Don\'t Try This',
    prompt: 'Visualize parkour and free running techniques with risk levels',
  },

  // Entertainment & Pop Culture
  {
    label: '🎤 K-pop Groups Untangled',
    prompt: 'Map the connections between popular K-pop groups and their members',
  },
  {
    label: '🎮 Gaming Timeline: 8bit→4K',
    prompt: 'Create a visual evolution of video games from 1980 to today',
  },
  {
    label: '🧙‍♂️ One Ring To Chart Them All',
    prompt: 'Create a relationship map of Lord of the Rings characters',
  },
  {
    label: '👑 Game of Thrones: Survival Odds',
    prompt: 'Chart which factors determined character survival in Game of Thrones',
  },
  {
    label: '🦸‍♂️ Superhero Box Office Battles',
    prompt: 'Compare superhero movie performance and ratings over time',
  },

  // Technology & Innovation
  {
    label: '🤖 AI Timeline: HAL to ChatGPT',
    prompt: 'Create a visual timeline of AI development and key milestones',
  },
  {
    label: '⚡ EV Showdown: Price vs Range',
    prompt: 'Compare electric car models by price, range, and features',
  },
  {
    label: '☀️ Clean Energy: Who\'s Winning?',
    prompt: 'Chart renewable energy adoption by country and type',
  },
  {
    label: '💻 Quantum Computing Explained',
    prompt: 'Create a simple visual explanation of quantum computing principles',
  },
  {
    label: '👓 AR: Not Just Fancy Glasses',
    prompt: 'Map current and future applications of augmented reality',
  },

  // Food & Cuisine
  {
    label: '☕ Coffee Bean World Tour',
    prompt: 'Create a visual guide to coffee varieties by region and flavor profile',
  },
  {
    label: '🌶️ Spice Level: Hot or Not?',
    prompt: 'Chart different spices by heat level and flavor profiles',
  },
  {
    label: '🍽️ Amsterdam Food Adventure Map',
    prompt: 'Create a map of must-try restaurants in Amsterdam by cuisine type',
  },
  {
    label: '🧪 Food Science: Kitchen Magic',
    prompt: 'Visualize molecular gastronomy techniques and their effects',
  },
  {
    label: '🥘 Street Food Olympics',
    prompt: 'Compare iconic street foods from around the world',
  },

  // Arts & Culture
  {
    label: '🎨 Modern Art: I Could Do That?',
    prompt: 'Create a visual guide to recognizing different modern art movements',
  },
  {
    label: '🎻 Classical Music for Dummies',
    prompt: 'Chart classical music periods, composers and their famous works',
  },
  {
    label: '💃 Global Dance-Off Championship',
    prompt: 'Compare traditional dances from different cultures',
  },
  {
    label: '🎭 Banksy vs The World',
    prompt: 'Map the influence and spread of street art movements globally',
  },
  {
    label: '🎪 Indigenous Art Detective Guide',
    prompt: 'Create a visual guide to recognizing indigenous art forms',
  },

  // History & Mythology
  {
    label: '🏛️ Ancient Civilizations Smackdown',
    prompt: 'Compare the achievements and technologies of ancient civilizations',
  },
  {
    label: '🐉 Mythological Beast Battle Royale',
    prompt: 'Chart mythological creatures from different cultures by powers and origins',
  },
  {
    label: '⚔️ WWII: The Simplified Edition',
    prompt: 'Create a timeline of major World War II events and turning points',
  },
  {
    label: '🗺️ Indiana Jones Was Here',
    prompt: 'Map lost cities and archaeological discoveries with their stories',
  },
  {
    label: '🐪 Silk Road: Ancient Amazon Prime',
    prompt: 'Visualize the Silk Road trade routes and their cultural impacts',
  },

  // Business & Career
  {
    label: '📊 Blockchain: Beyond the Buzzword',
    prompt: 'Create a visual explanation of blockchain applications beyond cryptocurrency',
  },
  {
    label: '💻 Remote Work: Pants Optional',
    prompt: 'Chart remote work trends and productivity factors',
  },
  {
    label: '⚽ Show Me The Football Money',
    prompt: 'Visualize the economics of professional football/soccer',
  },
  {
    label: '💡 Startup Models That Actually Work',
    prompt: 'Compare successful startup business models with examples',
  },
  {
    label: '♻️ Circular Economy: Beyond Recycling',
    prompt: 'Create a diagram of circular economy principles and examples',
  },

  // Lifestyle & Hobbies
  {
    label: '🧘‍♀️ Yoga Poses: Pretzel Level',
    prompt: 'Create a progression chart of yoga poses from beginner to advanced',
  },
  {
    label: '📸 Photography: Beyond Auto Mode',
    prompt: 'Visualize camera settings and their effects for different situations',
  },
  {
    label: '🌱 Urban Jungle: Apartment Edition',
    prompt: 'Create a visual guide to urban gardening in small spaces',
  },
  {
    label: '✨ Minimalism: Keep or Throw?',
    prompt: 'Create a decision flowchart for minimalist lifestyle choices',
  },
  {
    label: '🌎 Digital Nomad Survival Kit',
    prompt: 'Map essential tools and considerations for digital nomad lifestyle',
  },

  // Travel & Geography
  {
    label: '🏞️ National Parks: Instagram vs Reality',
    prompt: 'Compare national parks by features, crowd levels and best times to visit',
  },
  {
    label: '🏙️ Skyscraper Olympics',
    prompt: 'Visualize the world\'s tallest buildings with interesting facts',
  },
  {
    label: '🎭 Asia\'s Wildest Festivals',
    prompt: 'Create a calendar map of unique cultural festivals across Asia',
  },
  {
    label: '🗿 UNESCO Sites Nobody Knows',
    prompt: 'Map lesser-known UNESCO World Heritage sites with their significance',
  },
  {
    label: '⛰️ Norway\'s Fjords: Nature\'s Playground',
    prompt: 'Create a visual guide to Norway\'s most spectacular fjords',
  },

  // Language & Communication
  {
    label: '🗣️ Languages Going Extinct',
    prompt: 'Map endangered languages and their unique features',
  },
  {
    label: '🤟 Sign Language: Not Universal?',
    prompt: 'Compare sign language variations across different countries',
  },
  {
    label: '😀 Emoji Evolution: From :) to 🤦‍♂️',
    prompt: 'Create a timeline of emoji development and usage patterns',
  },
  {
    label: '🔤 Elvish to Klingon: Fake Languages',
    prompt: 'Compare constructed languages from fiction by complexity and features',
  },
  {
    label: '🧠 Your Brain On Languages',
    prompt: 'Visualize how multilingualism affects brain function',
  },

  // Unusual Phenomena
  {
    label: '🌊 Bermuda Triangle: Myth Busted?',
    prompt: 'Analyze Bermuda Triangle theories and actual incident data',
  },
  {
    label: '✨ Northern Lights: Sky Rave',
    prompt: 'Create a visual explanation of aurora borealis and australis',
  },
  {
    label: '🌾 Crop Circles: Aliens or Pranksters?',
    prompt: 'Compare crop circle theories and evidence',
  },
  {
    label: '🔥 Spontaneous Combustion: Hot Topic',
    prompt: 'Analyze spontaneous human combustion cases and scientific theories',
  },
  {
    label: '⚡ Ball Lightning: Nature\'s Fireball',
    prompt: 'Visualize ball lightning phenomena and possible explanations',
  },

  // Futurism & Speculation
  {
    label: '🤖 Transhumanism: Upgrade Yourself',
    prompt: 'Chart transhumanist technologies and their current development status',
  },
  {
    label: '🛸 Space Colonies: Earthlings 2.0',
    prompt: 'Visualize space colonization concepts and challenges',
  },
  {
    label: '🌱 Vertical Farming: Up, Not Out',
    prompt: 'Create a comparison of vertical farming methods and benefits',
  },
  {
    label: '⏳ Live Forever: Progress Report',
    prompt: 'Chart longevity research directions and progress',
  },
  {
    label: '🚄 Hyperloop: Tube Travel',
    prompt: 'Visualize hyperloop transportation concepts and development status',
  },

  // Product Research & Comparisons
  {
    label: '👶 Baby Monitor Anxiety Reducer',
    prompt: 'Compare baby monitors available in the EU by features and reliability',
  },
  {
    label: '📱 Budget Phones That Don\'t Suck',
    prompt: 'Compare best smartphones under $500 by key features',
  },
  {
    label: '🎧 Noise-Cancelling: Peace Finder',
    prompt: 'Create a detailed comparison of top noise-cancelling headphones',
  },
  {
    label: '🦷 Toothbrush Battle: Sonic vs Spin',
    prompt: 'Compare electric toothbrushes: sonic vs. oscillating technologies',
  },
  {
    label: '🔋 Solar Chargers: Sun Power Test',
    prompt: 'Evaluate portable solar chargers by efficiency and durability',
  },

  // Personal Finance Decisions
  {
    label: '💰 $10k: Grow or Blow?',
    prompt: 'Chart investment options for $10,000 by risk and potential return',
  },
  {
    label: '🏠 Austin Housing: Buy or Wait?',
    prompt: 'Analyze buying vs renting in Austin TX based on current market data',
  },
  {
    label: '💳 Credit Card Perks Showdown',
    prompt: 'Compare Chase vs Amex travel rewards programs in detail',
  },
  {
    label: '📊 30k Salary: Survival Plan',
    prompt: 'Create an optimal budget breakdown for a $30,000 annual salary',
  },
  {
    label: '🎓 Student Debt vs Investing Battle',
    prompt: 'Analyze whether to pay off student debt or invest based on different scenarios',
  },

  // Life Choices & Moves
  {
    label: '📍 Portland vs Denver Showdown',
    prompt: 'Create a detailed comparison of living in Portland vs Denver',
  },
  {
    label: '👨‍👩‍👦 NYC Childcare Cost Crisis',
    prompt: 'Compare daycare vs nanny costs in NYC with pros and cons',
  },
  {
    label: '🎯 Career Pivot: Marketing to UX',
    prompt: 'Map the transition path from marketing to UX design career',
  },
  {
    label: '🏫 Degree Deathmatch: CS vs Data',
    prompt: 'Compare CS vs Data Science degrees by job prospects and salary',
  },
  {
    label: '🐕 Apartment Dogs: Beyond Chihuahuas',
    prompt: 'Chart best dog breeds for apartment living with exercise needs',
  },

  // Health & Fitness Planning
  {
    label: '🏃‍♀️ Couch to 5K: Reality Check',
    prompt: 'Create a realistic training progression from no running to 5K or 10K',
  },
  {
    label: '😴 Night Owl Rehab Program',
    prompt: 'Design a step-by-step plan to fix sleep schedule for night owls',
  },
  {
    label: '🥗 Diet Battle: Mediterranean vs Keto',
    prompt: 'Compare Mediterranean vs Keto diets with pros and cons',
  },
  {
    label: '💊 Vitamin D: Not All Created Equal',
    prompt: 'Compare Vitamin D supplement brands and formulations',
  },
  {
    label: '🧘‍♀️ Meditation App Face-Off',
    prompt: 'Create a detailed feature comparison of Calm vs Headspace',
  },

  // Purchase Research
  {
    label: '🚗 EV Showdown: Tesla vs Polestar',
    prompt: 'Create a detailed comparison of Tesla 3 vs Polestar 2',
  },
  {
    label: '📱 Phone Plans: Coverage vs Cash',
    prompt: 'Compare T-Mobile vs Verizon plans with coverage maps and true costs',
  },
  {
    label: '🛒 Bulk Buying: Worth the Membership?',
    prompt: 'Analyze Costco vs Sam\'s Club value with product category breakdowns',
  },
  {
    label: '🎮 Console Wars 2023 Edition',
    prompt: 'Compare PS5 vs Xbox Series X by specs, games, and value',
  },
  {
    label: '⌚ Wrist Battle: Apple vs Fitness',
    prompt: 'Create a feature comparison between Apple Watch and Garmin watches',
  },

  // Project & Event Planning
  {
    label: '📋 Wedding Budget: Reality Edition',
    prompt: 'Create a realistic $25k wedding budget breakdown with percentages',
  },
  {
    label: '🏗️ Bathroom Reno: Expectation vs Reality',
    prompt: 'Create a realistic bathroom remodel timeline with potential pitfalls',
  },
  {
    label: '📚 JavaScript: Zero to Hero',
    prompt: 'Design a 6-month learning roadmap for JavaScript from beginner to job-ready',
  },
  {
    label: '🌱 Tiny Garden, Big Dreams',
    prompt: 'Create a balcony garden planting plan for USDA Zone 7',
  },
  {
    label: '✈️ Japan Adventure: Sushi to Sumo',
    prompt: 'Design a comprehensive 2-week Japan itinerary with costs and highlights',
  },

  // Specific Chart Types & Visualizations
  {
    label: '📊 SWOT Analysis: Corporate Edition',
    prompt: 'Create a SWOT analysis template for business evaluation',
  },
  {
    label: '📈 Future You: Growth Projections',
    prompt: 'Show me a growth projection chart for [topic]',
  },
  {
    label: '🗓️ Project Timeline: No More Delays',
    prompt: 'Create a realistic project timeline with dependencies and critical path',
  },
  {
    label: '🌊 Customer Journey: Pain Points Map',
    prompt: 'Visualize a typical customer journey with touchpoints and emotions',
  },
  {
    label: '🔄 Product Lifecycle: Birth to Obsolescence',
    prompt: 'Create a product lifecycle chart with marketing strategies for each stage',
  },
  {
    label: '🧠 Mind-Map: Brain Explosion',
    prompt: 'Build a comprehensive mindmap about [topic]',
  },
  {
    label: '🌳 Decision Tree: Choose Wisely',
    prompt: 'Make a decision tree for [problem]',
  },
  {
    label: '📋 Kanban: Productivity Savior',
    prompt: 'Create a Kanban board template for my project',
  },

  // Work & Professional
  {
    label: '👔 Performance Review Survival Kit',
    prompt: 'Create a preparation framework for an upcoming performance review',
  },
  {
    label: '💼 Career GPS: Where Next?',
    prompt: 'Visualize potential career paths and requirements from my current position',
  },
  {
    label: '🗣️ Manager Types: The Good & Evil',
    prompt: 'Compare different management styles with pros and cons',
  },
  {
    label: '📊 Market Segment X-Ray',
    prompt: 'Create a framework to analyze market segments for a business',
  },
  {
    label: '💰 Marketing ROI Detective',
    prompt: 'Show how to compare ROI across different marketing channels',
  },
  {
    label: '🔍 Spy On Your Competitors',
    prompt: 'Create a competitive analysis template with key metrics',
  },
  {
    label: '⚡ Productivity System Showdown',
    prompt: 'Compare productivity systems (GTD, Pomodoro, etc.) with pros and cons',
  },
  {
    label: '📑 Meetings That Don\'t Suck',
    prompt: 'Create an effective meeting agenda template with time allocations',
  },

  // Data & Analytics
  {
    label: '📉 Data Whisperer: Find Trends',
    prompt: 'Show me how to identify meaningful trends in time-series data',
  },
  {
    label: '🔍 Number Cruncher: Pattern Finder',
    prompt: 'Create a framework to identify patterns in numerical data',
  },
  {
    label: '📊 Stat Attack: Visualization Pro',
    prompt: 'Show the best chart types to visualize different kinds of statistics',
  },
  {
    label: '⚖️ Metrics That Actually Matter',
    prompt: 'Create a framework to compare and prioritize business metrics',
  },
  {
    label: '🎯 KPI Tracker: Boss Impressor',
    prompt: 'Design a KPI tracking dashboard with alert thresholds',
  },
  {
    label: '🧮 Budget Breakdown Detective',
    prompt: 'Create a template to break down and analyze a budget by categories',
  },
  {
    label: '📈 Fortune Teller: Data Edition',
    prompt: 'Show methods to forecast future quarters based on historical data',
  },
  {
    label: '🔄 Funnel Doctor: Fix Conversion',
    prompt: 'Create a framework to analyze and optimize a conversion funnel',
  },

  // Planning & Strategy
  {
    label: '🎯 SMART Goals: Actually Achievable',
    prompt: 'Create a framework for setting truly SMART goals with examples',
  },
  {
    label: '🧩 Problem Solver: Piece by Piece',
    prompt: 'Show a method to break complex problems into manageable parts',
  },
  {
    label: '🔍 Strengths/Weaknesses: Honest Edition',
    prompt: 'Create a template for analyzing personal or business strengths and weaknesses',
  },
  {
    label: '📝 Weekly System: Get Stuff Done',
    prompt: 'Design an effective weekly planning system with templates',
  },
  {
    label: '🗺️ Customer Personas: Beyond Fiction',
    prompt: 'Create a framework for developing realistic customer personas',
  },
  {
    label: '🏆 Habit Tracker: Actually Works',
    prompt: 'Design a habit tracking system that encourages consistency',
  },
  {
    label: '⚙️ Workflow Wizard: Efficiency Boost',
    prompt: 'Create a method to identify and eliminate workflow bottlenecks',
  },
  {
    label: '🔄 Feedback Loop: Action Generator',
    prompt: 'Design a feedback loop system that leads to implementable actions',
  },

  // Travel & Exploration
  {
    label: '✈️ Paris Weekend: Beyond Eiffel',
    prompt: 'Plan a weekend in Paris with hidden gems and local favorites',
  },
  {
    label: '🏨 Sleep Options: Price vs Sanity',
    prompt: 'Compare accommodation options with pros, cons and hidden costs',
  },
  {
    label: '🗺️ Kid-Friendly: Tantrums Avoided',
    prompt: 'Map kid-friendly activities for [destination] by age group',
  },
  {
    label: '🍽️ Food Adventures: Skip Tourist Traps',
    prompt: 'Create a guide to finding authentic local restaurants while traveling',
  },
  {
    label: '💰 Travel Budget: Reality Check',
    prompt: 'Create a realistic travel budget breakdown with contingencies',
  },
  {
    label: '🚗 Road Trip: Bathroom Breaks Included',
    prompt: 'Plan optimal road trip stops balancing driving time and attractions',
  },
  {
    label: '🎒 Packing: Forget Nothing',
    prompt: 'Create a comprehensive travel packing checklist by destination type',
  },
  {
    label: '⏱️ Itinerary: Relaxation Included',
    prompt: 'Design a balanced travel itinerary that avoids burnout',
  },

  // Learning & Education
  {
    label: '📚 Learn Anything: Structured Path',
    prompt: 'Create a structured learning plan for mastering [skill/subject]',
  },
  {
    label: '🧠 Memory Hacks: Remember Everything',
    prompt: 'Visualize effective memorization techniques for different content types',
  },
  {
    label: '📝 Note-Taking Systems Cage Match',
    prompt: 'Compare note-taking systems (Cornell, Mind Mapping, etc.) by use case',
  },
  {
    label: '🎓 Degree Paths: Worth The Debt?',
    prompt: 'Map potential degree paths with ROI and career outcomes',
  },
  {
    label: '💡 ELI5: Make It Make Sense',
    prompt: 'Explain this concept visually as if I\'m five years old: [concept]',
  },
  {
    label: '🏫 Online Courses: Worth Your Time?',
    prompt: 'Compare online course platforms by quality, cost, and recognition',
  },
  {
    label: '📊 Learning Curve: Track Progress',
    prompt: 'Design a system to track learning progress with meaningful milestones',
  },
  {
    label: '🔄 Spaced Repetition: Memory Hack',
    prompt: 'Create a spaced repetition plan for effective long-term learning',
  },

  // Comparisons & Decision Making
  {
    label: '⚖️ Decision Helper: Choose Wisely',
    prompt: 'Help me decide between these options: [options]',
  },
  {
    label: '📊 Option Overload: Clarity Creator',
    prompt: 'Create a comprehensive comparison of these options: [options]',
  },
  {
    label: '🔍 Pros/Cons: Beyond The Obvious',
    prompt: 'Create an in-depth pros and cons analysis for [decision]',
  },
  {
    label: '💰 Money Talk: Cost-Benefit Master',
    prompt: 'Create a cost-benefit comparison for [alternatives]',
  },
  {
    label: '🎯 Alternative Finder: Better Options',
    prompt: 'Evaluate these alternatives for [need] based on key criteria',
  },
  {
    label: '📏 Rate My Options: Decision Time',
    prompt: 'Create a rating system for these choices: [choices]',
  },
  {
    label: '🧮 Value Finder: Worth The Money?',
    prompt: 'Calculate which option provides the best value: [options]',
  },
  {
    label: '📑 Feature Matrix: See Everything',
    prompt: 'Create a comprehensive feature comparison matrix for [products]',
  },

  // Personal Development
  {
    label: '⏰ Perfect Day: Design Your Life',
    prompt: 'Help me design my ideal day with realistic time blocks',
  },
  {
    label: '🎯 5-Year Vision: Not Just Dreams',
    prompt: 'Create a structured 5-year vision with milestones and action steps',
  },
  {
    label: '💭 Values Compass: Life Direction',
    prompt: 'Help me visualize and prioritize my core life values',
  },
  {
    label: '🧘‍♂️ Life Balance: Reality Check',
    prompt: 'Create a life balance wheel assessment with improvement strategies',
  },
  {
    label: '📝 Priority Matrix: What Matters',
    prompt: 'Create a method to track and evaluate personal priorities',
  },
  {
    label: '🌱 Growth Map: Level Up',
    prompt: 'Identify personal growth opportunities based on goals and interests',
  },
  {
    label: '💪 Skills Audit: Your Superpowers',
    prompt: 'Create a skills assessment matrix with development paths',
  },
  {
    label: '🔄 Habit Builder: Stick With It',
    prompt: 'Design a personalized habit building system that prevents failure',
  },

  // Health & Wellness
  {
    label: '💤 Sleep Detective: Why So Tired?',
    prompt: 'Create a framework to analyze sleep patterns and identify issues',
  },
  {
    label: '🥗 Meal Prep: Not Sad Tupperware',
    prompt: 'Plan balanced, exciting meal prep options for a busy week',
  },
  {
    label: '🏋️ Workout Planner: No Gym Required',
    prompt: 'Design a customizable workout routine for [goal] without equipment',
  },
  {
    label: '💧 Hydration Tracker: Water Up',
    prompt: 'Create a system to track and improve daily water consumption',
  },
  {
    label: '🧠 Mental Health Checkup',
    prompt: 'Design a mental wellness self-assessment with action steps',
  },
  {
    label: '⚖️ Fitness Program Referee',
    prompt: 'Compare popular fitness programs by effectiveness and time commitment',
  },
  {
    label: '📊 Nutrient Detective: Food Decoder',
    prompt: 'Show a comprehensive nutrition breakdown system for meal planning',
  },
  {
    label: '📈 Health Numbers: What\'s Normal?',
    prompt: 'Create a reference guide for tracking key health metrics',
  },
]

export const suggestionsPrompt = `
    Based on the conversation context, generate around ${COUNT_SUGGESTIONS} suggestions for the user to continue the conversation.
    
    The suggestions might be one of the following types:
    - make edits to the chart just drawn (Eg. "Add more data to the table", "Add a column to the table", "Add emoji", "Improve the title")
    - move the information to a different chart type (Eg. "Put this in a mindmap", "Put this in a flowchart")
    - make another chart on the same topic (Eg. "Oktoberfest beers" if the conversation is about Oktoberfest history)
    - explore the same topic from a different angle (Eg. "Explore by age" if the conversation is about types of Baby Led Weaning foods)
    - explore an adjacent topic (Eg. "Beer festivals globally" if the conversation is about Oktoberfest)
    - anything else you can think of that might be interesting to the user

    Overall, ensure a good mix of the above types.
    
    If the assistant has made suggestions in the text at the end of the conversation, then you can use those. 
    
    Each suggestion should be very short and concise (no more than 6 words). Almost written in shorthand.
    Eg. If the topic is Moth vs Butterfly, do not say "Compare moths and butterflies with other insects", just say "Compare with other insects"
    
    If there is effectively no message history to use as a basis, return nothing.

    IMPORTANT: Each one to have an emoji at the beginning of the text.

    DO NOT:
    - repeat prompts or charts already in the conversation.
    - suggest nodes or parameters of a chart as a follow up prompt.
    `

export const suggestionsSchema = z.object({
  suggestions: z.array(z.object({
    label: z.string(),
    prompt: z.string(),
  })),
})

// - If there is another chart to be drawn as per the conversation, then suggest "Next Chart"
// - If there is scope to add humour, then suggest "Make it funny"

// Each suggestion should be very concise and minimal (no more than 6 words). Almost written in shorthand.
// Eg. If the topic is Moth vs Butterfly, do not say "Compare moths and butterflies with other insects", just say "Compare with other insects"

// IMPORTANT: Return ${COUNT_SUGGESTIONS} suggestions. No more.
