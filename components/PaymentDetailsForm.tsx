"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Check, PenTool } from "lucide-react"
import SignatureCanvas from "react-signature-canvas"
import toast from 'react-hot-toast'

const PAYMENT_STEPS = [
  { id: 1, title: "Customer Details" },
  { id: 2, title: "Payment Amount" },
  { id: 3, title: "Payment Method" },
  { id: 4, title: "Authorization" },
]

const ADMIN_FEES: Record<string, number> = {
  weekly: 1.30,
  fortnightly: 1.95,
  monthly: 2.95,
  quarterly: 3.95,
}

const SETUP_FEE = 11.00

export interface PaymentFormData {
  // Customer Details (pre-filled from registration)
  customerName: string
  customerEmail: string
  customerAddress: string
  customerDob: string
  customerPhone: string
  
  // Payment Details
  regularDebitAmount: string
  commissionChecked: boolean
  untilFurtherNotice: boolean
  contractValue: string
  paymentFrequency: "weekly" | "fortnightly" | "monthly" | "quarterly"
  specialConditions: string
  
  // Bank Account Details
  bankName: string
  branchAccountOpened: string
  bsbNumber: string
  accountNumber: string
  accountHolderGivenName: string
  accountHolderSurname: string
  
  // Credit Card Details
  paymentMethodType: "bank" | "credit-card"
  cardType: "visa" | "mastercard" | "amex" | ""
  cardHolderGivenName: string
  cardHolderSurname: string
  cardNumber: string
  cardExpiryDate: string
  
  // Authorization
  authorizedRepName: string
  authorizedRepSignature: string
  authorizationDate: string
  agreeToTerms: boolean
}

interface PaymentDetailsFormProps {
  registrationData: {
    name: string
    email: string
    address: string
    dob: string
    phone: string
  }
  onBack: () => void
  onSubmit: (paymentData: PaymentFormData) => Promise<void>
}

const INITIAL_PAYMENT_DATA: PaymentFormData = {
  customerName: "",
  customerEmail: "",
  customerAddress: "",
  customerDob: "",
  customerPhone: "",
  regularDebitAmount: "",
  commissionChecked: false,
  untilFurtherNotice: false,
  contractValue: "",
  paymentFrequency: "monthly",
  specialConditions: "",
  bankName: "",
  branchAccountOpened: "",
  bsbNumber: "",
  accountNumber: "",
  accountHolderGivenName: "",
  accountHolderSurname: "",
  paymentMethodType: "bank",
  cardType: "",
  cardHolderGivenName: "",
  cardHolderSurname: "",
  cardNumber: "",
  cardExpiryDate: "",
  authorizedRepName: "",
  authorizedRepSignature: "",
  authorizationDate: "",
  agreeToTerms: false,
}

