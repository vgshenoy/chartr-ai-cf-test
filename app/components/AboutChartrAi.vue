<script setup>
const charts = [

  // {
  //   data: {
  //     rows: [['⚡️ Learn Fast, Visually', ['Navigate information effortlessly', 'Curated collection of charts', 'No more walls of text']], ['🚀 Make it Your Own', ['Create unique and engaging charts', 'Simply describe what you want', 'No design skills required']], ['👥 Share Effortlessly', ['Share as image, link, or embed', 'Easy knowledge transfer', 'Nifty and convenient']]],
  //     type: 'tableChart',
  //     title: '✨ How chartr.ai Can Help You',
  //     chartId: 'charted_out_benefits',
  //     headers: ['Feature', 'Description'],
  //   },
  // },

  {
    username: 'bossmang',
    data: {
      type: 'quadrants',
      title: '🌿 Houseplants: Light Needs vs. Watering Requirements', chartId: 'houseplants-light-watering-2x2',
      quadrants: [{ label: 'Low Light & Low Watering', xCategory: 'Low Watering', yCategory: 'Low Light', datapoints: [{ label: '🌵 Snake Plant', wikiLink: 'https://en.wikipedia.org/wiki/Sansevieria' }, { label: '🌿 ZZ Plant', wikiLink: 'https://en.wikipedia.org/wiki/Zamioculcas' }, { label: '🌱 Cast Iron Plant', wikiLink: 'https://en.wikipedia.org/wiki/Aspidistra' }] }, { label: 'High Light & Low Watering', xCategory: 'Low Watering', yCategory: 'High Light', datapoints: [{ label: '🌵 Aloe Vera', wikiLink: 'https://en.wikipedia.org/wiki/Aloe_vera' }, { label: '🌿 Jade Plant', wikiLink: 'https://en.wikipedia.org/wiki/Crassula_ovata' }, { label: '🌱 Ponytail Palm', wikiLink: 'https://en.wikipedia.org/wiki/Beaucarnea_recurvata' }] }, { label: 'Low Light & High Watering', xCategory: 'High Watering', yCategory: 'Low Light', datapoints: [{ label: '🌿 Peace Lily', wikiLink: 'https://en.wikipedia.org/wiki/Spathiphyllum' }, { label: '🌱 Boston Fern', wikiLink: 'https://en.wikipedia.org/wiki/Nephrolepis_exaltata' }, { label: '🌿 Calathea', wikiLink: 'https://en.wikipedia.org/wiki/Calathea' }] }, { label: 'High Light & High Watering', xCategory: 'High Watering', yCategory: 'High Light', datapoints: [{ label: '🌱 Monstera', wikiLink: 'https://en.wikipedia.org/wiki/Monstera' }, { label: '🌿 Fiddle Leaf Fig', wikiLink: 'https://en.wikipedia.org/wiki/Ficus_lyrata' }, { label: '🌱 Bird of Paradise', wikiLink: 'https://en.wikipedia.org/wiki/Strelitzia' }] }], xDimension: { label: 'Watering Requirements', categories: ['Low Watering', 'High Watering'] }, yDimension: {
        label: 'Light Needs', categories: ['Low Light', 'High Light'],
      },
    },
    likesCount: 17,
    dummyTimeAgo: '3 hours ago',
  },

  {
    username: 'edison',
    data: {
      type: 'mermaid',
      title: '🍵 Kombucha Brewing Process',
      markup: 'flowchart TD\n  id1["🍵 Start with Tea"] --> id2["🍬 Add Sugar"]\n  id2 --> id3["🌡️ Cool to Room Temperature"]\n  id3 --> id4["🧫 Add SCOBY"]\n  id4 --> id5["🕒 Ferment for 7-30 Days"]\n  id5 --> id6{"🤔 Taste Test"}\n  id6 -->|"Too Sweet"| id7["🕒 Ferment Longer"]\n  id6 -->|"Just Right"| id8["🍾 Bottle Kombucha"]\n  id8 --> id9["🍓 Add Flavoring (Optional)"]\n  id9 --> id10["🕒 Second Fermentation"]\n  id10 --> id11["❄️ Refrigerate"]\n  id11 --> id12["🥤 Enjoy!"]',
      chartId: 'kombucha_brewing_process',
    },
    likesCount: 9,
    dummyTimeAgo: '2 weeks ago',
  },

  {
    username: 'colinfa',
    data: {
      rows: [['🙏', 'Thank you (🇯🇵 Japan)', 'Praying or High Five (🇺🇸 USA)'], ['🍑', 'Peach (🇨🇳 China)', 'Buttocks (🇺🇸 USA)'], ['👋', 'Hello (🇮🇳 India)', 'Goodbye (🇬🇧 UK)'], ['👌', 'Perfect (🇧🇷 Brazil)', 'Insult (🇹🇷 Turkey)'], ['💋', 'Kiss (🇫🇷 France)', 'Love (🇪🇸 Spain)'], ['💧', 'Tears (🇰🇷 South Korea)', 'Sweat (🇯🇵 Japan)']],
      type: 'tableChart',
      title: '🌍 Emojis with Different Meanings Across Cultures',
      chartId: 'emoji_different_meanings',
      headers: ['Emoji', 'Meaning in Culture A', 'Meaning in Culture B'],
    },
    likesCount: 21,
    dummyTimeAgo: '1 day ago',
  },

  {
    username: 'vgshenoy',
    data: {
      title: '🐋 Orca Coordination in Seal Hunting',
      markup: 'sequenceDiagram\n  participant Orca1 as 🐋 Orca 1\n  participant Orca2 as 🐋 Orca 2\n  participant Orca3 as 🐋 Orca 3\n  participant Seal as 🦭 Seal\n  Orca1->>Orca2: 📣 Signal to start hunt\n  Orca2->>Orca3: 🔄 Relay signal\n  Orca3-->>Orca1: 👍 Acknowledge\n  Orca1->>Seal: ➡️ Approach from front\n  Orca2->>Seal: ↖️ Flank from left\n  Orca3->>Seal: ↗️ Flank from right\n  Seal-->>Orca1: 🏃 Attempt to escape\n  Orca1->>Orca2: 🚫 Block escape route\n  Orca2->>Orca3: 🔒 Close in\n  Orca3-->>Seal: 🎯 Final capture',
      chartId: 'orca-seal-hunt',
      type: 'mermaid',
    },
    likesCount: 6,
    dummyTimeAgo: '5 days ago',
  },

  {
    username: 'bossmang',
    data: {
      type: 'mermaid',
      title: '🌍 Earth: Key Components and Features',
      markup: 'mindmap\n  root(("🌍 Earth"))\n    id1["🌿 Biosphere"]\n      id2["🌳 Forests"]\n      id3["🐾 Wildlife"]\n      id4["🌊 Oceans"]\n    id5["🌋 Geosphere"]\n      id6["🗻 Mountains"]\n      id7["🏜️ Deserts"]\n      id8["🏞️ Valleys"]\n    id9["🌧️ Atmosphere"]\n      id10["☁️ Clouds"]\n      id11["💨 Winds"]\n      id12["🌈 Weather Patterns"]\n    id13["🌊 Hydrosphere"]\n      id14["🏞️ Rivers"]\n      id15["🏝️ Islands"]\n      id16["💧 Lakes"]',
      chartId: 'earth-mindmap',
    },
    likesCount: 27,
    dummyTimeAgo: '1 month ago',
  },

  {
    username: 'vgshenoy',
    data: {
      type: 'timeline',
      title: '🏛️ Rome\'s Journey: From Ancient Civilization to Modern Era',
      chartId: 'rome_comprehensive_timeline',
      timeline: [
        { date: '-753', dateLabel: '753 BCE', label: '🏺 Founding of Rome', description: 'Legendary founding by Romulus' },
        { date: '-27', dateLabel: '27 BCE', label: '👑 Roman Empire Begins', description: 'Augustus becomes first Roman Emperor' },
        { date: '330', dateLabel: '330 CE', label: '🌍 Constantinople Established', description: 'New capital of Eastern Roman Empire' },
        { date: '476', dateLabel: '476 CE', label: '🔚 Fall of Western Roman Empire', description: 'Last Western Roman Emperor deposed' },
        { date: '1309', dateLabel: '1309', label: '🕍 Papal Seat Moves', description: 'Papacy relocates to Avignon, France' },
        { date: '1870', dateLabel: '1870', label: '🇮🇹 Italian Unification', description: 'Rome becomes capital of unified Italy' },
        { date: '1929', dateLabel: '1929', label: '🏛️ Vatican City Established', description: 'Lateran Treaty creates independent Vatican City' },
        { date: '2024', dateLabel: 'Today', label: '🌐 Modern Rome', description: 'Capital of Italy, global cultural and historical center' },
      ],
    },
    likesCount: 12,
    dummyTimeAgo: '4 hours ago',
  },

  {
    username: 'edison',
    data: {
      rows: [['🌎 South America', '🌱🌱🌱🌱🌱', '☕☕'], ['🌏 Asia', '🌱🌱🌱', '☕☕☕☕'], ['🌍 Africa', '🌱🌱', '☕'], ['🌎 Central America', '🌱', '☕'], ['🌍 Europe', '🌱', '☕☕☕☕☕'], ['🌎 North America', '🌱', '☕☕☕'], ['🌏 Oceania', '🌱', '☕'], ['🌍 Antarctica', '❌', '❌']],
      type: 'tableChart',
      title: 'Coffee Production and Consumption by Continent',
      chartId: 'coffee-production-consumption',
      headers: ['Continent', 'Production', 'Consumption'],
    },
    likesCount: 3,
    dummyTimeAgo: '1 week ago',
  },

  {
    username: 'colinfa',
    data: {
      type: 'quadrants',
      title: '🐶 Dog Breeds: Size vs. Energy Level',
      chartId: 'dog-breeds-2x2',
      quadrants: [
        {
          label: 'Small & Low Energy',
          xCategory: 'Low Energy',
          yCategory: 'Small',
          datapoints: [
            { label: '🐾 French Bulldog', wikiLink: 'https://en.wikipedia.org/wiki/French_Bulldog' },
            { label: '🐾 Pug', wikiLink: 'https://en.wikipedia.org/wiki/Pug' },
            { label: '🐾 Shih Tzu', wikiLink: 'https://en.wikipedia.org/wiki/Shih_Tzu' },
          ],
        },
        {
          label: 'Small & High Energy',
          xCategory: 'High Energy',
          yCategory: 'Small',
          datapoints: [
            { label: '🐾 Jack Russell Terrier', wikiLink: 'https://en.wikipedia.org/wiki/Jack_Russell_Terrier' },
            { label: '🐾 Miniature Pinscher', wikiLink: 'https://en.wikipedia.org/wiki/Miniature_Pinscher' },
            { label: '🐾 Papillon', wikiLink: 'https://en.wikipedia.org/wiki/Papillon_(dog)' },
          ],
        },
        {
          label: 'Large & Low Energy',
          xCategory: 'Low Energy',
          yCategory: 'Large',
          datapoints: [
            { label: '🐾 Great Dane', wikiLink: 'https://en.wikipedia.org/wiki/Great_Dane' },
            { label: '🐾 Mastiff', wikiLink: 'https://en.wikipedia.org/wiki/Mastiff' },
            { label: '🐾 Saint Bernard', wikiLink: 'https://en.wikipedia.org/wiki/St._Bernard_(dog)' },
          ],
        },
        {
          label: 'Large & High Energy',
          xCategory: 'High Energy',
          yCategory: 'Large',
          datapoints: [
            { label: '🐾 Border Collie', wikiLink: 'https://en.wikipedia.org/wiki/Border_Collie' },
            { label: '🐾 German Shepherd', wikiLink: 'https://en.wikipedia.org/wiki/German_Shepherd' },
            { label: '🐾 Labrador Retriever', wikiLink: 'https://en.wikipedia.org/wiki/Labrador_Retriever' },
          ],
        },
      ],
      xDimension: {
        label: 'Energy Level',
        categories: ['Low Energy', 'High Energy'],
      },
      yDimension: {
        label: 'Size',
        categories: ['Small', 'Large'],
      },
    },
    likesCount: 11,
    dummyTimeAgo: '2 days ago',
  },

  {
    username: 'vgshenoy',
    data: {
      type: 'mermaid',
      title: '🗺️ The Silk Road: Trade Routes and Cities',
      markup: `flowchart TD
    subgraph China["🇨🇳 China"]
        id1["🏯 Chang'an (Xi'an)"]
        id2["🏜️ Dunhuang"]
        id7["🏞️ Kashgar"]
    end
    subgraph Uzbekistan["🇺🇿 Uzbekistan"]
        id3["🏰 Samarkand"]
        id4["🏙️ Bukhara"]
    end
    subgraph Iraq["🇮🇶 Iraq"]
        id5["🏛️ Baghdad"]
    end
    subgraph Turkey["🇹🇷 Turkey"]
        id6["🏛️ Constantinople (Istanbul)"]
    end
    subgraph Afghanistan["🇦🇫 Afghanistan"]
        id8["🏞️ Herat"]
    end
    subgraph Iran["🇮🇷 Iran"]
        id9["🏛️ Tehran"]
    end
    subgraph Pakistan["🇵🇰 Pakistan"]
        id10["🏞️ Taxila"]
    end
    subgraph India["🇮🇳 India"]
        id11["🏛️ Delhi"]
        id12["🏞️ Varanasi"]
    end
    id1 --> id2
    id2 --> id3
    id3 --> id4
    id4 --> id5
    id5 --> id6
    id3 --> id7
    id7 --> id8
    id8 --> id9
    id9 --> id5
    id7 --> id10
    id10 --> id11
    id11 --> id12`,
      chartId: 'silk_road_trade_routes',
    },
    likesCount: 8,
    dummyTimeAgo: '6 hours ago',
  },

  {
    username: 'bossmang',
    data: {
      rows: [['🛍️ Plastic Bag', '🦠🦠🦠🦠🦠🦠🦠', '🍞🍞🍞🍞🍞🍞🍞'], ['📦 Bread Box', '🦠🦠🦠🦠', '🍞🍞🍞🍞🍞🍞'], ['❄️ Fridge', '🦠🦠🦠', '🍞🍞🍞🍞'], ['🧺 Basket', '🦠🦠🦠🦠🦠🦠🦠🦠', '🍞🍞🍞']],
      type: 'tableChart',
      title: '🍞 The Bread Storage Problem',
      chartId: 'bread_storage_options_ordered_freshness',
      headers: ['Storage Option', 'Likelihood of Mold (1-10)', 'Freshness Retention (1-10)'],
    },
    likesCount: 4,
    dummyTimeAgo: '3 days ago',
  },

  {
    username: 'edison',
    data: {
      type: 'mermaid',
      title: '🌡️ Cold Weather Alone Doesn\'t Cause Colds: Understanding the Influences',
      markup: 'flowchart TD\n    id1["🌡️ Cold Weather"] --> id2["🏠 More Time Indoors"]\n    id2 --> id3["👥 Increased Close Contact"]\n    id3 --> id4["🦠 Easier Virus Spread"]\n    id4 --> id5["🤧 More Colds"]\n    id1 --> id7["💧 Lower Humidity"]\n    id7 --> id8["👃 Dry Nasal Passages"]\n    id8 --> id9["🦠 Easier Virus Entry"]\n    id9 --> id5',
      chartId: 'cold-weather-colds-flowchart-v5',
    },
    likesCount: 15,
    dummyTimeAgo: '12 hours ago',
  },

  {
    username: 'colinfa',
    data: {
      rows: [['Habitat', '🌍 African savannas', '🌳 Asian forests', '🌿 African and Asian forests', '🏜️ African savannas'], ['Social Structure', '👨‍👩‍👧‍👦 Live in prides', '🧍‍♂️ Solitary', '🧍‍♂️ Solitary', '👨‍👩‍👧‍👦 Small groups (coalitions)'], ['Size', '♂️ 190-230 kg (males)', '♂️ 220-300 kg (males)', '♂️ 30-90 kg', '♂️ 21-72 kg'], ['Coat', '🦁 Tawny with a mane (males)', '🐅 Striped orange and black', '🐆 Spotted rosettes', '🐾 Spotted with tear marks'], ['Hunting Style', '👥 Cooperative hunters', '🧍‍♂️ Solo hunters', '🧍‍♂️ Ambush predators', '🏃‍♂️ High-speed chases'], ['Roar', '🔊 Loud and deep', '🔊 Loud and powerful', '🔊 Less frequent', '🔊 Cannot roar'], ['Conservation Status', '🟡 Vulnerable', '🔴 Endangered', '🟡 Vulnerable', '🟡 Vulnerable']],
      type: 'tableChart',
      title: 'Table of Big Cats',
      chartId: 'big_cats_comparison',
      headers: ['Aspect', '🦁 Lions', '🐅 Tigers', '🐆 Leopards', '🐾 Cheetahs'],
    },
    likesCount: 7,
    dummyTimeAgo: '8 hours ago',
  },

  {
    username: 'vgshenoy',
    data: {
      type: 'quadrants',
      title: 'Curry Variations by Spice Level and Creaminess',
      chartId: 'curry_2x2',
      quadrants: [{ label: 'Mild & Less Creamy', xCategory: 'Less Creamy', yCategory: 'Mild', datapoints: [{ label: '🍛 Japanese Curry 🇯🇵', wikiLink: 'https://en.wikipedia.org/wiki/Japanese_curry' }, { label: '🍲 Massaman Curry 🇹🇭', wikiLink: 'https://en.wikipedia.org/wiki/Massaman_curry' }, { label: '🥘 Burmese Curry 🇲🇲', wikiLink: 'https://en.wikipedia.org/wiki/Burmese_cuisine' }] }, { label: 'Spicy & Less Creamy', xCategory: 'Less Creamy', yCategory: 'Spicy', datapoints: [{ label: '🌶️ Vindaloo 🇮🇳', wikiLink: 'https://en.wikipedia.org/wiki/Vindaloo' }, { label: '🔥 Madras Curry 🇮🇳', wikiLink: 'https://en.wikipedia.org/wiki/Madras_curry' }, { label: '🌿 Goan Curry 🇮🇳', wikiLink: 'https://en.wikipedia.org/wiki/Goan_cuisine' }] }, { label: 'Mild & Creamy', xCategory: 'Creamy', yCategory: 'Mild', datapoints: [{ label: '🥥 Korma 🇮🇳', wikiLink: 'https://en.wikipedia.org/wiki/Korma' }, { label: '🍗 Butter Chicken 🇮🇳', wikiLink: 'https://en.wikipedia.org/wiki/Butter_chicken' }, { label: '🍲 Pasanda 🇮🇳', wikiLink: 'https://en.wikipedia.org/wiki/Pasanda' }] }, { label: 'Spicy & Creamy', xCategory: 'Creamy', yCategory: 'Spicy', datapoints: [{ label: '🌶️ Thai Red Curry 🇹🇭', wikiLink: 'https://en.wikipedia.org/wiki/Thai_curry' }, { label: '🍤 Prawn Malai Curry 🇮🇳', wikiLink: 'https://en.wikipedia.org/wiki/Chingri_malai_curry' }, { label: '🌶️ Panang Curry 🇹🇭', wikiLink: 'https://en.wikipedia.org/wiki/Panang_curry' }] }],
      xDimension: { label: 'Creaminess', categories: ['Less Creamy', 'Creamy'] },
      yDimension: { label: 'Spice Level', categories: ['Mild', 'Spicy'] },
    },
    likesCount: 19,
    dummyTimeAgo: '2 hours ago',
  },

  {
    username: 'bossmang',
    data: {
      title: '🌙 Navigating Baby\'s Sleep Regression: A Strategic Approach',
      chartId: 'sleep-regression-strategy',
      markup: 'flowchart TD\n    id1["👶 Baby Experiencing Sleep Disruption"] --> id2["🕰️ Assess Current Sleep Routine"]\n    \n    id2 --> id3["🔍 Identify Specific Disruption Patterns"]\n    id3 -->|"Frequent Night Wakings"| id4["🤗 Comfort Without Full Stimulation"]\n    id3 -->|"Short Naps"| id5["⏰ Adjust Nap Schedule"]\n    id3 -->|"Difficulty Falling Asleep"| id6["🌿 Create Calming Pre-Sleep Environment"]\n    \n    id4 --> id7{"🤔 Intervention Level"}\n    id7 -->|"Minimal Touch"| id8["🤫 Brief Reassurance, No Picking Up"]\n    id7 -->|"More Comfort Needed"| id9["🫂 Gentle Holding, Minimal Interaction"]\n    \n    id5 --> id10["📊 Track Sleep Windows"]\n    id10 --> id11["🌞 Align Naps with Developmental Cues"]\n    id11 --> id12["🛏️ Consistent Nap Location"]\n    \n    id6 --> id13["🕯️ Soft Lighting"]\n    id6 --> id14["🎵 White Noise"]\n    id6 --> id15["🧸 Comfort Object"]\n    \n    id8 & id9 & id12 & id13 & id14 & id15 --> id16["🔄 Consistent Approach for 1-2 Weeks"]\n    \n    id16 --> id17{"📈 Improvement Observed?"}\n    id17 -->|"Yes"| id18["🎉 Maintain New Routine"]\n    id17 -->|"No"| id19["👨‍⚕️ Consult Pediatric Sleep Specialist"]\n    \n    id18 --> id20["🏁 Gradual Return to Stable Sleep Patterns"]',
      type: 'mermaid',
    },
    likesCount: 24,
    dummyTimeAgo: '1 day ago',
  },
]

