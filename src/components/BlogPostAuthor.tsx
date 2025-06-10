type Author = {
    name: string
}

const AUTHORS: {[key: string]: Author} = {
    august: {
        name: "August Lilleaas"
    }
}

export async function BlogPostAuthor(props: {author: string}) {
    const author = AUTHORS[props.author]

    if (!author) {
        return null
    }

    return <div>Av {author.name}</div>
}
