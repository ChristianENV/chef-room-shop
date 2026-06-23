import type { GraphQLContext } from '../context'
import {
  getColors,
  getCustomizationRulesByProduct,
  getProductBySlug,
  getProducts,
  getProductTypes,
  getSizes,
} from '../modules/catalog/catalog.service'
import type { GetProductsInput } from '../modules/catalog/catalog.types'

type ProductsQueryArgs = {
  filter?: GetProductsInput['filter']
  sort?: GetProductsInput['sort']
  limit?: number | null
  offset?: number | null
}

type ProductBySlugArgs = {
  slug: string
}

type CustomizationRulesByProductArgs = {
  productId: string
}

export const catalogResolvers = {
  Query: {
    products: (_parent: unknown, args: ProductsQueryArgs, context: GraphQLContext) =>
      getProducts(context.prisma, {
        filter: args.filter,
        sort: args.sort,
        limit: args.limit,
        offset: args.offset,
      }),

    productBySlug: (_parent: unknown, args: ProductBySlugArgs, context: GraphQLContext) =>
      getProductBySlug(context.prisma, args.slug),

    productTypes: (_parent: unknown, _args: unknown, context: GraphQLContext) =>
      getProductTypes(context.prisma),

    colors: (_parent: unknown, _args: unknown, context: GraphQLContext) =>
      getColors(context.prisma),

    sizes: (_parent: unknown, _args: unknown, context: GraphQLContext) => getSizes(context.prisma),

    customizationRulesByProduct: (
      _parent: unknown,
      args: CustomizationRulesByProductArgs,
      context: GraphQLContext,
    ) => getCustomizationRulesByProduct(context.prisma, args.productId),
  },
}
