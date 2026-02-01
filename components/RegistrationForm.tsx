"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import Image from "next/image"

const STEPS = [
  { id: 1, title: "Personal Details" },
  { id: 2, title: "Health Declaration" },
  { id: 3, title: "Terms & Conditions" },
  { id: 4, title: "Release of Liability" },
]

interface FormData {
  // Personal Details
  name: string
  email: string
  gender: string
  dob: string
  occupation: string
  date: string
  emergencyContact: string
  phone: string
  relationship: string
  emergencyPhone: string
  address: string
  // Health Declaration
  healthConditions: string
  previousInjuries: string
  currentMedications: string
  doctorName: string
  doctorContact: string
  // Terms & Conditions
  photosConsent: string
  childrenConsent: string
  participationFees: string
  equipmentConsent: string
  // Release of Liability
  participantName: string
  participantSignatureDate: string
  parentGuardianName: string
  parentGuardianSignatureDate: string
  agreeToTerms: boolean
}

export default function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    gender: "",
    dob: "",
    occupation: "",
    date: "",
    emergencyContact: "",
    phone: "",
    relationship: "",
    emergencyPhone: "",
    address: "",
    healthConditions: "",
    previousInjuries: "",
    currentMedications: "",
    doctorName: "",
    doctorContact: "",
    photosConsent: "",
    childrenConsent: "",
    participationFees: "",
    equipmentConsent: "",
    participantName: "",
    participantSignatureDate: "",
    parentGuardianName: "",
    parentGuardianSignatureDate: "",
    agreeToTerms: false,
  })

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    console.log("Form submitted:", formData)
    alert("Registration submitted successfully!")
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Image src="/platinum-boxing-logo.jpeg" alt="Platinum Boxing Club Logo" width={150} height={150} className="mx-auto mb-4 rounded-full" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Platinum Boxing Club Registration
          </h1>
          <p className="text-muted-foreground text-sm">
            Feed the Faith, Starve the Doubt
          </p>
        </div>

        {/* Step Indicator - Horizontal at Top */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      currentStep > step.id
                        ? "bg-primary text-primary-foreground"
                        : currentStep === step.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs md:text-sm font-medium text-center max-w-20 md:max-w-none ${
                      currentStep >= step.id
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 md:mx-4 transition-colors ${
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card>
          <CardContent className="p-6 md:p-8">
            {currentStep === 1 && (
              <PersonalDetailsStep
                formData={formData}
                updateFormData={updateFormData}
              />
            )}
            {currentStep === 2 && (
              <HealthDeclarationStep
                formData={formData}
                updateFormData={updateFormData}
              />
            )}
            {currentStep === 3 && (
              <TermsConditionsStep
                formData={formData}
                updateFormData={updateFormData}
              />
            )}
            {currentStep === 4 && (
              <ReleaseOfLiabilityStep
                formData={formData}
                updateFormData={updateFormData}
              />
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Step
              </Button>
              {currentStep < STEPS.length ? (
                <Button onClick={nextStep} className="gap-2">
                  Next Step
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.agreeToTerms}
                  className="gap-2"
                >
                  Submit Registration
                  <Check className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>2/18 O'Shea Drive, Nerang Qld 4211</p>
          <p>Ph: 0420 397 152 | Email: platinumboxingclub@gmail.com</p>
        </div>
      </div>
    </div>
  )
}

interface StepProps {
  formData: FormData
  updateFormData: (field: keyof FormData, value: string | boolean) => void
}

function PersonalDetailsStep({ formData, updateFormData }: StepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
        Personal Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => updateFormData("name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => updateFormData("email", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Print clearly</p>
        </div>

        <div className="space-y-2">
          <Label>Gender</Label>
          <RadioGroup
            value={formData.gender}
            onValueChange={(value) => updateFormData("gender", value)}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male" className="font-normal cursor-pointer">
                Male
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female" className="font-normal cursor-pointer">
                Female
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={formData.dob}
            onChange={(e) => updateFormData("dob", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            placeholder="Enter your occupation"
            value={formData.occupation}
            onChange={(e) => updateFormData("occupation", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => updateFormData("date", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={(e) => updateFormData("phone", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Emergency Contact</Label>
          <Input
            id="emergencyContact"
            placeholder="Emergency contact name"
            value={formData.emergencyContact}
            onChange={(e) => updateFormData("emergencyContact", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="relationship">Relationship</Label>
          <Input
            id="relationship"
            placeholder="Relationship to emergency contact"
            value={formData.relationship}
            onChange={(e) => updateFormData("relationship", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
          <Input
            id="emergencyPhone"
            type="tel"
            placeholder="Emergency contact phone"
            value={formData.emergencyPhone}
            onChange={(e) => updateFormData("emergencyPhone", e.target.value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="Enter your full address"
            value={formData.address}
            onChange={(e) => updateFormData("address", e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

function HealthDeclarationStep({ formData, updateFormData }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Health Declaration
        </h2>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          I, the above Applicant, hereby declare that I am fit and in excellent
          health condition to participate in boxing, kickboxing and or boxercise
          activities and that I am not on any medication or taking any form of
          drug. Should I have to receive treatment at a hospital or medical
          institution due to any injury incurred while participating in any
          activities with Platinum Boxing Club I will be responsible to pay my
          own expenses.
        </p>
      </div>

      <div className="space-y-6">
        <h3 className="font-medium text-foreground">Health Questionnaire</h3>

        <div className="space-y-2">
          <Label htmlFor="healthConditions">
            Please outline any health conditions you have previously experienced
            or are currently receiving medical treatment for:
          </Label>
          <Textarea
            id="healthConditions"
            placeholder="Describe any health conditions..."
            value={formData.healthConditions}
            onChange={(e) => updateFormData("healthConditions", e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="previousInjuries">
            Please provide details of any previous or current injuries you have
            suffered (provide date):
          </Label>
          <Textarea
            id="previousInjuries"
            placeholder="Describe any injuries with dates..."
            value={formData.previousInjuries}
            onChange={(e) => updateFormData("previousInjuries", e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentMedications">
            Please list any prescribed medication you are currently using and
            the reason you are using the medication:
          </Label>
          <Textarea
            id="currentMedications"
            placeholder="List medications and reasons..."
            value={formData.currentMedications}
            onChange={(e) =>
              updateFormData("currentMedications", e.target.value)
            }
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="doctorName">
            Please provide your Doctor/General Practitioner&apos;s name and contact
            details:
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="doctorName"
              placeholder="Doctor's name"
              value={formData.doctorName}
              onChange={(e) => updateFormData("doctorName", e.target.value)}
            />
            <Input
              id="doctorContact"
              placeholder="Contact details"
              value={formData.doctorContact}
              onChange={(e) => updateFormData("doctorContact", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function TermsConditionsStep({ formData, updateFormData }: StepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
        Platinum Boxing Club - Terms and Conditions
      </h2>

      {/* Photos and Video Footage */}
      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium text-foreground">
          Photos and Video Footage
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          I understand and consent to photographs and or videos being taken of
          myself or my child/children while I/they train or participate in
          activities at Platinum Boxing Club and that this footage may be used
          on Platinum Boxing Clubs web site or social media outlets for
          promotional purposes.
        </p>
        <RadioGroup
          value={formData.photosConsent}
          onValueChange={(value) => updateFormData("photosConsent", value)}
          className="flex gap-8"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="photos-yes" />
            <Label htmlFor="photos-yes" className="font-normal cursor-pointer">
              YES
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="photos-no" />
            <Label htmlFor="photos-no" className="font-normal cursor-pointer">
              NO
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Children */}
      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium text-foreground">Children</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
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
        <RadioGroup
          value={formData.childrenConsent}
          onValueChange={(value) => updateFormData("childrenConsent", value)}
          className="flex gap-8"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="children-yes" />
            <Label
              htmlFor="children-yes"
              className="font-normal cursor-pointer"
            >
              YES
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="children-no" />
            <Label htmlFor="children-no" className="font-normal cursor-pointer">
              NO
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Participation Fees */}
      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium text-foreground">Participation Fees</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          I understand that my participation with the Platinum Boxing Club is
          dependent upon me paying my fees and that my fees must be paid prior
          to my participation with Platinum Boxing Club and that after my first
          initial visit that casual visits will not be available and that I must
          take up one of the other fee structures available to participate
          further with the Platinum Boxing Club. I understand that Platinum
          Boxing Club 10 Pass Cards are NOT transferable to any other
          participants and that these cards must be used within 3 Months from
          the date of purchase. I understand and agree that I MUST give 21 days&apos;
          notice for cancellation of my direct debit and that it is my
          responsibility to inform the Platinum Boxing Club that I no longer
          wish to use direct debit.
        </p>
        <RadioGroup
          value={formData.participationFees}
          onValueChange={(value) => updateFormData("participationFees", value)}
          className="flex gap-8"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="fees-yes" />
            <Label htmlFor="fees-yes" className="font-normal cursor-pointer">
              YES
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="fees-no" />
            <Label htmlFor="fees-no" className="font-normal cursor-pointer">
              NO
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Gloves/Hand Wraps/Equipment */}
      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium text-foreground">
          Gloves/Hand Wraps/Equipment
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
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
        <RadioGroup
          value={formData.equipmentConsent}
          onValueChange={(value) => updateFormData("equipmentConsent", value)}
          className="flex gap-8"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="equipment-yes" />
            <Label
              htmlFor="equipment-yes"
              className="font-normal cursor-pointer"
            >
              YES
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="equipment-no" />
            <Label
              htmlFor="equipment-no"
              className="font-normal cursor-pointer"
            >
              NO
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  )
}

function ReleaseOfLiabilityStep({ formData, updateFormData }: StepProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
        Release of Liability
      </h2>

      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          In consideration of the acceptance of my application as a participant
          to the Platinum Boxing Club Training, events or Classes I hereby agree
          to assume all risks attendant upon myself while participating with
          Platinum Boxing Club. I hereby waive, release and discharge any and
          all claims for death, personal injury or property damage which I may
          have, or which hereafter accrue to me as a result of my participation
          with the Platinum Boxing Club.
        </p>
        <p>
          I agree to indemnify and hold harmless from liability the Platinum
          Boxing Club and its member&apos;s chapters and/or any of their agents,
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

      {/* Participant Section */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="font-medium text-foreground">
          Participant&apos;s Name (please print):
        </h3>
        <Input
          placeholder="Enter your full name"
          value={formData.participantName}
          onChange={(e) => updateFormData("participantName", e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Participant&apos;s Signature Date:</Label>
            <Input
              type="date"
              value={formData.participantSignatureDate}
              onChange={(e) =>
                updateFormData("participantSignatureDate", e.target.value)
              }
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic">
          (Parent/Guardian signature required if under 18 years of age - see
          below)
        </p>
      </div>

      {/* Parent/Guardian Section */}
      <div className="space-y-4 pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground italic">
          I represent that I have legal capacity and authorisation to act on
          behalf of the minor named herein.
        </p>

        <h3 className="font-medium text-foreground">
          Parent/Guardian&apos;s Name (please print):
        </h3>
        <Input
          placeholder="Enter parent/guardian's full name"
          value={formData.parentGuardianName}
          onChange={(e) => updateFormData("parentGuardianName", e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Parent/Guardian Signature Date:</Label>
            <Input
              type="date"
              value={formData.parentGuardianSignatureDate}
              onChange={(e) =>
                updateFormData("parentGuardianSignatureDate", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* Agreement Checkbox */}
      <div className="flex items-start space-x-3 pt-4 border-t border-border">
        <Checkbox
          id="agreeToTerms"
          checked={formData.agreeToTerms}
          onCheckedChange={(checked) =>
            updateFormData("agreeToTerms", checked as boolean)
          }
        />
        <Label
          htmlFor="agreeToTerms"
          className="text-sm font-normal cursor-pointer leading-relaxed"
        >
          I have read, understood and agree to all the terms, conditions, health
          declaration and release of liability stated in this registration form.
        </Label>
      </div>
    </div>
  )
}
