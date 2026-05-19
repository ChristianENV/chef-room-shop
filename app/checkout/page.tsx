'use client'

import { useState } from 'react'
import { CheckoutLayout } from '@/components/layout/checkout-layout'
import {
  CheckoutSteps,
  ContactForm,
  ShippingAddressForm,
  BillingAddressForm,
  ShippingMethodSelector,
  PaymentMethodTabs,
  CheckoutOrderSummary,
  PaymentConfirmationDialog,
  type CheckoutStep,
  type ContactFormData,
  type ShippingAddressData,
  type BillingAddressData,
  type ShippingMethod,
  type PaymentMethod,
  type CardPaymentData,
} from '@/components/checkout'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react'
import { MOCK_CART } from '@/lib/mock-data'

// Initial form data
const initialContactData: ContactFormData = {
  email: '',
  phone: '',
}

const initialShippingData: ShippingAddressData = {
  firstName: '',
  lastName: '',
  street: '',
  exteriorNumber: '',
  interiorNumber: '',
  neighborhood: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Mexico',
  saveAddress: false,
}

const initialBillingData: BillingAddressData = {
  sameAsShipping: true,
  firstName: '',
  lastName: '',
  street: '',
  exteriorNumber: '',
  interiorNumber: '',
  neighborhood: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Mexico',
}

const initialCardData: CardPaymentData = {
  cardholderName: '',
  cardNumber: '',
  expirationMonth: '',
  expirationYear: '',
  cvv: '',
  installments: 1,
}