const demoCharts = charts.map(c => ({
  ...c,
  isDemo: true,
}))
</script>

<template>
  <div>
    <UContainer class="my-20 space-y-20">
      <div class="max-w-sm mx-auto prose prose-sm md:prose-base dark:prose-invert">
        <h1 class="!leading-[3rem]">
          <!-- <u>Your</u> <span class="text-primary-500">path</span> to knowledge,<br>
          in <span class="text-purple-500">charts</span> -->
          <span class="text-purple-500">Charts</span> at the speed of <span class="text-primary-500">thought</span>
          <!-- <span class="text-purple-500">Chart</span> out <br> the <span class="text-primary-500">world</span> -->
        </h1>

        <p>
          chartr.ai makes it dead easy to <u>capture</u> and <u>share</u> knowledge in charts.
        </p>

        <p>
          You chat, we chart.
        </p>

        <!-- <p>
          Chat naturally, get instant visuals. No design skills required
        </p> -->

        <div class="not-prose my-8 flex gap-4">
          <UButton
            to="/login"
            color="primary"
            size="lg"
            icon="i-carbon-chart-multitype"
          >
            Try for free
          </UButton>
        </div>

        <!-- <p>
          All it takes is a simple idea.
        </p> -->
      </div>
    </UContainer>

    <ChartBoard
      :charts="demoCharts"
      with-reaction-buttons
    />

    <ChartrAiFooter />
  </div>
</template>
