import type { APIContext } from 'astro'
import rss from '@astrojs/rss'
import { site } from '@/config.json'
import { getSortedPosts } from '@/utils/content'

export async function GET(context: APIContext) {
  const sortedPosts = await getSortedPosts()

  return rss({
    title: site.title,
    description: 'feedId:131706628041875456+userId:131666017602071552',
    site: context.site!,
    items: sortedPosts.map((post) => ({
      link: `/posts/${post.slug}`,
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary,
    })),
    customData: `<language>${site.lang}</language>`,
  })
}
