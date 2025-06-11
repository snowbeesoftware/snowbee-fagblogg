import {Inter} from "next/font/google"
import "./globals.css"
import Link from "next/link"

const inter = Inter({subsets: ["latin"]})

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="no">
            <body className={`${inter.className} antialiased`}>
                <header className={"bg-slate-200"}>
                    <div className={"mx-auto max-w-3xl text-center py-4 px-2"}>
                        <Link href={"/"}>SnowBee Fagblogg</Link>
                    </div>
                </header>
                <div className={"h-8"}></div>
                <main className={"mx-auto max-w-3xl px-2"}>{children}</main>
                <footer className={"min-h-24"}></footer>
            </body>
        </html>
    )
}
