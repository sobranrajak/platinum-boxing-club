import fs from 'fs'
import path from 'path'

async function getLogoBase64(): Promise<string> {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'platinum-boxing-logo.jpeg')
    const logoBuffer = fs.readFileSync(logoPath)
    return logoBuffer.toString('base64')
  } catch (err) {
    console.error('Error reading logo:', err)
    return ''
  }
}

function escapeHtml(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function generateRegistrationHtml(data: any): Promise<string> {
  // Get logo base64 first
  const logoBase64 = await getLogoBase64()

  // Convert base64 images to data URLs for embedding
  const participantSig = data.participantSignature || ''
  const parentSig = data.parentGuardianSignature || ''

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Platinum Boxing Club Registration</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f5;
      color: #1a1a1a;
      padding: 32px 16px;
      line-height: 1.6;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 10px;
      padding: 32px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    
    .logo {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      margin: 0 auto 16px;
      object-fit: cover;
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    
    .header p {
      color: #666;
      font-size: 14px;
    }
    
    .section {
      margin-bottom: 32px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      border-bottom: 2px solid #e5e5e5;
      padding-bottom: 8px;
      margin-bottom: 24px;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .form-field {
      margin-bottom: 20px;
    }
    
    .form-field.full-width {
      grid-column: 1 / -1;
    }
    
    .label {
      font-size: 14px;
      font-weight: 500;
      color: #1a1a1a;
      margin-bottom: 8px;
      display: block;
    }
    
    .value {
      font-size: 14px;
      color: #333;
      padding: 10px 12px;
      background: #f9f9f9;
      border: 1px solid #e5e5e5;
      border-radius: 6px;
      min-height: 40px;
    }
    
    .value.empty {
      color: #999;
      font-style: italic;
    }
    
    .textarea-value {
      min-height: 80px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    .consent-section {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    
    .consent-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 12px;
    }
    
    .consent-text {
      font-size: 14px;
      color: #333;
      line-height: 1.7;
      margin-bottom: 12px;
    }
    
    .consent-value {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .signature-container {
      margin: 16px 0;
    }
    
    .signature-image {
      max-width: 100%;
      max-height: 120px;
      border: 2px solid #1a1a1a;
      border-radius: 8px;
      padding: 8px;
      background: white;
    }
    
    .signature-placeholder {
      padding: 40px;
      text-align: center;
      border: 2px dashed #ccc;
      border-radius: 8px;
      color: #999;
      font-style: italic;
    }
    
    .divider {
      border-top: 1px solid #e5e5e5;
      margin: 24px 0;
    }
    
    .footer {
      text-align: center;
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #e5e5e5;
      font-size: 12px;
      color: #666;
    }
    
    .checkbox-agreement {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-top: 24px;
      padding: 16px;
      background: #f9f9f9;
      border-radius: 8px;
    }
    
    .checkbox-agreement input {
      margin-top: 4px;
    }
    
    .checkbox-agreement label {
      font-size: 14px;
      line-height: 1.6;
      color: #333;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">

    <!-- Personal Details -->
    <div class="section">
      <div class="header">
        <img src="data:image/jpeg;base64,${logoBase64}" alt="Platinum Boxing Club Logo" class="logo" />
        <h1>Platinum Boxing Club Registration</h1>
        <p>Feed the Faith, Starve the Doubt</p>
      </div>
      <h2 class="section-title">Personal Details</h2>
      <div class="form-grid">
        <div class="form-field">
          <label class="label">Name</label>
          <div class="value ${!data.name ? 'empty' : ''}">${escapeHtml(data.name || 'Not provided')}</div>
        </div>
        <div class="form-field">
          <label class="label">Email</label>
          <div class="value ${!data.email ? 'empty' : ''}">${escapeHtml(data.email || 'Not provided')}</div>
        </div>
        <div class="form-field">
          <label class="label">Gender</label>
          <div class="value ${!data.gender ? 'empty' : ''}">${data.gender ? escapeHtml(data.gender.charAt(0).toUpperCase() + data.gender.slice(1)) : 'Not provided'}</div>
        </div>
        <div class="form-field">
          <label class="label">Date of Birth</label>
          <div class="value ${!data.dob ? 'empty' : ''}">${escapeHtml(data.dob || 'Not provided')}</div>
        </div>
        <div class="form-field">
          <label class="label">Occupation</label>
          <div class="value ${!data.occupation ? 'empty' : ''}">${escapeHtml(data.occupation || 'Not provided')}</div>
        </div>
        <div class="form-field">
          <label class="label">Date</label>
          <div class="value ${!data.date ? 'empty' : ''}">${escapeHtml(data.date || 'Not provided')}</div>
        </div>
        <div class="form-field">
          <label class="label">Phone</label>
          <div class="value ${!data.phone ? 'empty' : ''}">${escapeHtml(data.phone || 'Not provided')}</div>
        </div>
        <div class="form-field">
          <label class="label">Emergency Contact</label>
          <div class="value ${!data.emergencyContact ? 'empty' : ''}">${escapeHtml(data.emergencyContact || 'Not provided')}</div>
        </div>
        <div class="form-field">
          <label class="label">Relationship</label>
          <div class="value ${!data.relationship ? 'empty' : ''}">${escapeHtml(data.relationship || 'Not provided')}</div>
        </div>
        <div class="form-field">
          <label class="label">Emergency Contact Phone</label>
          <div class="value ${!data.emergencyPhone ? 'empty' : ''}">${escapeHtml(data.emergencyPhone || 'Not provided')}</div>
        </div>
        <div class="form-field full-width">
          <label class="label">Address</label>
          <div class="value ${!data.address ? 'empty' : ''}">${escapeHtml(data.address || 'Not provided')}</div>
        </div>
      </div>
    </div>

    <!-- Health Declaration -->
    <div class="section">
      <h2 class="section-title">Health Declaration</h2>
      <p style="font-size: 14px; color: #333; line-height: 1.7; margin-bottom: 24px;">
        I, the above Applicant, hereby declare that I am fit and in excellent
        health condition to participate in boxing, kickboxing and or boxercise
        activities and that I am not on any medication or taking any form of
        drug. Should I have to receive treatment at a hospital or medical
        institution due to any injury incurred while participating in any
        activities with Platinum Boxing Club I will be responsible to pay my
        own expenses.
      </p>
      
      <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #1a1a1a;">Health Questionnaire</h3>
      
      <div class="form-field">
        <label class="label">Please outline any health conditions you have previously experienced or are currently receiving medical treatment for:</label>
        <div class="value textarea-value ${!data.healthConditions ? 'empty' : ''}">${escapeHtml(data.healthConditions || 'Not provided')}</div>
      </div>
      
      <div class="form-field">
        <label class="label">Please provide details of any previous or current injuries you have suffered (provide date):</label>
        <div class="value textarea-value ${!data.previousInjuries ? 'empty' : ''}">${escapeHtml(data.previousInjuries || 'Not provided')}</div>
      </div>
      
      <div class="form-field">
        <label class="label">Please list any prescribed medication you are currently using and the reason you are using the medication:</label>
        <div class="value textarea-value ${!data.currentMedications ? 'empty' : ''}">${escapeHtml(data.currentMedications || 'Not provided')}</div>
      </div>
      
      <div class="form-grid">
        <div class="form-field">
          <label class="label">Doctor/General Practitioner's Name</label>
          <div class="value ${!data.doctorName ? 'empty' : ''}">${escapeHtml(data.doctorName || 'Not provided')}</div>
        </div>
        <div class="form-field">
          <label class="label">Doctor Contact Details</label>
          <div class="value ${!data.doctorContact ? 'empty' : ''}">${escapeHtml(data.doctorContact || 'Not provided')}</div>
        </div>
      </div>
    </div>

    <!-- Terms & Conditions -->
    <div class="section">
      <h2 class="section-title">Platinum Boxing Club - Terms and Conditions</h2>
      
      <div class="consent-section">
        <h3 class="consent-title">Photos and Video Footage</h3>
        <p class="consent-text">
          I understand and consent to photographs and or videos being taken of
          myself or my child/children while I/they train or participate in
          activities at Platinum Boxing Club and that this footage may be used
          on Platinum Boxing Clubs web site or social media outlets for
          promotional purposes.
        </p>
        <div class="consent-value">Consent: ${data.photosConsent ? escapeHtml(data.photosConsent.toUpperCase()) : 'Not provided'}</div>
      </div>
      
      <div class="consent-section">
        <h3 class="consent-title">Children</h3>
        <p class="consent-text">
          I understand that if I bring my children to any classes that I or
          other family members are participating in. I will CONTROL and accept
          FULL responsibility of any injury incurred to my child or other
          participants of Platinum Boxing Club and I will abide by rules and
          guide lines set by Coaches of the Platinum Boxing Club while on the
          Platinum Boxing Club property. I understand that if my child does not
          abide by the rules and guidelines of the Platinum Boxing Club coaches
          that my child/children may be excluded from activities with Platinum
          Boxing Club at the discretion of the Coaches.
        </p>
        <div class="consent-value">Consent: ${data.childrenConsent ? escapeHtml(data.childrenConsent.toUpperCase()) : 'Not provided'}</div>
      </div>
      
      <div class="consent-section">
        <h3 class="consent-title">Participation Fees</h3>
        <p class="consent-text">
          I understand that my participation with the Platinum Boxing Club is
          dependent upon me paying my fees and that my fees must be paid prior
          to my participation with Platinum Boxing Club and that after my first
          initial visit that casual visits will not be available and that I must
          take up one of the other fee structures available to participate
          further with the Platinum Boxing Club. I understand that Platinum
          Boxing Club 10 Pass Cards are NOT transferable to any other
          participants and that these cards must be used within 3 Months from
          the date of purchase. I understand and agree that I MUST give 21 days'
          notice for cancellation of my direct debit and that it is my
          responsibility to inform the Platinum Boxing Club that I no longer
          wish to use direct debit.
        </p>
        <div class="consent-value">Consent: ${data.participationFees ? escapeHtml(data.participationFees.toUpperCase()) : 'Not provided'}</div>
      </div>
      
      <div class="consent-section">
        <h3 class="consent-title">Gloves/Hand Wraps/Equipment</h3>
        <p class="consent-text">
          I understand that the use of the Platinum Boxing Club Gloves, Hand
          Wraps and equipment by myself or my child/children is at my own risk
          and that I will take every step to ensure I employ safe hygiene
          practices when using the Platinum Boxing Club gloves, hand wraps and
          equipment. I assume full responsibility for any hygiene related
          injuries to myself and my children as a result of our use of the
          Platinum Boxing Club gloves, hand wraps and equipment and I understand
          that it is recommended that I purchase my own personal gloves and hand
          wraps.
        </p>
        <div class="consent-value">Consent: ${data.equipmentConsent ? escapeHtml(data.equipmentConsent.toUpperCase()) : 'Not provided'}</div>
      </div>
    </div>

    <!-- Release of Liability -->
    <div class="section">
      <h2 class="section-title">Release of Liability</h2>
      
      <div style="font-size: 14px; color: #333; line-height: 1.7; margin-bottom: 24px;">
        <p style="margin-bottom: 12px;">
          In consideration of the acceptance of my application as a participant
          to the Platinum Boxing Club Training, events or Classes I hereby agree
          to assume all risks attendant upon myself while participating with
          Platinum Boxing Club. I hereby waive, release and discharge any and
          all claims for death, personal injury or property damage which I may
          have, or which hereafter accrue to me as a result of my participation
          with the Platinum Boxing Club.
        </p>
        <p style="margin-bottom: 12px;">
          I agree to indemnify and hold harmless from liability the Platinum
          Boxing Club and its member's chapters and/or any of their agents,
          coaches, servants, volunteers or employees by reason of any accident,
          death, injury or damages to persons or property which I may suffer
          while participating with the Platinum Boxing Club.
        </p>
        <p>
          This release is intended to discharge in advance Platinum Boxing Club,
          its members chapters and/or any of their agents, coaches, servants or
          employees by any reason of accident, death, injury or damages to
          persons arising out of or connected in any way with my participation
          organised by the Platinum Boxing Club even though liability may arise
          out of negligence or carelessness on the part of the persons or
          entities mentioned above. It is further understood and agreed that
          this waiver, release and assumptions of risk to be binding on my heirs
          and assigns of me. I agree to assume all responsibilities for any
          property damage or injury to any person caused by me while
          participating with the Platinum Boxing Club. By my signature I
          indicate that I have read and understood this Waiver of Liability. I
          am aware that this is a waiver and a release of liability and I
          voluntarily agree to its terms. If I am signing on behalf of a minor
          child, I give permission to call for medical and or surgical care for
          the child and to transport the child to a medical facility deemed
          necessary for the well being of the child.
        </p>
      </div>
      
      <div class="divider"></div>
      
      <!-- Participant Section -->
      <div style="margin-bottom: 24px;">
        <div class="form-field">
          <label class="label">Participant's Name (please print):</label>
          <div class="value ${!data.participantName ? 'empty' : ''}">${escapeHtml(data.participantName || 'Not provided')}</div>
        </div>
        
        <div class="form-field">
          <label class="label">Participant's Signature:</label>
          <div class="signature-container">
            ${participantSig 
              ? `<img src="${participantSig}" alt="Participant Signature" class="signature-image" />` 
              : '<div class="signature-placeholder">No signature provided</div>'
            }
          </div>
        </div>
        
        <div class="form-field">
          <label class="label">Participant's Signature Date:</label>
          <div class="value ${!data.participantSignatureDate ? 'empty' : ''}">${escapeHtml(data.participantSignatureDate || 'Not provided')}</div>
        </div>
        <p style="font-size: 12px; color: #666; font-style: italic; margin-top: -12px; margin-bottom: 16px;">
          (Parent/Guardian signature required if under 18 years of age - see below)
        </p>
      </div>
      
      <div class="divider"></div>
      
      <!-- Parent/Guardian Section -->
      <div style="margin-bottom: 24px;">
        <p style="font-size: 14px; color: #666; font-style: italic; margin-bottom: 16px;">
          I represent that I have legal capacity and authorisation to act on
          behalf of the minor named herein.
        </p>
        
        <div class="form-field">
          <label class="label">Parent/Guardian's Name (please print):</label>
          <div class="value ${!data.parentGuardianName ? 'empty' : ''}">${escapeHtml(data.parentGuardianName || 'Not provided')}</div>
        </div>
        
        <div class="form-field">
          <label class="label">Parent/Guardian Signature:</label>
          <div class="signature-container">
            ${parentSig 
              ? `<img src="${parentSig}" alt="Parent/Guardian Signature" class="signature-image" />` 
              : '<div class="signature-placeholder">No signature provided</div>'
            }
          </div>
        </div>
        
        <div class="form-field">
          <label class="label">Parent/Guardian Signature Date:</label>
          <div class="value ${!data.parentGuardianSignatureDate ? 'empty' : ''}">${escapeHtml(data.parentGuardianSignatureDate || 'Not provided')}</div>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <!-- Agreement Checkbox -->
      <div class="checkbox-agreement">
        <input type="checkbox" ${data.agreeToTerms ? 'checked' : ''} disabled style="width: 18px; height: 18px; margin-top: 2px;" />
        <label>
          I have read, understood and agree to all the terms, conditions, health
          declaration and release of liability stated in this registration form.
        </label>
      </div>
    </div>

    <div class="footer">
      <p>2/18 O'Shea Drive, Nerang Qld 4211</p>
      <p>Ph: 0420 397 152 | Email: platinumboxingclub@gmail.com</p>
    </div>
  </div>
</body>
</html>
  `

  return html
}
