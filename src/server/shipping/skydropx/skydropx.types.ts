/** OAuth token response (Skydropx PRO /api/v1/oauth/token). */
export type SkydropxOAuthTokenResponse = {
  access_token: string
  token_type?: string
  expires_in: number
  scope?: string
}

export type SkydropxAddressInput = {
  country_code: string
  postal_code: string
  area_level1: string
  area_level2: string
  area_level3: string
  street1?: string
  name?: string
  company?: string
  phone?: string
  email?: string
  reference?: string
  further_information?: string
  tax_id_number?: string
  address_template_id?: string
}

export type SkydropxParcelInput = {
  length: number
  width: number
  height: number
  weight: number
  package_protected?: boolean
  declared_value?: number
}

export type SkydropxCreateQuotationRequest = {
  quotation: {
    order_id?: string
    address_from: SkydropxAddressInput
    address_to: SkydropxAddressInput
    parcels: SkydropxParcelInput[]
    requested_carriers?: string[]
  }
}

export type SkydropxCreateShipmentRequest = {
  shipment: {
    rate_id: string
    printing_format?: 'standard' | 'thermal'
    original_shipment_id?: string
    address_from?: SkydropxAddressInput & {
      street1?: string
      name?: string
      company?: string
      phone?: string
      email?: string
    }
    address_to?: SkydropxAddressInput & {
      street1?: string
      name?: string
      company?: string
      phone?: string
      email?: string
    }
    packages?: Array<{
      package_number: string
      consignment_note: string
      package_type: string
    }>
  }
}

export type SkydropxCancelShipmentRequest = Record<string, never>

export type SkydropxTrackingQuery = {
  tracking_number: string
  carrier_name: string
}

/** Opaque API payloads — validated in mappers. */
export type SkydropxQuotationResponse = Record<string, unknown>
export type SkydropxShipmentResponse = Record<string, unknown>
