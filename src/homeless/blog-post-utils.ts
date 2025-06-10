import * as fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import {LocalDate} from "@js-joda/core"
import yaml from "js-yaml"
import {cache} from "react"

type BlogPostItem = {
    slug: string
    headers: {[key: string]: any} & BlogPostHeaders
    getBody: () => Promise<string>
}

type BlogPostHeaders = {
    title: string
    description: string | null
    published: LocalDate | null
}

export const getBlogPostList = async (isProduction: boolean): Promise<BlogPostItem[]> => {
    const dataPath = path.join(process.cwd(), "content", "blog_posts")

    return new Promise(resolve => {
        fs.readdir(dataPath, async (err, files) => {
            const res: BlogPostItem[] = []
            if (err) {
                resolve(res)
                return
            }

            for (const filePath of files) {
                const parsedPath = path.parse(filePath)
                if (parsedPath.ext === ".md") {
                    const blogPostItem = await createBlogPostItem(
                        parsedPath.name,
                        path.join(dataPath, filePath)
                    )
                    if (isProduction) {
                        if (blogPostItem.headers.published) {
                            res.push(blogPostItem)
                        }
                    } else {
                        res.push(blogPostItem)
                    }
                }
            }

            resolve(
                res.toSorted(
                    (a, b) =>
                        (b.headers.published?.toEpochDay() ?? -1) -
                        (a.headers.published?.toEpochDay() ?? -1)
                )
            )
        })
    })
}

export const getBlogPostFromSlug = cache(async (slug: string): Promise<BlogPostItem | null> => {
    const filePath = path.join(process.cwd(), "content", "blog_posts", `${slug}.md`)
    return new Promise(resolve => {
        fs.stat(filePath, async (err, stats) => {
            if (err) {
                resolve(null)
            }

            if (!stats.isFile()) {
                resolve(null)
            }

            const parsedPath = path.parse(filePath)

            resolve(await createBlogPostItem(parsedPath.name, filePath))
        })
    })
})

const safeLocalDate = (input: any): LocalDate | null => {
    console.log(input)
    if (typeof input !== "string") {
        return null
    }

    try {
        return LocalDate.parse(input)
    } catch (e) {
        return null
    }
}

// getBody() is async so it can be smart and lazy later. For now, it's dumb and eager.
const createBlogPostItem = async (slug: string, filePath: string): Promise<BlogPostItem> => {
    const {content, data} = matter(fs.readFileSync(filePath, "utf8"), {
        engines: {
            // Disables auto-parsing of `published` as an instance of Date
            yaml: s => yaml.load(s, {schema: yaml.JSON_SCHEMA}) as any
        }
    })

    return {
        slug: slug,
        getBody: () => Promise.resolve(content),
        headers: {
            ...data,
            title: data["title"] ?? "<NO TITLE>",
            published: safeLocalDate(data["published"]),
            description: data["description"] ?? ""
        }
    }
}
