export type AdminDesignCustomizationElement = {
  id: string
  type: string
  name: string | null
  text: string | null
  zone: string | null
}

export type AdminDesignCustomizationSummary = {
  size: string | null
  fabricColor: string | null
  fabricColorHex: string | null
  detailColor: string | null
  detailColorHex: string | null
  summaryLines: string[]
  elements: AdminDesignCustomizationElement[]
  previewBackUrl: string | null
}

export type AdminDesignListItem = {
  id: string
  shortId: string
  name: string | null
  previewUrl: string | null
  productName: string
  productSlug: string | null
  ownerType: string
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

export type AdminDesignDetail = AdminDesignListItem & {
  customizationSummary: AdminDesignCustomizationSummary
  configJson: unknown
}

export type AdminDesignsPayload = {
  items: AdminDesignListItem[]
  total: number
}

export type AdminDesignsFilter = {
  search?: string | null
  status?: string | null
  ownerType?: string | null
}

export type AdminDesignsListVariables = {
  filter?: AdminDesignsFilter | null
  limit?: number | null
  offset?: number | null
}

export type AdminDesignStatusFilter =
  | 'all'
  | 'DRAFT'
  | 'SAVED'
  | 'IN_CART'
  | 'PURCHASED'
  | 'ABANDONED'
  | 'ARCHIVED'

export type AdminDesignOwnerFilter = 'all' | 'USER' | 'GUEST'

export type AdminDesignsUiTableRow = {
  id: string
  shortId: string
  previewUrl: string | null
  productName: string
  ownerLabel: string
  customerName: string
  customerEmail: string | null
  status: string
  statusLabel: string
  finalPriceLabel: string
  currency: string
  createdAtLabel: string
  updatedAtLabel: string
  relatedOrderNumber: string | null
  relatedCartId: string | null
  relatedCartLabel: string | null
}
