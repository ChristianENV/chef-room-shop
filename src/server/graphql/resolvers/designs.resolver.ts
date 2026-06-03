import type { GraphQLContext } from '../context'
import {
  confirmDesignAssetUpload,
  confirmDesignPreviewUpload,
  createDesignAssetUpload,
  createDesignDraft,
  createDesignPreviewUpload,
  deleteDesignDraft,
  getDesignById,
  saveDesignPreview,
  updateDesign,
} from '../modules/designs/designs.service'
import type {
  ConfirmDesignAssetUploadInput,
  ConfirmDesignPreviewUploadInput,
  CreateDesignAssetUploadInput,
  CreateDesignDraftInput,
  CreateDesignPreviewUploadInput,
  DeleteDesignDraftInput,
  SaveDesignPreviewInput,
  UpdateDesignInput,
} from '../modules/designs/designs.types'

type CreateDesignDraftArgs = { input: CreateDesignDraftInput }
type UpdateDesignArgs = { input: UpdateDesignInput }
type SaveDesignPreviewArgs = { input: SaveDesignPreviewInput }
type CreateDesignPreviewUploadArgs = { input: CreateDesignPreviewUploadInput }
type ConfirmDesignPreviewUploadArgs = { input: ConfirmDesignPreviewUploadInput }
type CreateDesignAssetUploadArgs = { input: CreateDesignAssetUploadInput }
type ConfirmDesignAssetUploadArgs = { input: ConfirmDesignAssetUploadInput }
type DeleteDesignDraftArgs = { input: DeleteDesignDraftInput }
type DesignByIdArgs = { designId: string }

export const designsResolvers = {
  Query: {
    designById: (
      _parent: unknown,
      args: DesignByIdArgs,
      context: GraphQLContext,
    ) => getDesignById(context, args.designId),
  },
  Mutation: {
    createDesignDraft: (
      _parent: unknown,
      args: CreateDesignDraftArgs,
      context: GraphQLContext,
    ) => createDesignDraft(context, args.input),

    updateDesign: (
      _parent: unknown,
      args: UpdateDesignArgs,
      context: GraphQLContext,
    ) => updateDesign(context, args.input),

    saveDesignPreview: (
      _parent: unknown,
      args: SaveDesignPreviewArgs,
      context: GraphQLContext,
    ) => saveDesignPreview(context, args.input),

    createDesignPreviewUpload: (
      _parent: unknown,
      args: CreateDesignPreviewUploadArgs,
      context: GraphQLContext,
    ) => createDesignPreviewUpload(context, args.input),

    confirmDesignPreviewUpload: (
      _parent: unknown,
      args: ConfirmDesignPreviewUploadArgs,
      context: GraphQLContext,
    ) => confirmDesignPreviewUpload(context, args.input),

    createDesignAssetUpload: (
      _parent: unknown,
      args: CreateDesignAssetUploadArgs,
      context: GraphQLContext,
    ) => createDesignAssetUpload(context, args.input),

    confirmDesignAssetUpload: (
      _parent: unknown,
      args: ConfirmDesignAssetUploadArgs,
      context: GraphQLContext,
    ) => confirmDesignAssetUpload(context, args.input),

    deleteDesignDraft: (
      _parent: unknown,
      args: DeleteDesignDraftArgs,
      context: GraphQLContext,
    ) => deleteDesignDraft(context, args.input),
  },
}
