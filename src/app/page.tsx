import {getBlogPostList} from "@/homeless/blog-post-utils"
import {remark} from "remark"
import html from "remark-html"
import Link from "next/link"
import {DateTimeFormatter} from "@js-joda/core"
import {Metadata, ResolvingMetadata} from "next"

export async function generateMetadata(
    props: object,
    parent: ResolvingMetadata
): Promise<Metadata> {
    return {
        title: "SnowBee Fagblogg"
    }
}

export default async function Home() {
    const blogPostItems = await getBlogPostList(process.env.NODE_ENV === "production")

    return (
        <div>
            <div
                className={
                    "sb_typography border border-sb-fagblogg-panel bg-sb-fagblogg-panel/50 rounded-xl p-4"
                }
            >
                <p>
                    Velkommen til SnowBee sin tekniske fagblogg! Her kan du lese om hva vi driver
                    med, og hvordan vi driver med det.
                </p>

                <p>
                    Og en vakker dag kan du sikker lese litt både her og på{" "}
                    <a href="https://www.snowbee.no">snowbee.no</a> om hva i alle dager SnowBee er!
                </p>
            </div>

            <div className={"h-8"}></div>

            <div className={"flex flex-col gap-8"}>
                {await Promise.all(
                    blogPostItems.map(async blogPostItem => {
                        const description = await remark()
                            .use(html)
                            .process(blogPostItem.headers["description"] ?? "")

                        return (
                            <div
                                key={blogPostItem.slug}
                                data-is-published={blogPostItem.headers.published !== null}
                                className={"data-[is-published=false]:opacity-50"}
                            >
                                <h2 className={"text-3xl underline"}>
                                    <Link href={`/${blogPostItem.slug}`}>
                                        {blogPostItem.headers["title"]}
                                    </Link>
                                </h2>
                                <div className={"h-2"}></div>
                                <div
                                    className={"sb_typography"}
                                    dangerouslySetInnerHTML={{__html: description.toString()}}
                                ></div>
                                <div className={"h-2"}></div>
                                <div className={"text-sm"}>
                                    {blogPostItem.headers["published"]?.format(
                                        DateTimeFormatter.ofPattern("dd.MM, yyyy")
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
