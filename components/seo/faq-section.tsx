'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

interface FAQItem {
  question: string
  answer: string
}

interface FAQSectionProps {
  title: string
  subtitle?: string
  faqs: FAQItem[]
  className?: string
}

export function FAQSection({ title, subtitle, faqs, className }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className={cn('px-4 py-16 md:px-6 md:py-20', className)}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="font-sans text-3xl font-bold text-foreground md:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl font-serif text-lg text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        <div className="divide-y divide-border rounded-xl border border-border bg-card">
          {faqs.map((faq, index) => (
            <div key={index}>
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <span className="pr-4 font-sans font-medium text-foreground">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform',
                    openIndex === index && 'rotate-180'
                  )}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="font-serif text-muted-foreground">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
