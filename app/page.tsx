import { UTMGenerator } from "@/components/utm-generator"
import Link from "next/link"
export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 bg-background min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">UTM Parameter Generator</h1>
      <h2 className="text-xl mb-6 text-center">View SOP Doc <Link className="underline hover:text-blue-900" href={"https://docs.google.com/document/d/1KfcCkleQ8ZgvgeWuQoub3SGdngZ6trKu5cUKTYqmi8M/edit?usp=sharing"}>Here</Link></h2>
      <div className="max-w-3xl mx-auto">
        <UTMGenerator />
      </div>
    </main>
  )
}
