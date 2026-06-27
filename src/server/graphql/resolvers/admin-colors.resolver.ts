import {
  archiveAdminColor,
  createAdminColor,
  getAdminColorById,
  getAdminColors,
  updateAdminColor,
} from '../modules/admin-colors/admin-colors.service'

export const adminColorsResolvers = {
  Query: {
    adminColors: (_parent: unknown, args: { includeInactive?: boolean | null }, context: unknown) =>
      getAdminColors(context as Parameters<typeof getAdminColors>[0], args),
    adminColorById: (_parent: unknown, args: { id: string }, context: unknown) =>
      getAdminColorById(context as Parameters<typeof getAdminColorById>[0], args.id),
  },
  Mutation: {
    createAdminColor: (_parent: unknown, args: { input: unknown }, context: unknown) =>
      createAdminColor(
        context as Parameters<typeof createAdminColor>[0],
        args.input as Parameters<typeof createAdminColor>[1],
      ),
    updateAdminColor: (
      _parent: unknown,
      args: { id: string; input: unknown },
      context: unknown,
    ) =>
      updateAdminColor(
        context as Parameters<typeof updateAdminColor>[0],
        args.id,
        args.input as Parameters<typeof updateAdminColor>[2],
      ),
    archiveAdminColor: (_parent: unknown, args: { id: string }, context: unknown) =>
      archiveAdminColor(context as Parameters<typeof archiveAdminColor>[0], args.id),
  },
}
