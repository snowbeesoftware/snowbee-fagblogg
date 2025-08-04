import {notFound} from "next/navigation"
import {getBlogPostFromSlug} from "@/homeless/blog-post-utils"
import {remark} from "remark"
import html from "remark-html"
import plainText from "remark-plain-text"
import {DateTimeFormatter} from "@js-joda/core"
import {BlogPostAuthor} from "@/components/BlogPostAuthor"
import {Metadata, ResolvingMetadata} from "next"
import remarkRehype from "remark-rehype"
import rehypeHighlight from "rehype-highlight"
import rehypeStringify from "rehype-stringify"

export async function generateMetadata(
    props: {params: Promise<{slug: string}>},
    parent: ResolvingMetadata
): Promise<Metadata> {
    const params = await props.params
    const blogPost = await getBlogPostFromSlug(params.slug)
    if (!blogPost) {
        notFound()
    }

    const description = await remark()
        .use(plainText)
        .process(blogPost.headers["description"] ?? "")

    return {
        title: `${blogPost.headers.title} | SnowBee Fagblogg`,
        openGraph: {
            type: "website",
            title: blogPost.headers.title,
            description: description.toString(),
            siteName: "SnowBee Fagblogg"
        }
    }
}

export default async function BlogPost(props: {params: Promise<{slug: string}>}) {
    const params = await props.params
    const blogPost = await getBlogPostFromSlug(params.slug)
    if (blogPost === null) {
        notFound()
    }

    const description = await remark()
        .use(html)
        .process(blogPost.headers["description"] ?? "")

    const body = await remark()
        .use(remarkRehype)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(await blogPost.getBody())

    return (
        <div>
            <h1 className={"text-5xl"}>{blogPost.headers["title"]}</h1>

            <div className={"h-2"}></div>

            <BlogPostAuthor author={blogPost.headers["author"]} />
            <div className={"text-sm"}>
                {blogPost.headers["published"]?.format(DateTimeFormatter.ofPattern("dd.MM, yyyy"))}
            </div>

            <div className={"h-8"}></div>

            <div
                className={"sb_typography"}
                dangerouslySetInnerHTML={{__html: `${description.toString()} ${body.toString()}`}}
            ></div>
        </div>
    )
}
