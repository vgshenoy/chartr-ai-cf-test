import { z } from 'zod'

export const mermaidSchema = z.object({
  code: z.string().describe(`
    mermaid_<chart_type> Eg. mermaid_flowchart, mermaid_stateDiagram-v2
  `),
  markup: z.string().describe(`
    The mermaidJS markup/code for the specified chart type.
    
    VERY IMPORTANT: Escape all special characters in the markup. Eg. newline with double backslash and n (\\n), etc. 
    Do this for all newlines, both within a node and between nodes.
    
    Examples: 
    flowchart LR\\n    id1[\\\"text (with brackets)\\\"] --> id2[\\\"text (with brackets)\\\"]
    flowchart LR\\n id1[\\\"A node description can span \\n multiple lines\\\"] \\n id2[\\\"Stop\\\"]

    
    For lists in the mermaid code, use bullet points (•) instead of hyphens (-). 
    This is only for mermaid code, for normal text output you can use hyphens that will be rendered in markdown.
  `),
})

const generalInstructions = `
  Generate valid mermaidJS markup as per the chart type and instructions provided.

  <formatting>
    Be careful not to add extra spaces, these can break the mermaid code.

    EXTREMELY IMPORTANT: Double escape special characters in the markup, especially newlines and double quotes.
    ANOTHER REMINDER: Remember the double escaping for newlines inside the mermaid markup code. You miss this often, so take extra care.
    
    Example of mermaid markup that you should output in JSON:
    {
      "code": "mermaid_flowchart",
      "markup": "flowchart TD\\n    id1[\\\"text (with brackets)\\\"] --> id2[\\\"text (with brackets)\\\"]"
    }
    The remaining instructions will contain mermaid examples written normally for simplicity. 
    But when you output, please DOUBLE ESCAPE special characters like above.

    Use double quotes, NOT single quotes, for strings in the markup.
  </formatting

  IMPORTANT: When listing out the available charts, do not mention MermaidJS. 
  Just list the Mermaid charts (flowchart, stateDiagram-v2 etc) at the first level of charts along with timeline and 2x2. 
  MermaidJS is just one of the tools we use to render the charts.

  IMPORTANT: Do NOT include title in the markup.

  Make the chart as readable and beautiful as possible. 
  
  IMPORTANT: A linear flow is boring. Use branches and loops wherever applicable and insightful to keep the chart interesting.
  
  Take care not to put major items in bullet points where they could be in branches for better readability.

  Use emoji in the text of all nodes, links etc in all charts.
  
  DO NOT use underscores and camelCase for multi-word strings. Instead, define strings with spaces in accordance with the chart type syntax.

  Use colors and styles in a light touch, logical and readable manner. Define styles at the end using ids, always.

  The UI will render the charts as they stream in, so define the connections as early as possible.

  For text longer than 3 words inside a node, move them to multiple lines.
`

const chartTypes = [
  'stateDiagram-v2',
  'flowchart',
  // 'pie',
  'mindmap',
  'sequenceDiagram',
]

const chartTypeInstructions = {
  'stateDiagram-v2': `
    For state diagrams:
    - show loops wherever applicable and insightful
    - define the relationships first, then the strings
    - for multi-word strings, put the state string definitions (Eg. 'state "Youth Academy" as Youth Academy') at the end.
  `,
  'flowchart': `
    For flowcharts:
    - Use branches to show relationships, that things can be done in parallel etc. Eg. for recipes, you can show that chopping onions and tomatoes can be done in parallel, but chopping garlic has to be done before stir frying onions.
    - Use loops wherever applicable and insightful
    - You can use multiple lines in a node to bring out more details and make it more interesting
    - For multi-word strings, when specifying a node for the first time, use brackets to specify how to show multi-word strings. Eg. TechnicalLead[Technical Lead]
    - Try to use LR or TD depending on what is more readable. Check if the chart is more like a flow (more linear) or a tree (more branching). If it is more linear, use TD. Else use LR. By default, use LR.
    - Try to use different node shapes Eg. id1[(Database)], id1(["text (with brackets)"])
    - DO NOT put 'state' in flowcharts, it is invalid syntax.
    - If two nodes can be combined into one, then you may do so to keep the chart clean and simple.
    - Avoid a redundant top node if everything flows from there or its set up in the title of the chart already
    - Use subgraphs to group nodes into logical groups. Note that subgraphs DO NOT have directions LR and TD. Use colors for subgraphs.
    - make sure all the nodes/subgraphs are connected to the main chart
    - Ensure no spaces at the end of the subgraphs.
    - use ids for nodes and subgraphs - so for eg. id1[Some label], id2["Some label (some additional info)"], Eg. TechnicalLead[Technical Lead (Some additional info)], subgraph WorkflowA["Primary Workflow"]
  `,
  'pie': `
    For pie charts:
    - Use simple labels and numerical values
    - Parts should add up to 100%
  `,
  'mindmap': `
    For mindmaps:
    - Use a central topic and branch out with main ideas and sub-topics
    - Include details and key information in parentheses
    - Do not make mindmaps too big, stop at 2 levels i.e. central concept and then 2 levels of related concepts.
    - Use rounded nodes
    - Avoid using special characters like greater than, ampersand etc, instead spell it out
  `,
  'sequenceDiagram': `
    For sequence diagrams:
    - For multi-word strings, no need for quotes, just print them as multi-word strings.
  `,
}

