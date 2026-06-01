import type { GraphQLContext } from '../context'
import {
  confirmAvatarUpload,
  confirmProductImageUpload,
  createAvatarUpload,
  createProductImageUpload,
} from '../modules/uploads/uploads.service'
import type {
  ConfirmAvatarUploadInput,
  ConfirmProductImageUploadInput,
  CreateAvatarUploadInput,
  CreateProductImageUploadInput,
} from '../modules/uploads/uploads.types'

type CreateAvatarArgs = { input: CreateAvatarUploadInput }
type ConfirmAvatarArgs = { input: ConfirmAvatarUploadInput }
type CreateProductImageArgs = { input: CreateProductImageUploadInput }
type ConfirmProductImageArgs = { input: ConfirmProductImageUploadInput }

export const uploadsResolvers = {
  Mutation: {
    createAvatarUpload: (
      _parent: unknown,
      args: CreateAvatarArgs,
      context: GraphQLContext,
    ) => createAvatarUpload(context, args.input),

    confirmAvatarUpload: (
      _parent: unknown,
      args: ConfirmAvatarArgs,
      context: GraphQLContext,
    ) => confirmAvatarUpload(context, args.input),

    createProductImageUpload: (
      _parent: unknown,
      args: CreateProductImageArgs,
      context: GraphQLContext,
    ) => createProductImageUpload(context, args.input),

    confirmProductImageUpload: (
      _parent: unknown,
      args: ConfirmProductImageArgs,
      context: GraphQLContext,
    ) => confirmProductImageUpload(context, args.input),
  },
}
