import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const maxDuration = 60

import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

// Generate PDF buffer using pdf-lib (no headless Chrome needed – works on Vercel)
async function generatePdfBuffer(data: any): Promise<Buffer> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib')

  const pdfDoc = await PDFDocument.create()
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const addPageWithTitle = (title: string) => {
    const page = pdfDoc.addPage()
    const { width, height } = page.getSize()

    page.drawText(title, {
      x: 50,
      y: height - 60,
      size: 18,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    })

    return page
  }

  const drawField = (
    page: any,
    y: number,
    label: string,
    value?: string,
    options: { width?: number } = {},
  ) => {
    const v = value && value.trim().length > 0 ? value : 'Not provided'
    const { width } = page.getSize()
    const textWidth = options.width ?? width - 100

    page.drawText(label + ':', {
      x: 50,
      y,
      size: 11,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    })

    page.drawText(v, {
      x: 50,
      y: y - 14,
      size: 11,
      font: helveticaFont,
      color: rgb(0.1, 0.1, 0.1),
      maxWidth: textWidth,
      lineHeight: 13,
    })
  }

  // --- Page 1: Header & Personal Details ---
  const page1 = addPageWithTitle('Platinum Boxing Club Registration')
  const { width: page1Width, height: page1Height } = page1.getSize()

  // Subtitle
  page1.drawText('Feed the Faith, Starve the Doubt', {
    x: 50,
    y: page1Height - 80,
    size: 10,
    font: helveticaFont,
    color: rgb(0.2, 0.2, 0.2),
  })

  // Logo (optional)
  try {
    const logoPath = path.join(process.cwd(), 'public', 'platinum-boxing-logo.jpeg')
    if (fs.existsSync(logoPath)) {
      const logoBytes = fs.readFileSync(logoPath)
      const logoImage = await pdfDoc.embedJpg(logoBytes)
      const logoDims = logoImage.scale(0.25)
      page1.drawImage(logoImage, {
        x: page1Width - logoDims.width - 50,
        y: page1Height - logoDims.height - 40,
        width: logoDims.width,
        height: logoDims.height,
      })
    }
  } catch {
    // Ignore logo errors
  }

  let y = page1Height - 120

  page1.drawText('Personal Details', {
    x: 50,
    y,
    size: 14,
    font: helveticaBoldFont,
  })
  y -= 24

  const fields1 = [
    ['Name', data.name],
    ['Email', data.email],
    ['Gender', data.gender],
    ['Date of Birth', data.dob],
    ['Occupation', data.occupation],
    ['Date', data.date],
    ['Phone', data.phone],
    ['Emergency Contact', data.emergencyContact],
    ['Relationship', data.relationship],
    ['Emergency Contact Phone', data.emergencyPhone],
    ['Address', data.address],
  ] as const

  for (const [label, value] of fields1) {
    drawField(page1, y, label, value)
    y -= 40
    if (y < 80) break
  }

  // --- Page 2: Health Declaration ---
  const page2 = addPageWithTitle('Health Declaration')
  const { height: page2Height } = page2.getSize()
  y = page2Height - 90

  const healthDeclarationText =
    'I, the above Applicant, hereby declare that I am fit and in excellent health condition to participate in ' +
    'boxing, kickboxing and/or boxercise activities and that I am not on any medication or taking any form of ' +
    'drug. Should I have to receive treatment at a hospital or medical institution due to any injury incurred ' +
    'while participating in any activities with Platinum Boxing Club I will be responsible to pay my own expenses.'

  page2.drawText(healthDeclarationText, {
    x: 50,
    y,
    size: 10,
    font: helveticaFont,
    color: rgb(0.1, 0.1, 0.1),
    maxWidth: 500,
    lineHeight: 13,
  })

  y -= 80

  drawField(
    page2,
    y,
    'Health conditions (past or current)',
    data.healthConditions,
    { width: 500 },
  )
  y -= 70

  drawField(
    page2,
    y,
    'Previous or current injuries',
    data.previousInjuries,
    { width: 500 },
  )
  y -= 70

  drawField(
    page2,
    y,
    'Current prescribed medications',
    data.currentMedications,
    { width: 500 },
  )
  y -= 70

  drawField(page2, y, "Doctor/GP's Name", data.doctorName)
  y -= 40
  drawField(page2, y, 'Doctor contact details', data.doctorContact)

  // --- Page 3: Consents ---
  const page3 = addPageWithTitle('Platinum Boxing Club - Terms and Conditions (Consents)')
  const { height: page3Height } = page3.getSize()
  y = page3Height - 90

  const consents = [
    ['Photos and video footage consent', data.photosConsent],
    ['Children consent', data.childrenConsent],
    ['Participation fees consent', data.participationFees],
    ['Gloves/hand wraps/equipment consent', data.equipmentConsent],
  ] as const

  for (const [label, value] of consents) {
    drawField(page3, y, label, value)
    y -= 50
  }

  // --- Page 4: Release of Liability & Signatures ---
  const page4 = addPageWithTitle('Release of Liability & Signatures')
  const { height: page4Height } = page4.getSize()
  y = page4Height - 90

  const releaseText =
    'In consideration of the acceptance of my application as a participant to the Platinum Boxing Club ' +
    'training, events or classes I hereby agree to assume all risks attendant upon myself while participating ' +
    'with Platinum Boxing Club. I hereby waive, release and discharge any and all claims for death, personal ' +
    'injury or property damage which I may have, or which hereafter accrue to me as a result of my participation ' +
    'with the Platinum Boxing Club.'

  page4.drawText(releaseText, {
    x: 50,
    y,
    size: 10,
    font: helveticaFont,
    color: rgb(0.1, 0.1, 0.1),
    maxWidth: 500,
    lineHeight: 13,
  })

  y -= 90

  // Participant section
  page4.drawText("Participant's Details", {
    x: 50,
    y,
    size: 12,
    font: helveticaBoldFont,
  })
  y -= 24

  drawField(page4, y, "Participant's Name", data.participantName)
  y -= 40

  // Participant signature (as image if data URL)
  page4.drawText("Participant's Signature:", {
    x: 50,
    y,
    size: 11,
    font: helveticaBoldFont,
  })
  y -= 20

  try {
    const sig = data.participantSignature || ''
    if (sig.startsWith('data:image')) {
      const base64 = sig.split(',')[1]
      if (base64) {
        const imgBuffer = Buffer.from(base64, 'base64')
        const image = await pdfDoc.embedPng(imgBuffer)
        const dims = image.scale(0.5)
        page4.drawImage(image, {
          x: 50,
          y: y - dims.height + 20,
          width: dims.width,
          height: dims.height,
        })
      }
    } else {
      page4.drawText('No signature provided', {
        x: 50,
        y,
        size: 10,
        font: helveticaFont,
        color: rgb(0.4, 0.4, 0.4),
      })
    }
  } catch {
    page4.drawText('Signature could not be rendered', {
      x: 50,
      y,
      size: 10,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    })
  }

  y -= 80
  drawField(page4, y, "Participant's Signature Date", data.participantSignatureDate)

  y -= 60
  page4.drawText("Parent/Guardian's Details (for minors)", {
    x: 50,
    y,
    size: 12,
    font: helveticaBoldFont,
  })
  y -= 24

  drawField(page4, y, "Parent/Guardian's Name", data.parentGuardianName)
  y -= 40

  page4.drawText("Parent/Guardian's Signature:", {
    x: 50,
    y,
    size: 11,
    font: helveticaBoldFont,
  })
  y -= 20

  try {
    const sig = data.parentGuardianSignature || ''
    if (sig.startsWith('data:image')) {
      const base64 = sig.split(',')[1]
      if (base64) {
        const imgBuffer = Buffer.from(base64, 'base64')
        const image = await pdfDoc.embedPng(imgBuffer)
        const dims = image.scale(0.5)
        page4.drawImage(image, {
          x: 50,
          y: y - dims.height + 20,
          width: dims.width,
          height: dims.height,
        })
      }
    } else {
      page4.drawText('No signature provided', {
        x: 50,
        y,
        size: 10,
        font: helveticaFont,
        color: rgb(0.4, 0.4, 0.4),
      })
    }
  } catch {
    page4.drawText('Signature could not be rendered', {
      x: 50,
      y,
      size: 10,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    })
  }

  y -= 80
  drawField(page4, y, "Parent/Guardian's Signature Date", data.parentGuardianSignatureDate)

  y -= 40
  drawField(page4, y, 'Agreed to all terms and conditions', data.agreeToTerms ? 'YES' : 'NO')

  y -= 50
  page4.drawText("Address: 2/18 O'Shea Drive, Nerang Qld 4211", {
    x: 50,
    y,
    size: 9,
    font: helveticaFont,
  })
  page4.drawText('Ph: 0420 397 152 | Email: platinumboxingclub@gmail.com', {
    x: 50,
    y: y - 14,
    size: 9,
    font: helveticaFont,
  })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
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
