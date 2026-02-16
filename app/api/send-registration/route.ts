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
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontMedium = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // --- Theme (roughly matches your website look) ---
  const theme = {
    page: {
      marginX: 40,
      marginTop: 36,
      marginBottom: 40,
    },
    colors: {
      text: rgb(0.1, 0.1, 0.1),
      muted: rgb(0.4, 0.4, 0.4),
      border: rgb(0.9, 0.9, 0.9),
      card: rgb(1, 1, 1),
      cardShadow: rgb(0.94, 0.94, 0.94),
      valueBg: rgb(0.975, 0.975, 0.98),
      brand: rgb(0.1, 0.1, 0.1),
    },
    fonts: {
      title: 18,
      h2: 14,
      label: 9.5,
      value: 10.5,
      small: 9,
    },
    radii: {
      card: 10,
      field: 7,
    },
  }

  type PageCtx = { page: any; y: number }

  const getPageSize = (page: any) => page.getSize() as { width: number; height: number }

  const textWidth = (text: string, font: any, size: number) => font.widthOfTextAtSize(text, size)

  const wrapText = (text: string, font: any, size: number, maxWidth: number) => {
    const t = (text ?? '').toString().replace(/\s+/g, ' ').trim()
    if (!t) return ['Not provided']
    const words = t.split(' ')
    const lines: string[] = []
    let line = ''
    for (const w of words) {
      const candidate = line ? `${line} ${w}` : w
      if (textWidth(candidate, font, size) <= maxWidth) {
        line = candidate
      } else {
        if (line) lines.push(line)
        // If a single word is too long, hard-break it.
        if (textWidth(w, font, size) > maxWidth) {
          let chunk = ''
          for (const ch of w) {
            const cand2 = chunk + ch
            if (textWidth(cand2, font, size) <= maxWidth) chunk = cand2
            else {
              if (chunk) lines.push(chunk)
              chunk = ch
            }
          }
          line = chunk
        } else {
          line = w
        }
      }
    }
    if (line) lines.push(line)
    return lines.length ? lines : ['Not provided']
  }

  const addPage = (): PageCtx => {
    const page = pdfDoc.addPage()
    const { height } = getPageSize(page)
    return { page, y: height - theme.page.marginTop }
  }

  const ensureSpace = (ctx: PageCtx, needed: number, header?: () => void): PageCtx => {
    const { height } = getPageSize(ctx.page)
    if (ctx.y - needed < theme.page.marginBottom) {
      const next = addPage()
      header?.()
      return next
    }
    return ctx
  }

  const drawCard = (ctx: PageCtx, height: number) => {
    const { width } = getPageSize(ctx.page)
    const x = theme.page.marginX
    const w = width - theme.page.marginX * 2
    const yBottom = ctx.y - height

    // subtle shadow
    ctx.page.drawRectangle({
      x,
      y: yBottom - 2,
      width: w,
      height,
      color: theme.colors.cardShadow,
      borderWidth: 0,
    })

    // card
    ctx.page.drawRectangle({
      x,
      y: yBottom,
      width: w,
      height,
      color: theme.colors.card,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.radii.card,
    })

    return { x, yTop: ctx.y, yBottom, width: w }
  }

  const drawHeader = (ctx: PageCtx) => {
    const { width, height } = getPageSize(ctx.page)
    const x = theme.page.marginX

    // Title
    ctx.page.drawText('Platinum Boxing Club Registration', {
      x,
      y: height - 52,
      size: theme.fonts.title,
      font: fontMedium,
      color: theme.colors.brand,
    })
    ctx.page.drawText('Feed the Faith, Starve the Doubt', {
      x,
      y: height - 70,
      size: theme.fonts.small,
      font: fontRegular,
      color: theme.colors.muted,
    })

    // Logo (optional, right aligned)
    try {
      const logoPath = path.join(process.cwd(), 'public', 'platinum-boxing-logo.jpeg')
      if (fs.existsSync(logoPath)) {
        const logoBytes = fs.readFileSync(logoPath)
        const logoImage = pdfDoc.embedJpg(logoBytes)
        // embedJpg returns a promise, so draw it later isn't possible; do sync-ish via then
        // We'll skip complex async header logo; add it later on first page only (below) where we're already async.
      }
    } catch {
      // ignore
    }

    // divider
    ctx.page.drawRectangle({
      x,
      y: height - 88,
      width: width - x * 2,
      height: 1,
      color: theme.colors.border,
    })

    // reset ctx.y just under divider
    ctx.y = height - 104
  }

  const drawSectionTitle = (ctx: PageCtx, title: string) => {
    ctx.page.drawText(title, {
      x: theme.page.marginX,
      y: ctx.y,
      size: theme.fonts.h2,
      font: fontMedium,
      color: theme.colors.text,
    })
    ctx.y -= 14
    const { width } = getPageSize(ctx.page)
    ctx.page.drawRectangle({
      x: theme.page.marginX,
      y: ctx.y,
      width: width - theme.page.marginX * 2,
      height: 1,
      color: theme.colors.border,
    })
    ctx.y -= 16
  }

  const drawFieldBox = (
    ctx: PageCtx,
    opts: {
      x: number
      yTop: number
      w: number
      label: string
      value?: string
      lines?: number
    },
  ) => {
    const paddingX = 10
    const paddingY = 9
    const labelGap = 3
    const lineHeight = 13
    const maxLines = opts.lines ?? 2

    const value = (opts.value ?? '').toString().trim()
    const displayValue = value.length ? value : 'Not provided'

    // label
    ctx.page.drawText(opts.label, {
      x: opts.x,
      y: opts.yTop,
      size: theme.fonts.label,
      font: fontMedium,
      color: theme.colors.text,
    })

    // box
    const boxTop = opts.yTop - (theme.fonts.label + labelGap)
    const boxHeight = paddingY * 2 + maxLines * lineHeight

    ctx.page.drawRectangle({
      x: opts.x,
      y: boxTop - boxHeight,
      width: opts.w,
      height: boxHeight,
      color: theme.colors.valueBg,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.radii.field,
    })

    // wrapped value
    const maxTextWidth = opts.w - paddingX * 2
    const lines = wrapText(displayValue, fontRegular, theme.fonts.value, maxTextWidth).slice(0, maxLines)

    let textY = boxTop - paddingY - theme.fonts.value
    for (const line of lines) {
      ctx.page.drawText(line, {
        x: opts.x + paddingX,
        y: textY,
        size: theme.fonts.value,
        font: fontRegular,
        color: value.length ? theme.colors.text : theme.colors.muted,
      })
      textY -= lineHeight
    }

    return {
      // a little extra space below the box so the next label is not too close
      heightUsed: theme.fonts.label + labelGap + boxHeight + 20,
    }
  }

  const drawSignatureBox = async (
    ctx: PageCtx,
    opts: { x: number; yTop: number; w: number; label: string; dataUrl?: string },
  ) => {
    const paddingX = 10
    const paddingY = 10
    const labelGap = 4
    const boxHeight = 110

    ctx.page.drawText(opts.label, {
      x: opts.x,
      y: opts.yTop,
      size: theme.fonts.label,
      font: fontMedium,
      color: theme.colors.text,
    })

    const boxTop = opts.yTop - (theme.fonts.label + labelGap)
    ctx.page.drawRectangle({
      x: opts.x,
      y: boxTop - boxHeight,
      width: opts.w,
      height: boxHeight,
      color: rgb(1, 1, 1),
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.radii.field,
    })

    const sig = (opts.dataUrl ?? '').toString()
    if (!sig.startsWith('data:image')) {
      ctx.page.drawText('No signature provided', {
        x: opts.x + paddingX,
        y: boxTop - paddingY - theme.fonts.value,
        size: theme.fonts.value,
        font: fontRegular,
        color: theme.colors.muted,
      })
      return { heightUsed: theme.fonts.label + labelGap + boxHeight + 18 }
    }

    try {
      const base64 = sig.split(',')[1]
      if (!base64) throw new Error('bad signature')
      const imgBuffer = Buffer.from(base64, 'base64')

      // Signature canvas is typically PNG. If it's not, embedding will throw and we fall back to placeholder.
      const image = await pdfDoc.embedPng(imgBuffer)
      const maxW = opts.w - paddingX * 2
      const maxH = boxHeight - paddingY * 2
      const dims = image.scale(1)
      const scale = Math.min(maxW / dims.width, maxH / dims.height, 1)
      const drawW = dims.width * scale
      const drawH = dims.height * scale

      ctx.page.drawImage(image, {
        x: opts.x + paddingX + (maxW - drawW) / 2,
        y: boxTop - paddingY - drawH,
        width: drawW,
        height: drawH,
      })
    } catch {
      ctx.page.drawText('Signature could not be rendered', {
        x: opts.x + paddingX,
        y: boxTop - paddingY - theme.fonts.value,
        size: theme.fonts.value,
        font: fontRegular,
        color: theme.colors.muted,
      })
    }

    return { heightUsed: theme.fonts.label + labelGap + boxHeight + 18 }
  }

  const drawPill = (ctx: PageCtx, opts: { x: number; y: number; text: string }) => {
    const paddingX = 10
    const paddingY = 4
    const size = 10
    const w = textWidth(opts.text, fontMedium, size) + paddingX * 2
    const h = size + paddingY * 2
    ctx.page.drawRectangle({
      x: opts.x,
      y: opts.y - h + 4,
      width: w,
      height: h,
      color: theme.colors.valueBg,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 999,
    })
    ctx.page.drawText(opts.text, {
      x: opts.x + paddingX,
      y: opts.y - size,
      size,
      font: fontMedium,
      color: theme.colors.text,
    })
    return { w }
  }

  const valueOrNotProvided = (v: any) => {
    const s = (v ?? '').toString().trim()
    return s.length ? s : ''
  }

  // --- Page 1 ---
  let ctx = addPage()
  drawHeader(ctx)

  // First page logo (async embed)
  try {
    const { width, height } = getPageSize(ctx.page)
    const logoPath = path.join(process.cwd(), 'public', 'platinum-boxing-logo.jpeg')
    if (fs.existsSync(logoPath)) {
      const logoBytes = fs.readFileSync(logoPath)
      const logoImage = await pdfDoc.embedJpg(logoBytes)
      const logoDims = logoImage.scale(0.23)
      ctx.page.drawImage(logoImage, {
        x: width - theme.page.marginX - logoDims.width,
        y: height - 78,
        width: logoDims.width,
        height: logoDims.height,
      })
    }
  } catch {
    // ignore
  }

  drawSectionTitle(ctx, 'Personal Details')

  // 2-column grid layout (matches website form feel)
  const { width: pageW } = getPageSize(ctx.page)
  const gutter = 16
  const colW = (pageW - theme.page.marginX * 2 - gutter) / 2
  const leftX = theme.page.marginX
  const rightX = theme.page.marginX + colW + gutter

  const row = async (left: any, right?: any) => {
    const estimated = 72
    ctx = ensureSpace(ctx, estimated)

    const yTop = ctx.y
    const leftRes = drawFieldBox(ctx, { x: leftX, yTop, w: colW, label: left[0], value: left[1], lines: left[2] })
    const rightRes = right
      ? drawFieldBox(ctx, { x: rightX, yTop, w: colW, label: right[0], value: right[1], lines: right[2] })
      : { heightUsed: leftRes.heightUsed }

    ctx.y -= Math.max(leftRes.heightUsed, rightRes.heightUsed)
  }

  await row(['Name', valueOrNotProvided(data.name), 2], ['Email', valueOrNotProvided(data.email), 2])
  await row(
    ['Gender', valueOrNotProvided(data.gender), 1],
    ['Date of Birth', valueOrNotProvided(data.dob), 1],
  )
  await row(['Occupation', valueOrNotProvided(data.occupation), 2], ['Date', valueOrNotProvided(data.date), 1])
  await row(['Phone', valueOrNotProvided(data.phone), 1], ['Emergency Contact', valueOrNotProvided(data.emergencyContact), 2])
  await row(['Relationship', valueOrNotProvided(data.relationship), 1], ['Emergency Contact Phone', valueOrNotProvided(data.emergencyPhone), 1])

  // Address (full width, more lines)
  ctx = ensureSpace(ctx, 120)
  const fullW = pageW - theme.page.marginX * 2
  const yTop = ctx.y
  const addrRes = drawFieldBox(ctx, { x: leftX, yTop, w: fullW, label: 'Address', value: valueOrNotProvided(data.address), lines: 4 })
  ctx.y -= addrRes.heightUsed

  // --- Page 2: Health Declaration ---
  ctx = addPage()
  drawHeader(ctx)
  drawSectionTitle(ctx, 'Health Declaration')

  // Card-like paragraph
  ctx = ensureSpace(ctx, 140)
  const card = drawCard(ctx, 120)
  const paragraph =
    'I, the above Applicant, hereby declare that I am fit and in excellent health condition to participate in boxing, ' +
    'kickboxing and/or boxercise activities and that I am not on any medication or taking any form of drug. Should I have ' +
    'to receive treatment at a hospital or medical institution due to any injury incurred while participating in any ' +
    'activities with Platinum Boxing Club I will be responsible to pay my own expenses.'

  const paraLines = wrapText(paragraph, fontRegular, 10.5, card.width - 28).slice(0, 8)
  let py = card.yTop - 26
  for (const line of paraLines) {
    ctx.page.drawText(line, {
      x: card.x + 14,
      y: py,
      size: 10.5,
      font: fontRegular,
      color: theme.colors.text,
    })
    py -= 14
  }
  ctx.y = card.yBottom - 20

  // Questionnaire fields (full width with more lines)
  const healthFields = [
    ['Health conditions (past or current)', valueOrNotProvided(data.healthConditions), 5],
    ['Previous or current injuries (include date)', valueOrNotProvided(data.previousInjuries), 5],
    ['Current prescribed medications (and reason)', valueOrNotProvided(data.currentMedications), 5],
  ] as const

  for (const [label, value, lines] of healthFields) {
    ctx = ensureSpace(ctx, 150)
    const res = drawFieldBox(ctx, { x: leftX, yTop: ctx.y, w: fullW, label, value, lines })
    ctx.y -= res.heightUsed
  }

  // Doctor details (2 columns)
  await row(["Doctor/GP's Name", valueOrNotProvided(data.doctorName), 2], ['Doctor contact details', valueOrNotProvided(data.doctorContact), 2])

  // --- Page 3: Consents ---
  ctx = addPage()
  drawHeader(ctx)
  drawSectionTitle(ctx, 'Terms and Conditions (Consents)')

  ctx = ensureSpace(ctx, 140)
  const consentCard = drawCard(ctx, 120)
  let cy = consentCard.yTop - 30
  const consentItems = [
    ['Photos and video footage', valueOrNotProvided(data.photosConsent)],
    ['Children', valueOrNotProvided(data.childrenConsent)],
    ['Participation fees', valueOrNotProvided(data.participationFees)],
    ['Gloves/hand wraps/equipment', valueOrNotProvided(data.equipmentConsent)],
  ] as const

  for (const [label, value] of consentItems) {
    ctx.page.drawText(label, {
      x: consentCard.x + 14,
      y: cy,
      size: 11,
      font: fontMedium,
      color: theme.colors.text,
    })
    const pillText = (value || 'Not provided').toString().toUpperCase()
    drawPill(ctx, { x: consentCard.x + consentCard.width - 14 - Math.min(160, textWidth(pillText, fontMedium, 10) + 24), y: cy + 4, text: pillText })
    cy -= 24
  }
  ctx.y = consentCard.yBottom - 20

  // --- Page 4: Release + Signatures ---
  ctx = addPage()
  drawHeader(ctx)
  drawSectionTitle(ctx, 'Release of Liability & Signatures')

  // Release short paragraph card
  ctx = ensureSpace(ctx, 140)
  const relCard = drawCard(ctx, 120)
  const releaseText =
    'In consideration of the acceptance of my application as a participant to the Platinum Boxing Club training, events or ' +
    'classes I hereby agree to assume all risks attendant upon myself while participating with Platinum Boxing Club. I hereby ' +
    'waive, release and discharge any and all claims for death, personal injury or property damage which I may have, or which ' +
    'hereafter accrue to me as a result of my participation with the Platinum Boxing Club.'
  const relLines = wrapText(releaseText, fontRegular, 10.5, relCard.width - 28).slice(0, 8)
  let ry = relCard.yTop - 26
  for (const line of relLines) {
    ctx.page.drawText(line, {
      x: relCard.x + 14,
      y: ry,
      size: 10.5,
      font: fontRegular,
      color: theme.colors.text,
    })
    ry -= 14
  }
  ctx.y = relCard.yBottom - 20

  // Participant details
  ctx = ensureSpace(ctx, 220)
  ctx.page.drawText("Participant's Details", {
    x: theme.page.marginX,
    y: ctx.y,
    size: 12,
    font: fontMedium,
    color: theme.colors.text,
  })
  ctx.y -= 18

  // name + date (two columns)
  const yTopA = ctx.y
  const nameRes = drawFieldBox(ctx, { x: leftX, yTop: yTopA, w: colW, label: "Participant's Name", value: valueOrNotProvided(data.participantName), lines: 2 })
  const dateRes = drawFieldBox(ctx, { x: rightX, yTop: yTopA, w: colW, label: 'Signature Date', value: valueOrNotProvided(data.participantSignatureDate), lines: 1 })
  ctx.y -= Math.max(nameRes.heightUsed, dateRes.heightUsed)

  // signature box full width
  ctx = ensureSpace(ctx, 170)
  const sigRes = await drawSignatureBox(ctx, {
    x: leftX,
    yTop: ctx.y,
    w: fullW,
    label: "Participant's Signature",
    dataUrl: data.participantSignature,
  })
  ctx.y -= sigRes.heightUsed

  // Parent/Guardian details
  ctx = ensureSpace(ctx, 260)
  ctx.page.drawText("Parent/Guardian's Details (for minors)", {
    x: theme.page.marginX,
    y: ctx.y,
    size: 12,
    font: fontMedium,
    color: theme.colors.text,
  })
  ctx.y -= 18

  const yTopB = ctx.y
  const pgNameRes = drawFieldBox(ctx, { x: leftX, yTop: yTopB, w: colW, label: "Parent/Guardian's Name", value: valueOrNotProvided(data.parentGuardianName), lines: 2 })
  const pgDateRes = drawFieldBox(ctx, { x: rightX, yTop: yTopB, w: colW, label: 'Signature Date', value: valueOrNotProvided(data.parentGuardianSignatureDate), lines: 1 })
  ctx.y -= Math.max(pgNameRes.heightUsed, pgDateRes.heightUsed)

  ctx = ensureSpace(ctx, 170)
  const pgSigRes = await drawSignatureBox(ctx, {
    x: leftX,
    yTop: ctx.y,
    w: fullW,
    label: "Parent/Guardian's Signature",
    dataUrl: data.parentGuardianSignature,
  })
  ctx.y -= pgSigRes.heightUsed

  // Agree to terms
  ctx = ensureSpace(ctx, 90)
  const agreeText = data.agreeToTerms ? 'YES' : 'NO'
  const agreeRes = drawFieldBox(ctx, { x: leftX, yTop: ctx.y, w: fullW, label: 'Agreed to all terms and conditions', value: agreeText, lines: 1 })
  ctx.y -= agreeRes.heightUsed

  // Footer
  const footerY = theme.page.marginBottom - 10
  const { width: footerW } = getPageSize(ctx.page)
  ctx.page.drawRectangle({
    x: theme.page.marginX,
    y: footerY + 18,
    width: footerW - theme.page.marginX * 2,
    height: 1,
    color: theme.colors.border,
  })
  ctx.page.drawText("2/18 O'Shea Drive, Nerang Qld 4211  •  Ph: 0420 397 152  •  Email: platinumboxingclub@gmail.com", {
    x: theme.page.marginX,
    y: footerY,
    size: 8.5,
    font: fontRegular,
    color: theme.colors.muted,
  })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Support both old format (direct data) and new format (registration + payment)
    const registration = body.registration || body
    const payment = body.payment
    const data = registration

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

    const mailSubject = payment 
      ? `New registration & payment from ${data.name ?? 'Unknown'}`
      : `New registration from ${data.name ?? 'Unknown'}`
    
    const mailText = payment
      ? `A new registration and payment details were submitted by ${data.name ?? 'Unknown'}.\n\nPayment Details:\n- Amount: $${payment.regularDebitAmount}\n- Frequency: ${payment.paymentFrequency}\n- Payment Method: ${payment.paymentMethodType}\n\nSee attached PDF.`
      : `A new registration was submitted by ${data.name ?? 'Unknown'}. See attached PDF.`

    const mailOptions = {
      from: process.env.MAIL_ID,
      to: process.env.ADMIN_MAIL_ID,
      subject: mailSubject,
      text: mailText,
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
