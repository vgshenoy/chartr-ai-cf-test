import { tool } from 'ai'
import { z } from 'zod'

export const createFetchUrlTool = event => tool({
  description: `
    Retrieves readable content from a user-submitted URL (blog post, article, etc.).

    IMPORTANT: the URL has to be user-submitted.
    
    Do not assume you know any info about the URL before running this tool.
    
    Returns the title, site name/author, and main content of the page.
  `,
  parameters: z.object({
    url: z.string().describe('The URL of the webpage to read'),
  }),
  execute: async ({ url }) => {
    try {
      // Add https:// if no protocol is specified
      const normalizedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`

      // Create Supadata API URL
      const scrapeUrl = new URL('https://api.supadata.ai/v1/web/scrape')
      scrapeUrl.searchParams.set('url', normalizedUrl)

      const apiKey = useRuntimeConfig(event).supadataApiKey
      const response = await $fetch(scrapeUrl, {
        headers: {
          'X-Api-Key': apiKey,
        },
      })

      const domain = new URL(normalizedUrl).hostname

      // Get best image: prefer OG image from Supadata, fallback to first image URL
      const image = response.ogUrl || response.urls?.find(url =>
        url.match(/\.(jpg|jpeg|png|gif|webp|avif)/i)
        && !url.includes('favicon')
        && !url.includes('logo'),
      ) || ''

      return {
        title: response.name || '',
        siteName: domain.replace(/^www\./, ''),
        content: response.content || '',
        description: response.description || '',
        urls: response.urls || [],
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        image,
        // Additional Supadata fields that might be useful
        countCharacters: response.countCharacters,
        ogUrl: response.ogUrl,
      }
    }
    catch (error) {
      console.error('Error fetching URL:', error.message)
      return {
        error: 'Failed to fetch webpage content. Please try again.',
        details: error instanceof Error ? error.message : String(error),
      }
    }
  },
})