export default function CheckoutPage() {
  // Step management
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('informacion')
  const [completedSteps, setCompletedSteps] = useState<CheckoutStep[]>([])

  // Form data
  const [contactData, setContactData] = useState<ContactFormData>(initialContactData)
  const [shippingData, setShippingData] = useState<ShippingAddressData>(initialShippingData)
  const [billingData, setBillingData] = useState<BillingAddressData>(initialBillingData)
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [cardData, setCardData] = useState<CardPaymentData>(initialCardData)

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [orderId, setOrderId] = useState('')

  // Form validation errors
  const [contactErrors, setContactErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({})
  const [shippingErrors, setShippingErrors] = useState<Partial<Record<keyof ShippingAddressData, string>>>({})
  const [cardErrors, setCardErrors] = useState<Partial<Record<keyof CardPaymentData, string>>>({})

  // Check if cart has customized items
  const hasCustomization = MOCK_CART.items.some(item => item.customization.embroidery)

  // Calculate shipping cost
  const shippingCost = shippingMethod === 'express' ? 499 : 199

  // Validate contact form
  const validateContact = (): boolean => {
    const errors: Partial<Record<keyof ContactFormData, string>> = {}
    
    if (!contactData.email) {
      errors.email = 'El correo es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)) {
      errors.email = 'Ingresa un correo valido'
    }
    
    if (!contactData.phone) {
      errors.phone = 'El telefono es requerido'
    }
    
    setContactErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Validate shipping form
  const validateShipping = (): boolean => {
    const errors: Partial<Record<keyof ShippingAddressData, string>> = {}
    
    if (!shippingData.firstName) errors.firstName = 'El nombre es requerido'
    if (!shippingData.lastName) errors.lastName = 'El apellido es requerido'
    if (!shippingData.street) errors.street = 'La calle es requerida'
    if (!shippingData.exteriorNumber) errors.exteriorNumber = 'El numero es requerido'
    if (!shippingData.neighborhood) errors.neighborhood = 'La colonia es requerida'
    if (!shippingData.city) errors.city = 'La ciudad es requerida'
    if (!shippingData.state) errors.state = 'El estado es requerido'
    if (!shippingData.postalCode) errors.postalCode = 'El codigo postal es requerido'
    
    setShippingErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Validate card form
  const validateCard = (): boolean => {
    if (paymentMethod !== 'card') return true
    
    const errors: Partial<Record<keyof CardPaymentData, string>> = {}
    
    if (!cardData.cardholderName) errors.cardholderName = 'El nombre es requerido'
    if (!cardData.cardNumber || cardData.cardNumber.length < 16) errors.cardNumber = 'Numero de tarjeta invalido'
    if (!cardData.expirationMonth) errors.expirationMonth = 'Requerido'
    if (!cardData.expirationYear) errors.expirationYear = 'Requerido'
    if (!cardData.cvv || cardData.cvv.length < 3) errors.cvv = 'CVV invalido'
    
    setCardErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle step navigation
  const goToNextStep = () => {
    if (currentStep === 'informacion') {
      if (validateContact()) {
        setCompletedSteps(prev => [...prev, 'informacion'])
        setCurrentStep('envio')
      }
    } else if (currentStep === 'envio') {
      if (validateShipping()) {
        setCompletedSteps(prev => [...prev, 'envio'])
        setCurrentStep('pago')
      }
    } else if (currentStep === 'pago') {
      if (validateCard()) {
        handleSubmitOrder()
      }
    }
  }

  const goToPreviousStep = () => {
    if (currentStep === 'envio') {
      setCurrentStep('informacion')
    } else if (currentStep === 'pago') {
      setCurrentStep('envio')
    }
  }

  // Handle order submission
  const handleSubmitOrder = async () => {
    setIsSubmitting(true)

    // TODO: Integrate with createOrder GraphQL mutation
    // TODO: For card payments: tokenize card with Conekta.js first
    // TODO: For OXXO/SPEI: create payment reference via Conekta API
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate mock order ID
    const mockOrderId = `CR-${Date.now().toString(36).toUpperCase()}`
    setOrderId(mockOrderId)
    setCompletedSteps(prev => [...prev, 'pago', 'confirmacion'])
    setCurrentStep('confirmacion')
    setShowConfirmation(true)
    setIsSubmitting(false)
  }

  // Get button text based on current step
  const getButtonText = () => {
    if (isSubmitting) return 'Procesando...'
    if (currentStep === 'informacion') return 'Continuar a envio'
    if (currentStep === 'envio') return 'Continuar a pago'
    if (currentStep === 'pago') {
      if (paymentMethod === 'card') return 'Pagar ahora'
      if (paymentMethod === 'oxxo') return 'Generar referencia OXXO'
      if (paymentMethod === 'spei') return 'Obtener datos SPEI'
    }
    return 'Continuar'
  }

  // Calculate final total
  const calculateTotal = () => {
    const subtotal = MOCK_CART.subtotal
    const finalShipping = subtotal >= 2000 ? 0 : shippingCost
    return subtotal + finalShipping
  }

  return (
    <CheckoutLayout>
      {/* Checkout Steps */}
      <CheckoutSteps
        currentStep={currentStep}
        completedSteps={completedSteps}
        className="mb-8"
      />

      <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
        {/* Left Column - Forms */}
        <div className="space-y-6">
          {/* Contact Information */}
          {(currentStep === 'informacion' || completedSteps.includes('informacion')) && (
            <div className="rounded-lg border border-border bg-card p-4 md:p-6">
              <ContactForm
                data={contactData}
                onChange={setContactData}
                errors={contactErrors}
              />
            </div>
          )}

          {/* Shipping Address */}
          {(currentStep === 'envio' || currentStep === 'pago' || completedSteps.includes('envio')) && (
            <div className="rounded-lg border border-border bg-card p-4 md:p-6">
              <ShippingAddressForm
                data={shippingData}
                onChange={setShippingData}
                errors={shippingErrors}
              />

              <Separator className="my-6" />

              <BillingAddressForm
                data={billingData}
                onChange={setBillingData}
              />

              <Separator className="my-6" />

              <ShippingMethodSelector
                selectedMethod={shippingMethod}
                onMethodChange={setShippingMethod}
                hasCustomization={hasCustomization}
              />
            </div>
          )}

          {/* Payment */}
          {currentStep === 'pago' && (
            <div className="rounded-lg border border-border bg-card p-4 md:p-6">
              <PaymentMethodTabs
                selectedMethod={paymentMethod}
                onMethodChange={setPaymentMethod}
                cardData={cardData}
                onCardDataChange={setCardData}
                customerEmail={contactData.email}
                errors={cardErrors}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            {currentStep !== 'informacion' ? (
              <Button
                variant="ghost"
                onClick={goToPreviousStep}
                disabled={isSubmitting}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Atras
              </Button>
            ) : (
              <div />
            )}

            <Button
              size="lg"
              onClick={goToNextStep}
              disabled={isSubmitting}
              className="bg-primary font-sans font-semibold hover:bg-primary/90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {getButtonText()}
              {!isSubmitting && currentStep !== 'pago' && (
                <ChevronRight className="ml-2 h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <CheckoutOrderSummary
            cart={MOCK_CART}
            shippingCost={shippingCost}
          />
        </div>
      </div>

      {/* Payment Confirmation Dialog */}
      <PaymentConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        paymentMethod={paymentMethod}
        orderId={orderId}
        total={calculateTotal()}
        customerEmail={contactData.email}
      />
    </CheckoutLayout>
  )
}
