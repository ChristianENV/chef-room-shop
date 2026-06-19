import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'
import type { AccountDesign } from '@/src/features/storefront/account/types'
import {
  CREATE_DESIGN_DRAFT_MUTATION,
  DESIGN_BY_ID_QUERY,
  SAVE_DESIGN_PREVIEW_MUTATION,
  UPDATE_DESIGN_MUTATION,
} from './customizer-designs.graphql'

type CreateDesignDraftData = { createDesignDraft: AccountDesign }
type UpdateDesignData = { updateDesign: AccountDesign }
type SaveDesignPreviewData = { saveDesignPreview: AccountDesign }
type DesignByIdData = { designById: AccountDesign | null }

export type CreateDesignDraftInput = {
  productId: string
  productVariantId?: string | null
  configJson: unknown
}

export type UpdateDesignInput = {
  designId: string
  configJson: unknown
}

export type SaveDesignPreviewInput = {
  designId: string
  previewUrl: string
  previewPublicId?: string | null
}

export async function createDesignDraft(input: CreateDesignDraftInput): Promise<AccountDesign> {
  const data = await fetchGraphQL<CreateDesignDraftData, { input: CreateDesignDraftInput }>({
    query: CREATE_DESIGN_DRAFT_MUTATION,
    variables: { input },
  })
  return data.createDesignDraft
}

export async function updateDesign(input: UpdateDesignInput): Promise<AccountDesign> {
  const data = await fetchGraphQL<UpdateDesignData, { input: UpdateDesignInput }>({
    query: UPDATE_DESIGN_MUTATION,
    variables: { input },
  })
  return data.updateDesign
}

export async function saveDesignPreview(input: SaveDesignPreviewInput): Promise<AccountDesign> {
  const data = await fetchGraphQL<SaveDesignPreviewData, { input: SaveDesignPreviewInput }>({
    query: SAVE_DESIGN_PREVIEW_MUTATION,
    variables: { input },
  })
  return data.saveDesignPreview
}

export async function getDesignById(designId: string): Promise<AccountDesign | null> {
  const data = await fetchGraphQL<DesignByIdData, { designId: string }>({
    query: DESIGN_BY_ID_QUERY,
    variables: { designId },
  })
  return data.designById
}
