var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
import rss from '@astrojs/rss'
import { site } from '@/config.json'
import { getSortedPosts } from '@/utils/content'
export function GET(context) {
  return __awaiter(this, void 0, void 0, function* () {
    const sortedPosts = yield getSortedPosts()
    return rss({
      title: site.title,
      description: 'feedId:131706628041875456+userId:131666017602071552',
      site: context.site,
      items: sortedPosts.map((post) => ({
        link: `/posts/${post.slug}`,
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.summary,
      })),
      customData: `<language>${site.lang}</language>`,
    })
  })
}
//# sourceMappingURL=rss.xml.js.map
