import type { GraphQLContext } from '../context'
import {
  createDesignDraft,
  deleteDesignDraft,
  getDesignById,
  saveDesignPreview,
  updateDesign,
} from '../modules/designs/designs.service'
import type {
  CreateDesignDraftInput,
  DeleteDesignDraftInput,
  SaveDesignPreviewInput,
  UpdateDesignInput,
} from '../modules/designs/designs.types'

type CreateDesignDraftArgs = { input: CreateDesignDraftInput }
type UpdateDesignArgs = { input: UpdateDesignInput }
type SaveDesignPreviewArgs = { input: SaveDesignPreviewInput }
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

    deleteDesignDraft: (
      _parent: unknown,
      args: DeleteDesignDraftArgs,
      context: GraphQLContext,
    ) => deleteDesignDraft(context, args.input),
  },
}
