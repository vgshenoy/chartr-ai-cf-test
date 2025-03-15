import { tool } from 'ai'
import { z } from 'zod'

export const createFetchYoutubeVideoTool = event => tool({
  description: `
    Retrieves metadata and transcript of a user-submitted YouTube video URL.

    IMPORTANT: the videoId or the YouTube URL has to be user-submitted.

    Do not assume you know any info about the video before running this tool.
    
    Returns structured data with title, metadata, and transcript.
    
    Supports various YouTube URL formats including standard watch URLs, shorts, embeds, and youtu.be links.
    
    Does not support live videos, user profiles, playlists, or private videos.
  `,
  parameters: z.object({
    url: z.string().describe('The URL of the YouTube video'),
  }),
  execute: async ({ url }) => {
    try {
      // Add https:// if no protocol is specified
      const normalizedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`

      // Parse video ID from various URL formats
      let videoId = null
      const urlObj = new URL(normalizedUrl)
      console.log('[fetchYoutubeVideo] Input URL:', normalizedUrl)

      if (urlObj.hostname === 'youtu.be') {
        videoId = urlObj.pathname.slice(1)
      }
      else if (urlObj.pathname.includes('/shorts/')) {
        videoId = urlObj.pathname.split('/shorts/')[1]
      }
      else if (urlObj.pathname.includes('/embed/')) {
        videoId = urlObj.pathname.split('/embed/')[1]
      }
      else if (urlObj.pathname.includes('/v/')) {
        videoId = urlObj.pathname.split('/v/')[1]
      }
      else {
        videoId = urlObj.searchParams.get('v')
      }

      // Clean up video ID by removing any extra path segments or query parameters
      videoId = videoId?.split('/')[0]?.split('?')[0]
      console.log('[fetchYoutubeVideo] Extracted videoId:', videoId)

      if (!videoId) {
        throw new Error('Invalid YouTube URL format')
      }

      // Fetch video metadata from YouTube Data API
      const youtubeApiKey = useRuntimeConfig(event).youtubeApiKey
      const videoData = await $fetch(`https://www.googleapis.com/youtube/v3/videos`, {
        params: {
          part: 'snippet,statistics,contentDetails',
          id: videoId,
          key: youtubeApiKey,
        },
      })

      if (!videoData.items?.[0]) {
        throw new Error('Video not found or is private')
      }

      const video = videoData.items[0]
      const relevantMetadata = {
        title: video.snippet.title,
        description: video.snippet.description,
        duration: video.contentDetails.duration, // This will be in ISO 8601 format
        views: video.statistics.viewCount,
        channelName: video.snippet.channelTitle,
      }
      console.log('[fetchYoutubeVideo] Processed relevant metadata:', relevantMetadata)

      // Get transcript from Supadata.ai
      const transcriptUrl = new URL('https://api.supadata.ai/v1/youtube/transcript')
      transcriptUrl.searchParams.set('url', `https://www.youtube.com/watch?v=${videoId}`)
      transcriptUrl.searchParams.set('text', 'true')

      try {
        const apiKey = useRuntimeConfig(event).supadataApiKey
        console.log('[fetchYoutubeVideo] Making transcript request')
        console.log('[fetchYoutubeVideo] Transcript URL:', transcriptUrl.toString())
        console.log('[fetchYoutubeVideo] API Key:', apiKey)

        const response = await $fetch(transcriptUrl, {
          headers: {
            'X-Api-Key': apiKey,
          },
        })

        const { content } = response
        return {
          ...relevantMetadata,
          transcript: content,
        }
      }
      catch (error) {
        console.error('[fetchYoutubeVideo] Transcript API error:', error.message)
        return {
          error: 'Failed to fetch video transcript. Please try again.',
          details: error.message,
        }
      }
    }
    catch (error) {
      console.error('[fetchYoutubeVideo] Main error:', error.message)
      return {
        error: 'Failed to process YouTube video.',
        details: error instanceof Error ? error.message : String(error),
      }
    }
  },
})
