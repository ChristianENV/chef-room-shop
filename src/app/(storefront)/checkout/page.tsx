'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { CheckoutLayout } from '@/src/features/storefront/layout/checkout-layout'
import {
  CheckoutSteps,
  ContactForm,
  ShippingAddressForm,
  BillingAddressForm,
  PaymentMethodTabs,
  CheckoutOrderSummary,
  type CheckoutStep,
  type ContactFormData,
  type ShippingAddressData,
  type BillingAddressData,
  type PaymentMethod,
  useCompleteCheckoutMutation,
  SavedAddressSelector,
} from '@/src/features/storefront/checkout'
import { useMyCartQuery } from '@/src/features/storefront/cart/api/use-my-cart-query'
import { useMeProfileQuery } from '@/src/features/storefront/account/api/use-me-profile-query'
import { useMyAddressesQuery } from '@/src/features/storefront/account/api/use-my-addresses-query'
import { useSession } from '@/src/lib/auth/auth-client'
import {
  CartSkeleton,
  CartErrorState,
  EmptyCartState,
} from '@/src/features/storefront/cart/cart-states'
import { mapBffCartToCheckoutSummary } from '@/src/features/storefront/checkout/mappers/checkout-ui.mapper'
import { buildCreateCheckoutOrderInput, mapProfileAndAddressToCheckoutForm } from '@/src/features/storefront/checkout/mappers/checkout-ui.mapper'
import {
  getCheckoutErrorMessage,
  validateBillingStep,
  validateContactStep,
  validatePaymentStep,
  validateShippingRateStep,
  validateShippingStep,
} from '@/src/features/storefront/checkout/lib/checkout-step-validation'
import {
  clearCheckoutShippingDraft,
  readCheckoutShippingDraft,
  saveCheckoutShippingDraft,
} from '@/src/features/storefront/checkout/lib/checkout-shipping-session'
import { isCheckoutShippingOptional } from '@/src/features/storefront/checkout/lib/checkout-shipping-config'
import { saveCheckoutConfirmation } from '@/src/features/storefront/checkout/lib/checkout-session'
import type { SelectedShippingRateSummary } from '@/src/features/storefront/checkout/types/checkout-shipping.types'
import { ShippingRateSelector } from '@/src/features/storefront/shipping'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react'
import { routes } from '@/src/config/routes'

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

