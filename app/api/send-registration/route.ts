import { NextResponse } from 'next/server'
export const runtime = 'nodejs'

import puppeteer from 'puppeteer'
import nodemailer from 'nodemailer'
import { generateRegistrationHtml } from '@/lib/generate-pdf-html'

// Generate PDF buffer from HTML using Puppeteer
async function generatePdfBuffer(data: any): Promise<Buffer> {
  // Generate HTML directly
  const html = await generateRegistrationHtml(data)

  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    
    // Set content and wait for page to load
    await page.setContent(html, { waitUntil: 'load' })
    
    // Wait a bit for fonts to render (using Promise-based delay)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Generate PDF with proper settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
      printBackground: true,
      preferCSSPageSize: false,
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    const pdfBuffer = await generatePdfBuffer(data)

    // Configure transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false,
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_APP_PASSWORD,
      },
    })

    const mailOptions = {
      from: process.env.MAIL_ID,
      to: process.env.ADMIN_MAIL_ID,
      subject: `New registration from ${data.name ?? 'Unknown'}`,
      text: `A new registration was submitted by ${data.name ?? 'Unknown'}. See attached PDF.`,
      attachments: [
        {
          filename: `registration-${Date.now()}.pdf`,
          content: pdfBuffer,
        },
      ],
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in send-registration:', err)
    return new NextResponse(JSON.stringify({ error: 'Failed to generate/send PDF' }), { status: 500 })
  }
}
