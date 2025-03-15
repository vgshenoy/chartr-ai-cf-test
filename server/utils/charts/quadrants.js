import { z } from 'zod'

const categoriesSchema = z.array(z.string())
  .describe(`
    Each category string should be self-explanatory without needing the label for context. 
    Eg. for label "Energy Level", the categories should be "High Energy", "Low Energy", not just "High", "Low". 
    Avoid long category names. Ensure a space in between words.
    `)
  .length(2)

export const quadrantsSchema = z.object({
  code: z.literal('quadrants_v1'),
  yDimension: z.object({
    label: z.string(),
    categories: categoriesSchema,
  }),
  xDimension: z.object({
    label: z.string(),
    categories: categoriesSchema,
  }),
  quadrants: z.array(z.object({
    label: z.string(),
    xCategory: z.string(),
    yCategory: z.string(),
    datapoints: z.array(z.object({
      label: z.string().describe('Use emoji at the beginning of the label'),
      // moreInformation: z.string(),
      wikiLink: z.string().nullable(),
    })),
  })),
})

export const quadrantsPrompt = `
Quadrants and 2x2 can be used interchangeably.Prefer calling it 2x2 instead of quadrants.

IMPORTANT:Check that items/datapoints are on the same hierarchical level. Eg. if you are drawing a quadrant for "Food", then the datapoints should all be food items like "pizza", not mixed with food making methods like "grilling".
Try to have 3 datapoints per quadrant. If nothing qualifies to be in the quadrant, its okay to leave it blank.

Pick dimensions that are orthogonal to each other.
When outputting the categories under each dimension, have the 'low' category first, then the 'high' category.
Remember that the quadrant categories are drawn left to right and bottom to top. So the second category in each dimension would be the right and top quadrant.

If following up a 2x2 with another 2x2, try to have the same items but on different dimensions.

IMPORTANT: DO NOT pick generic data points like A, B, C, D or Item 1, Item 2, Item 3, Item 4. Be specific and insightful and draw from real-world examples. 
Eg.for category "quick pickling" don't give "quick pickled X".

`