const chartExamples = {
  'stateDiagram-v2': `
    stateDiagram-v2
      Sunlight --> Chlorophyll : ☀️ Absorbed by
      Chlorophyll --> Water : 🌿 Splits
      Water --> Oxygen : 💨 Releases
      Water --> Hydrogen : 🧪 Produces
      CarbonDioxide --> Glucose : 🍬 Converted into
      Hydrogen --> Glucose : 🔗 Combines with
      state "☀️ Sunlight" as Sunlight
      state "🌿 Chlorophyll" as Chlorophyll
      state "💧 Water" as Water
      state "🧬 Oxygen" as Oxygen
      state "⚛️ Hydrogen" as Hydrogen
      state "🌫️ Carbon Dioxide" as CarbonDioxide
      state "🍯 Glucose" as Glucose
  `,
  'flowchart': `
    flowchart LR
      Start["🚀 Start Process"] --> MainEntity["🌟 Main Entity [Core]"]
      
      MainEntity -->|"Path A"| ProcessA["🔧 Process A
      Main workflow"]
      MainEntity -->|"Path B"| ProcessB["🔨 Process B
      Alternative workflow"]
      MainEntity -->|"Path C"| ProcessC["💎 Special Process"]

      ProcessA --> Decision{"🤔 Decision Node with points
      • Option One
      • Option Two
      • Option Three"}

      subgraph WorkflowA["Primary Workflow"]
        ProcessA
        Decision -->|"Yes"| SubA1["⚠️ Critical Task"]
        Decision -->|"No"| SubA2["📎 Optional Task"]
      end

      subgraph WorkflowB["Secondary Workflow"]
        ProcessB --> SubB1["📊 Standard Task"]
        ProcessC --> SubB2["🔄 Circular Task
        with multiple lines"]
      end

      SubA1 & SubA2 & SubB1 --> Results["🔄 Combine Results"]
      SubB2 --> Results
      Results --> End["🏁 End Process"]

      style WorkflowA fill:#e3f2fd,stroke:#1565c0
      style WorkflowB fill:#fff3e0,stroke:#ef6c00
  `,
  'pie': `
    pie
      "🦁 Gryffindor" : 30
      "🦡 Hufflepuff" : 25
      "🦅 Ravenclaw" : 20
      "🐍 Slytherin" : 25
  `,
  'mindmap': `
    mindmap
      root(("🌍 Central Topic (Main)"))
        id1["🌟 Main Branch One"]
          id2["🔑 Sub-Topic A (Important)"]
            id3["📌 Detail Point 1"]
            id4["💡 Detail Point 2 (Key Info)"]
          id5["📊 Sub-Topic B"]
            id6["📝 Detail Point 3 (See Notes)"]
            id7["🔍 Detail Point 4"]
        id8["⚠️ Main Branch Two (Critical)"]
          id9["🔧 Sub-Topic C"]
            id10["📊 Detail Point 5"]
            id11["🚨 Detail Point 6 (Urgent)"]
          id12["🔎 Sub-Topic D (Review)"]
            id13["📈 Detail Point 7"]
            id14["📉 Detail Point 8"]
        id15["🌈 Main Branch Three"]
          id16["🔖 Sub-Topic E (Optional)"]
            id17["🔮 Detail Point 9 (Future)"]
            id18["📌 Detail Point 10"]
          id19["📚 Sub-Topic F"]
            id20["📊 Detail Point 11"]
            id21["📎 Detail Point 12 (Appendix)"]
  `,
  'sequenceDiagram': `
    sequenceDiagram
      participant Client as 👤 Client
      participant Auth Server as 🔐 Auth Server
      participant User as 👤 User
      Client->>Auth Server: 🔐 Authorization Request (with Code Challenge)
      Auth Server->>User: 🔑 User Authentication
      User-->>Auth Server: ✅ User Grants Access
      Auth Server-->>Client: 🎟️ Authorization Code
      Client->>Auth Server: 🔓 Token Request (with Code Verifier)
      Auth Server->>Auth Server: 🔍 Verify Code Challenge
      Auth Server-->>Client: 🔑 Access Token
  `,
}

export const mermaidChartPrompt = `
  ${generalInstructions}

  VERY IMPORTANT: You can ONLY use the following mermaid chart types:
  ${chartTypes.map(type => `  - ${type}`).join('\n')}

  If the user asks for a mermaid chart with a type that is not in the list, you MUST suggest an alternative chart type.

  Do NOT use any other mermaid chart types.

  ${chartTypes.map(type => chartTypeInstructions[type]).join('\n\n')}

  <examples>
    ${chartTypes.map(type => `
      ${chartExamples[type]}
    `).join('\n')}
  </examples>
`

export const mermaidChartTypes = chartTypes.map(type => `mermaid_${type}`)
