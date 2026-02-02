import { NextResponse } from 'next/server'
import { generateRegistrationHtml } from '@/lib/generate-pdf-html'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const html = await generateRegistrationHtml(data)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (err) {
    console.error('Error generating HTML:', err)
    return new NextResponse(JSON.stringify({ error: 'Failed to generate HTML' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