export default function PaymentDetailsForm({
  registrationData,
  onBack,
  onSubmit,
}: PaymentDetailsFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<PaymentFormData>({
    ...INITIAL_PAYMENT_DATA,
    customerName: registrationData.name,
    customerEmail: registrationData.email,
    customerAddress: registrationData.address,
    customerDob: registrationData.dob,
    customerPhone: registrationData.phone,
  })

  const [signatureVisible, setSignatureVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const signatureRef = React.useRef<SignatureCanvas>(null)

  const updateFormData = (
    field: keyof PaymentFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSignature = (signature: string) => {
    updateFormData("authorizedRepSignature", signature)
    setSignatureVisible(false)
  }

  const handleSubmit = async () => {
    if (!formData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions")
      return
    }

    if (!formData.authorizedRepSignature) {
      toast.error("Signature is required")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const adminFee = ADMIN_FEES[formData.paymentFrequency]
  const debitAmount = parseFloat(formData.regularDebitAmount) || 0
  const totalAmount = debitAmount + adminFee

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {PAYMENT_STEPS.map((step, index) => (
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
                {index < PAYMENT_STEPS.length - 1 && (
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
              <CustomerDetailsStep formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 2 && (
              <PaymentAmountStep
                formData={formData}
                updateFormData={updateFormData}
                adminFee={adminFee}
                totalAmount={totalAmount}
              />
            )}
            {currentStep === 3 && (
              <PaymentMethodStep formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 4 && (
              <AuthorizationStep
                formData={formData}
                updateFormData={updateFormData}
                setSignatureVisible={setSignatureVisible}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentStep === 1) {
                    onBack()
                  } else {
                    setCurrentStep((prev) => prev - 1)
                  }
                }}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                {currentStep === 1 ? "Back" : "Previous"}
              </Button>

              {currentStep < PAYMENT_STEPS.length ? (
                <Button
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  disabled={currentStep === 3 && !formData.regularDebitAmount}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Payment Details"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signature Modal */}
      {signatureVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Authorized Representative Signature
            </h3>
            <div className="border-2 border-primary rounded-lg bg-white mb-4">
              <SignatureCanvas
                ref={signatureRef}
                penColor="black"
                canvasProps={{
                  width: 500,
                  height: 200,
                  className: "w-full h-auto touch-none",
                }}
              />
            </div>
            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  signatureRef.current?.clear()
                }}
              >
                Clear
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSignatureVisible(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const signature = signatureRef.current?.getTrimmedCanvas().toDataURL()
                    if (signature) {
                      handleSignature(signature)
                    }
                  }}
                >
                  Save Signature
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface StepProps {
  formData: PaymentFormData
  updateFormData: (field: keyof PaymentFormData, value: string | boolean) => void
}

function CustomerDetailsStep({ formData, updateFormData }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Customer Details
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Review and confirm your details from registration (editable)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Customer Name</Label>
          <Input
            id="customerName"
            value={formData.customerName}
            onChange={(e) => updateFormData("customerName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerEmail">Email Address</Label>
          <Input
            id="customerEmail"
            type="email"
            value={formData.customerEmail}
            onChange={(e) => updateFormData("customerEmail", e.target.value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="customerAddress">Address</Label>
          <Input
            id="customerAddress"
            value={formData.customerAddress}
            onChange={(e) => updateFormData("customerAddress", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerDob">Date of Birth</Label>
          <Input
            id="customerDob"
            type="date"
            value={formData.customerDob}
            onChange={(e) => updateFormData("customerDob", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerPhone">Telephone</Label>
          <Input
            id="customerPhone"
            type="tel"
            value={formData.customerPhone}
            onChange={(e) => updateFormData("customerPhone", e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

interface PaymentAmountStepProps extends StepProps {
  adminFee: number
  totalAmount: number
}

function PaymentAmountStep({
  formData,
  updateFormData,
  adminFee,
  totalAmount,
}: PaymentAmountStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Payment Amount & Frequency
        </h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="regularDebitAmount">Regular Debit Amount ($)</Label>
          <Input
            id="regularDebitAmount"
            type="number"
            placeholder="0.00"
            step="0.01"
            value={formData.regularDebitAmount}
            onChange={(e) => updateFormData("regularDebitAmount", e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Label>Commission Options</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="commission"
              checked={formData.commissionChecked}
              onCheckedChange={(checked) =>
                updateFormData("commissionChecked", checked as boolean)
              }
            />
            <Label htmlFor="commission" className="font-normal cursor-pointer">
              Commission
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="untilFurther"
              checked={formData.untilFurtherNotice}
              onCheckedChange={(checked) =>
                updateFormData("untilFurtherNotice", checked as boolean)
              }
            />
            <Label htmlFor="untilFurther" className="font-normal cursor-pointer">
              Until Further Notice
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contractValue">Contract Value ($)</Label>
          <Input
            id="contractValue"
            type="number"
            placeholder="0.00"
            step="0.01"
            value={formData.contractValue}
            onChange={(e) => updateFormData("contractValue", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Payment Frequency</Label>
          <select
            id="frequency"
            value={formData.paymentFrequency}
            onChange={(e) =>
              updateFormData(
                "paymentFrequency",
                e.target.value as "weekly" | "fortnightly" | "monthly" | "quarterly"
              )
            }
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="weekly">Weekly - Admin Fee: $1.30</option>
            <option value="fortnightly">Fortnightly - Admin Fee: $1.95</option>
            <option value="monthly">Monthly - Admin Fee: $2.95</option>
            <option value="quarterly">Quarterly - Admin Fee: $3.95</option>
          </select>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span>Debit Amount:</span>
            <span className="font-medium">${formData.regularDebitAmount || "0.00"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Admin Fee ({formData.paymentFrequency}):</span>
            <span className="font-medium">${adminFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Setup Fee:</span>
            <span className="font-medium">${SETUP_FEE.toFixed(2)}</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between font-semibold">
            <span>First Payment Total:</span>
            <span>${(totalAmount + SETUP_FEE).toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            The $11.00 setup fee will be added to the first payment only.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialConditions">Special Conditions (Optional)</Label>
          <Textarea
            id="specialConditions"
            placeholder="Enter any special conditions..."
            value={formData.specialConditions}
            onChange={(e) => updateFormData("specialConditions", e.target.value)}
            className="min-h-20"
          />
        </div>
      </div>
    </div>
  )
}

function PaymentMethodStep({ formData, updateFormData }: StepProps) {
  const isBankSelected = formData.paymentMethodType === "bank"
  const isCardSelected = formData.paymentMethodType === "credit-card"

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Payment Method
        </h2>
      </div>

      {/* Bank Account Section */}
      <div
        className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
          isBankSelected
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
        onClick={() => updateFormData("paymentMethodType", "bank")}
      >
        <div className="flex items-center gap-3 mb-4">
          <Checkbox
            checked={isBankSelected}
            onCheckedChange={(checked) => {
              if (checked) {
                updateFormData("paymentMethodType", "bank")
              }
            }}
          />
          <h3 className="font-semibold text-foreground">
            Direct Debit from Bank Account
          </h3>
        </div>

        {isBankSelected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-10">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) => updateFormData("bankName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branchAccountOpened">Branch Account Opened</Label>
              <Input
                id="branchAccountOpened"
                value={formData.branchAccountOpened}
                onChange={(e) =>
                  updateFormData("branchAccountOpened", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bsbNumber">BSB Number</Label>
              <Input
                id="bsbNumber"
                placeholder="XXX-XXX"
                value={formData.bsbNumber}
                onChange={(e) => updateFormData("bsbNumber", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => updateFormData("accountNumber", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountHolderGiven">Account Holder Given Name</Label>
              <Input
                id="accountHolderGiven"
                value={formData.accountHolderGivenName}
                onChange={(e) =>
                  updateFormData("accountHolderGivenName", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountHolderSurname">Account Holder Surname</Label>
              <Input
                id="accountHolderSurname"
                value={formData.accountHolderSurname}
                onChange={(e) =>
                  updateFormData("accountHolderSurname", e.target.value)
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Credit Card Section */}
      <div
        className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
          isCardSelected
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
        onClick={() => updateFormData("paymentMethodType", "credit-card")}
      >
        <div className="flex items-center gap-3 mb-4">
          <Checkbox
            checked={isCardSelected}
            onCheckedChange={(checked) => {
              if (checked) {
                updateFormData("paymentMethodType", "credit-card")
              }
            }}
          />
          <h3 className="font-semibold text-foreground">Debit from Credit Card</h3>
        </div>

        {isCardSelected && (
          <div className="space-y-4 mt-4 pl-10">
            <div className="space-y-3">
              <Label>Card Type</Label>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="visa"
                    checked={formData.cardType === "visa"}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFormData("cardType", "visa")
                      }
                    }}
                  />
                  <Label
                    htmlFor="visa"
                    className="font-normal cursor-pointer"
                  >
                    Visa
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="mastercard"
                    checked={formData.cardType === "mastercard"}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFormData("cardType", "mastercard")
                      }
                    }}
                  />
                  <Label
                    htmlFor="mastercard"
                    className="font-normal cursor-pointer"
                  >
                    Mastercard
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="amex"
                    checked={formData.cardType === "amex"}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFormData("cardType", "amex")
                      }
                    }}
                  />
                  <Label
                    htmlFor="amex"
                    className="font-normal cursor-pointer"
                  >
                    Amex
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardHolderGiven">Name on Card - Given Name</Label>
                <Input
                  id="cardHolderGiven"
                  value={formData.cardHolderGivenName}
                  onChange={(e) =>
                    updateFormData("cardHolderGivenName", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardHolderSurname">Name on Card - Surname</Label>
                <Input
                  id="cardHolderSurname"
                  value={formData.cardHolderSurname}
                  onChange={(e) =>
                    updateFormData("cardHolderSurname", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="•••• •••• •••• ••••"
                  value={formData.cardNumber}
                  onChange={(e) => updateFormData("cardNumber", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardExpiry">Expiry Date</Label>
                <Input
                  id="cardExpiry"
                  placeholder="MM/YY"
                  value={formData.cardExpiryDate}
                  onChange={(e) => updateFormData("cardExpiryDate", e.target.value)}
                />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-foreground">
              <p>
                <span className="font-semibold">Surcharges:</span> 1.7% for Visa and
                Mastercard, 3.5% for Amex will be added to each payment.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
        <p>
          All payments will be processed through PaySmart. Please submit via eDDR in Web Express.
        </p>
      </div>
    </div>
  )
}

interface AuthorizationStepProps extends StepProps {
  setSignatureVisible: (visible: boolean) => void
}

function AuthorizationStep({
  formData,
  updateFormData,
  setSignatureVisible,
}: AuthorizationStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Customer Authorization
        </h2>
      </div>

      {/* Terms & Conditions Summary */}
      <div className="bg-muted/30 p-4 rounded-lg space-y-3 text-sm">
        <h3 className="font-semibold text-foreground">Direct Debit Request Service Agreement</h3>
        <div className="max-h-48 overflow-y-auto text-foreground text-xs space-y-2">
          <p>
            This Authorization is to remain in force in accordance with the Terms and
            Conditions on this page, the provided Service Agreement, and I/We have read and
            understand the same.
          </p>
          <p className="font-semibold mt-3">Key Points:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              PaySmart will debit the account/card specified based on the amount and frequency
              agreed
            </li>
            <li>Changes to terms require 14 days notice</li>
            <li>You are responsible for ensuring funds are available</li>
            <li>Disputed debits will be resolved within industry agreed timeframes</li>
            <li>Direct debiting via BECS may not be available on all accounts</li>
            <li>This arrangement is binding on heirs and assigns</li>
          </ul>
          <p className="mt-3">
            For full terms, please refer to the Direct Debit Request Service Agreement
            document provided with this form.
          </p>
        </div>
      </div>

      {/* Authorized Representative Info */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="space-y-2">
          <Label htmlFor="authorizedRepName">
            Authorized Representative Name (Please Print)
          </Label>
          <Input
            id="authorizedRepName"
            placeholder="Enter full name"
            value={formData.authorizedRepName}
            onChange={(e) => updateFormData("authorizedRepName", e.target.value)}
          />
        </div>

        {/* Signature */}
        <div className="space-y-2">
          <Label>Signature of Authorized Representative/s</Label>
          {formData.authorizedRepSignature ? (
            <div className="space-y-2">
              <img
                src={formData.authorizedRepSignature}
                alt="Signature"
                className="border-2 border-primary rounded-lg max-w-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSignatureVisible(true)}
              >
                <PenTool className="w-4 h-4 mr-2" />
                Change Signature
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setSignatureVisible(true)}
              className="w-full"
            >
              <PenTool className="w-4 h-4 mr-2" />
              Draw Signature
            </Button>
          )}
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="authorizationDate">Date</Label>
          <Input
            id="authorizationDate"
            type="date"
            value={formData.authorizationDate}
            onChange={(e) => updateFormData("authorizationDate", e.target.value)}
          />
        </div>
      </div>

      {/* Agreement Checkbox */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex items-start gap-3">
          <Checkbox
            id="agreeTerms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) =>
              updateFormData("agreeToTerms", checked as boolean)
            }
          />
          <Label
            htmlFor="agreeTerms"
            className="font-normal cursor-pointer text-sm"
          >
            I/We authorize PaySmart (Debit User) to debit my/our account of the Bank
            identified above through the Bulk Electronic Clearing System (BECS) in accordance
            with the Payment Details above and as per the Service Agreement provided. I/We
            understand that a surcharge of 1.7% for Visa and Mastercard and 3.5% for Amex
            will be added to each payment. I/We have read and understood the Service
            Agreement.
          </Label>
        </div>
      </div>
    </div>
  )
}
