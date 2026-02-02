import { NextResponse } from 'next/server'
export const runtime = 'nodejs'

import PDFDocument from 'pdfkit'
import nodemailer from 'nodemailer'

// Simple helper to generate PDF buffer from submitted data
async function generatePdfBuffer(data: any): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const buffers: Uint8Array[] = []
  doc.on('data', (chunk) => buffers.push(chunk))

  doc.fontSize(18).text('Platinum Boxing Club Registration', { align: 'center' })
  doc.moveDown()

  doc.fontSize(12)
  const writeField = (label: string, value: any) => {
    doc.font('Helvetica-Bold').text(`${label}: `, { continued: true })
    doc.font('Helvetica').text(value ?? '')
  }

  // Personal details
  doc.moveDown()
  doc.fontSize(14).text('Personal Details')
  doc.moveDown(0.5)
  writeField('Name', data.name)
  writeField('Email', data.email)
  writeField('Gender', data.gender)
  writeField('Date of Birth', data.dob)
  writeField('Phone', data.phone)
  writeField('Address', data.address)

  doc.moveDown()
  doc.fontSize(14).text('Health Declaration')
  doc.moveDown(0.5)
  writeField('Health Conditions', data.healthConditions)
  writeField('Previous Injuries', data.previousInjuries)
  writeField('Current Medications', data.currentMedications)
  writeField('Doctor Name', data.doctorName)
  writeField('Doctor Contact', data.doctorContact)

  doc.addPage()
  doc.fontSize(14).text('Terms & Release')
  doc.moveDown(0.5)
  writeField('Photos Consent', data.photosConsent)
  writeField('Children Consent', data.childrenConsent)
  writeField('Participation Fees', data.participationFees)
  writeField('Equipment Consent', data.equipmentConsent)

  doc.moveDown()
  doc.fontSize(14).text('Release of Liability')
  doc.moveDown(0.5)

  writeField('Participant Name', data.participantName)

  // Signatures
  if (data.participantSignature) {
    try {
      const base64 = data.participantSignature.split(',')[1]
      const img = Buffer.from(base64, 'base64')
      doc.moveDown()
      doc.font('Helvetica-Bold').text('Participant Signature:')
      doc.image(img, { fit: [250, 100] })
    } catch (e) {
      // ignore image errors
    }
  }

  writeField('Participant Signature Date', data.participantSignatureDate)
  writeField('Parent/Guardian Name', data.parentGuardianName)

  if (data.parentGuardianSignature) {
    try {
      const base64 = data.parentGuardianSignature.split(',')[1]
      const img = Buffer.from(base64, 'base64')
      doc.moveDown()
      doc.font('Helvetica-Bold').text('Parent/Guardian Signature:')
      doc.image(img, { fit: [250, 100] })
    } catch (e) {
      // ignore image errors
    }
  }

  writeField('Parent/Guardian Signature Date', data.parentGuardianSignatureDate)

  doc.moveDown(2)
  doc.fontSize(10).text(`Form generated: ${new Date().toLocaleString()}`)

  doc.end()

  return new Promise<Buffer>((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(buffers as any))
    })
  })
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    const pdfBuffer = await generatePdfBuffer(data)

    // Configure transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.MAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_APP_PASSWORD,
      },
    })

    const mailOptions = {
      from: process.env.MAIL_ID,
      to: process.env.MAIL_ID, // send to admin; adjust as needed
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
