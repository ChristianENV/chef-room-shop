import type { SkydropxAddressInput } from './skydropx.types'
import { truncateSkydropxReference, SKYDROPX_FURTHER_INFO_MAX_LENGTH } from './skydropx-field-limits'

/**
 * Canonical label address (maps to Skydropx v1 address_from / address_to).
 */
export type SkydropxLabelAddress = {
  address: string
  internal_number: string
  reference: string
  sector: string
  city: string
  state: string
  postal_code: string
  country: string
  person_name: string
  company: string
  phone: string
  email: string
  further_information?: string
}

/**
 * Maps canonical label address to POST /api/v1/shipments address object.
 * sector → area_level3, address + internal_number → street1, country → country_code.
 */
export function toSkydropxV1AddressInput(label: SkydropxLabelAddress): SkydropxAddressInput {
  const street1 = [label.address.trim(), label.internal_number.trim()]
    .filter(Boolean)
    .join(' ')
    .trim()

  return {
    country_code: label.country,
    postal_code: label.postal_code,
    area_level1: label.state,
    area_level2: label.city,
    area_level3: label.sector,
    street1,
    name: label.person_name,
    company: label.company || label.person_name,
    phone: label.phone,
    email: label.email,
    reference: truncateSkydropxReference(label.reference || label.sector),
    ...(label.further_information?.trim()
      ? {
          further_information: label.further_information
            .trim()
            .slice(0, SKYDROPX_FURTHER_INFO_MAX_LENGTH),
        }
      : {}),
  }
}

const LABEL_ADDRESS_KEYS: (keyof SkydropxLabelAddress)[] = [
  'address',
  'internal_number',
  'reference',
  'sector',
  'city',
  'state',
  'postal_code',
  'country',
  'person_name',
  'company',
  'phone',
  'email',
]

/**
 * Summarizes which canonical fields are present (for SKYDROPX_DEBUG).
 */
export function summarizeLabelAddressForDebug(
  label: SkydropxLabelAddress,
  role: 'shipper' | 'recipient',
): Record<string, unknown> {
  const present: string[] = []
  const missing: string[] = []

  for (const key of LABEL_ADDRESS_KEYS) {
    const value = label[key]
    if (typeof value === 'string' && value.trim().length > 0) {
      present.push(key)
    } else {
      missing.push(key)
    }
  }

  return {
    role,
    present,
    missing,
    phoneLength: label.phone.length,
    postal_code: label.postal_code,
    country: label.country,
  }
}
