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
import { getCollection } from 'astro:content'
function getAllPosts() {
  return __awaiter(this, void 0, void 0, function* () {
    const allPosts = yield getCollection('posts', ({ data }) => {
      return import.meta.env.PROD ? data.draft !== true : true
    })
    return allPosts
  })
}
function getNewestPosts() {
  return __awaiter(this, void 0, void 0, function* () {
    const allPosts = yield getAllPosts()
    return allPosts.sort((a, b) => {
      return a.data.date.valueOf() - b.data.date.valueOf()
    })
  })
}
export function getOldestPosts() {
  return __awaiter(this, void 0, void 0, function* () {
    const allPosts = yield getAllPosts()
    return allPosts.sort((a, b) => {
      return b.data.date.valueOf() - a.data.date.valueOf()
    })
  })
}
export function getSortedPosts() {
  return __awaiter(this, void 0, void 0, function* () {
    const allPosts = yield getAllPosts()
    return allPosts.sort((a, b) => {
      if (a.data.sticky !== b.data.sticky) {
        return b.data.sticky - a.data.sticky
      } else {
        return b.data.date.valueOf() - a.data.date.valueOf()
      }
    })
  })
}
export function getAllPostsWordCount() {
  return __awaiter(this, void 0, void 0, function* () {
    const allPosts = yield getAllPosts()
    const promises = allPosts.map((post) => {
      return post.render()
    })
    const res = yield Promise.all(promises)
    const wordCount = res.reduce((count, cur) => {
      return count + cur.remarkPluginFrontmatter.words
    }, 0)
    return wordCount
  })
}
export function slugify(text) {
  return text.replace(/\./g, '').replace(/\s/g, '-').toLowerCase()
}
export function getAllCategories() {
  return __awaiter(this, void 0, void 0, function* () {
    const newestPosts = yield getNewestPosts()
    const allCategories = newestPosts.reduce((acc, cur) => {
      if (cur.data.category) {
        const slug = slugify(cur.data.category)
        const index = acc.findIndex((category) => category.slug === slug)
        if (index === -1) {
          acc.push({
            slug,
            name: cur.data.category,
            count: 1,
          })
        } else {
          acc[index].count += 1
        }
      }
      return acc
    }, [])
    return allCategories
  })
}
export function getAllTags() {
  return __awaiter(this, void 0, void 0, function* () {
    const newestPosts = yield getNewestPosts()
    const allTags = newestPosts.reduce((acc, cur) => {
      cur.data.tags.forEach((tag) => {
        const slug = slugify(tag)
        const index = acc.findIndex((tag) => tag.slug === slug)
        if (index === -1) {
          acc.push({
            slug,
            name: tag,
            count: 1,
          })
        } else {
          acc[index].count += 1
        }
      })
      return acc
    }, [])
    return allTags
  })
}
export function getHotTags() {
  return __awaiter(this, arguments, void 0, function* (len = 5) {
    const allTags = yield getAllTags()
    return allTags
      .sort((a, b) => {
        return b.count - a.count
      })
      .slice(0, len)
  })
}
//# sourceMappingURL=content.js.map