function readInitialShippingFromSession(): {
  selectedShipping: SelectedShippingRateSummary | null
  quoteId: string | null
} {
  const draft = readCheckoutShippingDraft()
  return {
    selectedShipping: draft?.selectedShipping ?? null,
    quoteId: draft?.quoteId ?? null,
  }
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

export default function CheckoutPage() {
  const { data: authSession } = useSession()
  const isAuthenticated = Boolean(authSession?.user)
  const { data: profile } = useMeProfileQuery({ enabled: isAuthenticated })
  const { data: addresses } = useMyAddressesQuery({ enabled: isAuthenticated })

  const { data: cart, isLoading, isError, refetch, isFetching } = useMyCartQuery()
  const completeCheckoutMutation = useCompleteCheckoutMutation()

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('informacion')
  const [completedSteps, setCompletedSteps] = useState<CheckoutStep[]>([])

  const [contactData, setContactData] = useState<ContactFormData>(initialContactData)
  const [shippingData, setShippingData] = useState<ShippingAddressData>(initialShippingData)
  const [billingData, setBillingData] = useState<BillingAddressData>(initialBillingData)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [orderNotes, setOrderNotes] = useState('')
  const initialShippingSession = readInitialShippingFromSession()
  const [selectedShipping, setSelectedShipping] = useState<SelectedShippingRateSummary | null>(
    initialShippingSession.selectedShipping,
  )
  const [shippingQuoteId, setShippingQuoteId] = useState<string | null>(
    initialShippingSession.quoteId,
  )
  const [skydropxUnavailable, setSkydropxUnavailable] = useState(false)
  const [savedShippingAddress, setSavedShippingAddress] = useState<ShippingAddressData | null>(null)
  const [usingSavedAddress, setUsingSavedAddress] = useState(true)
  const prefillAppliedRef = useRef(false)

  const [contactErrors, setContactErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({})
  const [shippingErrors, setShippingErrors] = useState<Partial<Record<keyof ShippingAddressData, string>>>({})
  const [shippingRateError, setShippingRateError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedShipping && !shippingQuoteId) {
      clearCheckoutShippingDraft()
      return
    }
    saveCheckoutShippingDraft({
      quoteId: shippingQuoteId,
      selectedRateId: selectedShipping?.rateId ?? null,
      selectedShipping,
      destinationPostalCode: shippingData.postalCode.trim(),
    })
  }, [selectedShipping, shippingQuoteId, shippingData.postalCode])

  useEffect(() => {
    if (!isAuthenticated || !profile || !addresses || prefillAppliedRef.current) return
    prefillAppliedRef.current = true

    const prefilled = mapProfileAndAddressToCheckoutForm({ profile, addresses })
    queueMicrotask(() => {
      setContactData(prefilled.contact)

      if (prefilled.shipping) {
        setSavedShippingAddress(prefilled.shipping)
        setShippingData(prefilled.shipping)
        setUsingSavedAddress(true)
      }

      if (prefilled.billing) {
        setBillingData(prefilled.billing)
      }
    })
  }, [isAuthenticated, profile, addresses])

  const handleShippingAddressChange = useCallback((data: ShippingAddressData) => {
    setShippingData((prev) => {
      if (prev.postalCode.trim() !== data.postalCode.trim()) {
        setSelectedShipping(null)
        setShippingQuoteId(null)
        clearCheckoutShippingDraft()
      }
      return data
    })
  }, [])

  const summary = useMemo(
    () => (cart ? mapBffCartToCheckoutSummary(cart) : null),
    [cart],
  )

  const hasCustomization = useMemo(
    () =>
      cart?.items.some(
        (item) =>
          Boolean(item.designId) ||
          item.customizationPriceCents > 0 ||
          Boolean(item.customizationSnapshot),
      ) ?? false,
    [cart],
  )

  const hasItems = (cart?.items.length ?? 0) > 0
  const isSubmitting = completeCheckoutMutation.isPending

  const goToNextStep = () => {
    setSubmitError(null)

    if (currentStep === 'informacion') {
      const { success, errors } = validateContactStep(contactData)
      setContactErrors(errors)
      if (!success) return
      setCompletedSteps((prev) => [...prev, 'informacion'])
      setCurrentStep('envio')
      return
    }

    if (currentStep === 'envio') {
      const shippingResult = validateShippingStep(shippingData)
      const billingResult = validateBillingStep(billingData)
      const rateResult = validateShippingRateStep(selectedShipping?.rateId, {
        skydropxUnavailable,
      })
      setShippingErrors(shippingResult.errors)
      setShippingRateError(rateResult.message ?? null)
      if (!shippingResult.success || !billingResult.success || !rateResult.success) {
        return
      }
      setCompletedSteps((prev) => [...prev, 'envio'])
      setCurrentStep('pago')
      return
    }

    if (currentStep === 'pago') {
      if (!validatePaymentStep(paymentMethod)) return
      const rateResult = validateShippingRateStep(selectedShipping?.rateId, {
        skydropxUnavailable,
      })
      if (!rateResult.success) {
        setShippingRateError(rateResult.message ?? null)
        return
      }
      void handleSubmitOrder()
    }
  }

  const goToPreviousStep = () => {
    setSubmitError(null)
    if (currentStep === 'envio') setCurrentStep('informacion')
    else if (currentStep === 'pago') setCurrentStep('envio')
  }

  const handleSubmitOrder = async () => {
    if (!cart || !summary) return

    setSubmitError(null)

    const input = buildCreateCheckoutOrderInput({
      contact: contactData,
      shipping: shippingData,
      billing: billingData,
      paymentMethod,
      notes: orderNotes || undefined,
      selectedShipping,
    })

    try {
      const payload = await completeCheckoutMutation.mutateAsync(input)
      clearCheckoutShippingDraft()
      setSelectedShipping(null)
      setShippingQuoteId(null)
      saveCheckoutConfirmation({
        ...payload,
        email: contactData.email.trim(),
        paymentMethod,
        returnToken: payload.returnToken,
        shippingCarrier: selectedShipping?.carrier ?? null,
        shippingService: selectedShipping?.service ?? null,
      })
      window.location.assign(payload.paymentRedirectUrl)
    } catch (error) {
      setSubmitError(getCheckoutErrorMessage(error))
    }
  }

  const getButtonText = () => {
    if (isSubmitting) return 'Preparando tu pago seguro…'
    if (currentStep === 'informacion') return 'Continuar a envío'
    if (currentStep === 'envio') return 'Continuar a pago'
    if (currentStep === 'pago') return 'Continuar al pago'
    return 'Continuar'
  }

  if (isLoading) {
    return (
      <CheckoutLayout>
        <CartSkeleton itemCount={2} className="grid-cols-1 lg:grid-cols-[1fr,380px]" />
      </CheckoutLayout>
    )
  }

  if (isError) {
    return (
      <CheckoutLayout>
        <CartErrorState
          message="No pudimos cargar tu carrito. Por favor intenta de nuevo."
          onRetry={() => void refetch()}
        />
      </CheckoutLayout>
    )
  }

  if (!hasItems || !summary) {
    return (
      <CheckoutLayout>
        <EmptyCartState />
        <div className="mt-6 flex justify-center">
          <Button asChild variant="outline" className="font-sans">
            <Link href={routes.shop}>Ir a tienda</Link>
          </Button>
        </div>
      </CheckoutLayout>
    )
  }

  return (
    <CheckoutLayout>
      <CheckoutSteps
        currentStep={currentStep}
        completedSteps={completedSteps}
        className="mb-8"
      />

      <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
        <div className="space-y-6">
          {(currentStep === 'informacion' || completedSteps.includes('informacion')) && (
            <div className="rounded-lg border border-border bg-card p-4 md:p-6">
              <ContactForm
                data={contactData}
                onChange={setContactData}
                errors={contactErrors}
              />
            </div>
          )}

          {(currentStep === 'envio' ||
            currentStep === 'pago' ||
            completedSteps.includes('envio')) && (
            <div className="rounded-lg border border-border bg-card p-4 md:p-6">
              {isAuthenticated && savedShippingAddress && (
                <>
                  <SavedAddressSelector
                    address={savedShippingAddress}
                    usingSaved={usingSavedAddress}
                    onUseSaved={() => {
                      setUsingSavedAddress(true)
                      setShippingData(savedShippingAddress)
                    }}
                    onUseNew={() => {
                      setUsingSavedAddress(false)
                      setShippingData(initialShippingData)
                    }}
                    className="mb-6"
                  />
                  <Separator className="mb-6" />
                </>
              )}

              <ShippingAddressForm
                data={shippingData}
                onChange={handleShippingAddressChange}
                errors={shippingErrors}
              />

              <Separator className="my-6" />

              <BillingAddressForm data={billingData} onChange={setBillingData} />

              <Separator className="my-6" />

              <ShippingRateSelector
                key={shippingData.postalCode.trim()}
                destinationPostalCode={shippingData.postalCode}
                destinationCity={shippingData.city}
                destinationState={shippingData.state}
                destinationCountry={shippingData.country}
                selectedRateId={selectedShipping?.rateId}
                onRateSelected={setSelectedShipping}
                onQuoteIdChange={setShippingQuoteId}
                onUnavailableChange={setSkydropxUnavailable}
                hasCustomization={hasCustomization}
                disabled={isSubmitting || isFetching}
              />

              {shippingRateError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-serif">
                    {shippingRateError}
                  </AlertDescription>
                </Alert>
              )}

              {isCheckoutShippingOptional() && skydropxUnavailable && (
                <Alert className="mt-4">
                  <AlertDescription className="font-serif text-sm">
                    Modo desarrollo: puedes continuar sin cotizar envío. La orden se creará con
                    envío en $0.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {currentStep === 'pago' && (
            <div className="rounded-lg border border-border bg-card p-4 md:p-6">
              <PaymentMethodTabs
                selectedMethod={paymentMethod}
                onMethodChange={setPaymentMethod}
                customerEmail={contactData.email}
                notes={orderNotes}
                onNotesChange={setOrderNotes}
              />
            </div>
          )}

          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-serif">{submitError}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            {currentStep !== 'informacion' ? (
              <Button
                variant="ghost"
                onClick={goToPreviousStep}
                disabled={isSubmitting || isFetching}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Atrás
              </Button>
            ) : (
              <div />
            )}

            <Button
              size="lg"
              onClick={goToNextStep}
              disabled={isSubmitting || isFetching}
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

        <div className="lg:sticky lg:top-4 lg:self-start">
          <CheckoutOrderSummary summary={summary} selectedShipping={selectedShipping} />
        </div>
      </div>
    </CheckoutLayout>
  )
}


