export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-blue-600">Test Page</h1>
      <p className="text-lg mt-4">If you can see this page, the basic setup is working!</p>
      <div className="mt-8 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Application Features</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>✅ Next.js 14 with TypeScript</li>
          <li>✅ Tailwind CSS styling</li>
          <li>✅ React components</li>
          <li>✅ API routes structure</li>
          <li>🚧 Real-time collaboration (LiveBlocks)</li>
          <li>🚧 Supabase integration</li>
        </ul>
      </div>
    </div>
  )
}
