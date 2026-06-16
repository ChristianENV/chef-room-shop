export type AdminDesignOwnerType = 'USER' | 'GUEST'

export type AdminDesignCustomizationElementGql = {
  id: string
  type: string
  name: string | null
  text: string | null
  zone: string | null
}

export type AdminDesignCustomizationSummaryGql = {
  size: string | null
  fabricColor: string | null
  fabricColorHex: string | null
  detailColor: string | null
  detailColorHex: string | null
  summaryLines: string[]
  elements: AdminDesignCustomizationElementGql[]
  previewBackUrl: string | null
}

export type AdminDesignListItemGql = {
  id: string
  shortId: string
  name: string | null
  previewUrl: string | null
  productName: string
  productSlug: string | null
  ownerType: AdminDesignOwnerType
  customerName: string | null
  customerEmail: string | null
  status: string
  finalPriceCents: number | null
  currency: string
  createdAt: string
  updatedAt: string
  relatedOrderNumber: string | null
  relatedCartId: string | null
  relatedCartStatus: string | null
}

export type AdminDesignDetailGql = AdminDesignListItemGql & {
  customizationSummary: AdminDesignCustomizationSummaryGql
  configJson: unknown
}

export type AdminDesignsPayloadGql = {
  items: AdminDesignListItemGql[]
  total: number
}

export type AdminDesignsFilterInput = {
  search?: string | null
  status?: string | null
  ownerType?: string | null
}

export type AdminDesignsListInput = {
  filter?: AdminDesignsFilterInput | null
  limit?: number | null
  offset?: number | null
}
