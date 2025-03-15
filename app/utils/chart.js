import { lowerFirst } from 'scule'

// TODO: use as source of truth for active chart types (can add an isActive key)?

export const chartTypes = [
  {
    id: 'tableChart',
    altIds: ['table'],
    label: 'Table',
    icon: 'i-carbon-data-table',
  },
  {
    id: 'timeline',
    label: 'Timeline',
    icon: 'i-carbon-calendar-heat-map',
  },
  {
    id: 'prosCons',
    label: 'Pros & Cons',
    icon: 'i-carbon-scales-tipped',
  },
  {
    id: 'quadrants',
    label: '2x2',
    icon: 'i-carbon-scatter-matrix',
  },
  {
    id: 'mermaid_flowchart',
    altIds: ['flowchart'],
    label: 'Flowchart',
    icon: 'i-carbon-flow',
    allowPanZoom: true,
  },
  {
    id: 'mermaid_stateDiagram-v2',
    altIds: ['stateDiagram'],
    label: 'State Diagram',
    icon: 'i-carbon-ibm-engineering-systems-design-rhapsody',
    allowPanZoom: true,
  },
  {
    id: 'mermaid_mindmap',
    altIds: ['mindmap'],
    label: 'Mind Map',
    icon: 'i-carbon-ibm-cloud-event-notification',
    allowPanZoom: true,
  },
  // {
  //   id: 'mermaid_pie',
  //   label: 'Pie Chart',
  //   icon: 'i-carbon-chart-pie',
  // },
  {
    id: 'mermaid_sequenceDiagram',
    altIds: ['sequenceDiagram'],
    label: 'Sequence Diagram',
    icon: 'i-carbon-arrows-horizontal',
    allowPanZoom: true,
  },
]

export function getChartType(chartData) {
  // chartData can be streaming in, so need to handle all cases gracefully
  if (!chartData) {
    return null
  }

  // info needed can be in
  // type (old format) Eg. table, timeline, mermaid
  // code (new format) Eg. mermaid_v1, timeline_v2
  // AND in case of mermaid it can be in markup
  const { type, code, ...args } = chartData

  const chartTypeId = type ? lowerFirst(type) : code ? code.split('_')[0] : null // code: mermaid_v1 -> mermaid, type: Mermaid -> mermaid

  const typeId = chartTypeId === 'mermaid' ? `mermaid_${args.markup?.split(/[\\\s]/)[0]?.trim()}` : chartTypeId

  const chartType = chartTypes.find(t => t.id === typeId || (t.altIds && t.altIds.includes(typeId)))

  return chartType
}
