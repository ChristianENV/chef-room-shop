'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckoutLayout } from '@/src/features/storefront/layout/checkout-layout'
import {
  CheckoutSteps,
  ContactForm,
  ShippingAddressForm,
  BillingAddressForm,
  ShippingMethodSelector,
  PaymentMethodTabs,
  CheckoutOrderSummary,
  type CheckoutStep,
  type ContactFormData,
  type ShippingAddressData,
  type BillingAddressData,
  type ShippingMethod,
  type PaymentMethod,
  useCreateCheckoutOrderMutation,
} from '@/src/features/storefront/checkout'
import { useMyCartQuery } from '@/src/features/storefront/cart/api/use-my-cart-query'
import {
  CartSkeleton,
  CartErrorState,
  EmptyCartState,
} from '@/src/features/storefront/cart/cart-states'
import { mapBffCartToCheckoutSummary } from '@/src/features/storefront/checkout/mappers/checkout-ui.mapper'
import { buildCreateCheckoutOrderInput } from '@/src/features/storefront/checkout/mappers/checkout-ui.mapper'
import {
  getCheckoutErrorMessage,
  validateBillingStep,
  validateContactStep,
  validatePaymentStep,
  validateShippingStep,
} from '@/src/features/storefront/checkout/lib/checkout-step-validation'
import { saveCheckoutConfirmation } from '@/src/features/storefront/checkout/lib/checkout-session'
import { checkoutSuccessUrl } from '@/src/features/storefront/checkout/lib/checkout-routes'
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
  const router = useRouter()
  const { data: cart, isLoading, isError, refetch, isFetching } = useMyCartQuery()
  const createOrder = useCreateCheckoutOrderMutation()

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('informacion')
  const [completedSteps, setCompletedSteps] = useState<CheckoutStep[]>([])

  const [contactData, setContactData] = useState<ContactFormData>(initialContactData)
  const [shippingData, setShippingData] = useState<ShippingAddressData>(initialShippingData)
  const [billingData, setBillingData] = useState<BillingAddressData>(initialBillingData)
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [orderNotes, setOrderNotes] = useState('')

  const [contactErrors, setContactErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({})
  const [shippingErrors, setShippingErrors] = useState<Partial<Record<keyof ShippingAddressData, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

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
  const isSubmitting = createOrder.isPending

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
      setShippingErrors(shippingResult.errors)
      if (!shippingResult.success || !billingResult.success) return
      setCompletedSteps((prev) => [...prev, 'envio'])
      setCurrentStep('pago')
      return
    }

    if (currentStep === 'pago') {
      if (!validatePaymentStep(paymentMethod)) return
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
    })

    try {
      const payload = await createOrder.mutateAsync(input)
      saveCheckoutConfirmation({
        ...payload,
        email: contactData.email.trim(),
        paymentMethod,
      })
      router.push(checkoutSuccessUrl(payload.orderNumber))
    } catch (error) {
      setSubmitError(getCheckoutErrorMessage(error))
    }
  }

  const getButtonText = () => {
    if (isSubmitting) return 'Procesando...'
    if (currentStep === 'informacion') return 'Continuar a envío'
    if (currentStep === 'envio') return 'Continuar a pago'
    if (currentStep === 'pago') {
      if (paymentMethod === 'card') return 'Crear pedido'
      if (paymentMethod === 'oxxo') return 'Crear pedido (OXXO)'
      if (paymentMethod === 'spei') return 'Crear pedido (SPEI)'
    }
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
              <ShippingAddressForm
                data={shippingData}
                onChange={setShippingData}
                errors={shippingErrors}
              />

              <Separator className="my-6" />

              <BillingAddressForm data={billingData} onChange={setBillingData} />

              <Separator className="my-6" />

              <ShippingMethodSelector
                selectedMethod={shippingMethod}
                onMethodChange={setShippingMethod}
                hasCustomization={hasCustomization}
              />

              <p className="mt-4 font-serif text-xs text-muted-foreground">
                El costo de envío se calculará en una fase posterior. Por ahora el pedido se crea
                con envío en $0.
              </p>
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
          <CheckoutOrderSummary summary={summary} />
        </div>
      </div>
    </CheckoutLayout>
  )
}


