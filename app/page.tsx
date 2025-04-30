import { UTMGenerator } from "@/components/utm-generator"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 bg-background min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">UTM Parameter Generator</h1>
      <div className="max-w-3xl mx-auto">
        <UTMGenerator />
      </div>
    </main>
  )
}
