import type { GraphQLContext } from '../context'
import {
  createMyAddress,
  deleteMyAddress,
  getMeProfile,
  getMyAccountSummary,
  getMyAddresses,
  getMyDesigns,
  getMyOrderByNumber,
  getMyOrders,
  setDefaultAddress,
  updateMyAddress,
  updateMyProfile,
} from '../modules/account/account.service'
import {
  retryMyOrderPayment,
  verifyMyOrderPayment,
} from '../modules/account/account-payment.service'
import type {
  MyAddressInput,
  MyDesignsInput,
  PaginationInput,
  UpdateMyProfileInput,
} from '../modules/account/account.types'

type PaginationArgs = PaginationInput

type MyDesignsArgs = MyDesignsInput

type OrderByNumberArgs = {
  orderNumber: string
}

type UpdateMyProfileArgs = {
  input: UpdateMyProfileInput
}

type CreateMyAddressArgs = {
  input: MyAddressInput
}

type UpdateMyAddressArgs = {
  id: string
  input: MyAddressInput
}

type DeleteMyAddressArgs = {
  id: string
}

type SetDefaultAddressArgs = {
  id: string
  type: string
}

type OrderNumberArgs = {
  orderNumber: string
}

export const accountResolvers = {
  Query: {
    meProfile: (_parent: unknown, _args: unknown, context: GraphQLContext) => getMeProfile(context),

    myAccountSummary: (_parent: unknown, _args: unknown, context: GraphQLContext) =>
      getMyAccountSummary(context),

    myOrders: (_parent: unknown, args: PaginationArgs, context: GraphQLContext) =>
      getMyOrders(context, args),

    myOrderByNumber: (_parent: unknown, args: OrderByNumberArgs, context: GraphQLContext) =>
      getMyOrderByNumber(context, args.orderNumber),

    myDesigns: (_parent: unknown, args: MyDesignsArgs, context: GraphQLContext) =>
      getMyDesigns(context, args),

    myAddresses: (_parent: unknown, _args: unknown, context: GraphQLContext) =>
      getMyAddresses(context),
  },

  Mutation: {
    updateMyProfile: (_parent: unknown, args: UpdateMyProfileArgs, context: GraphQLContext) =>
      updateMyProfile(context, args.input),

    createMyAddress: (_parent: unknown, args: CreateMyAddressArgs, context: GraphQLContext) =>
      createMyAddress(context, args.input),

    updateMyAddress: (_parent: unknown, args: UpdateMyAddressArgs, context: GraphQLContext) =>
      updateMyAddress(context, args.id, args.input),

    deleteMyAddress: (_parent: unknown, args: DeleteMyAddressArgs, context: GraphQLContext) =>
      deleteMyAddress(context, args.id),

    setDefaultAddress: (_parent: unknown, args: SetDefaultAddressArgs, context: GraphQLContext) =>
      setDefaultAddress(context, args.id, args.type),

    verifyMyOrderPayment: (_parent: unknown, args: OrderNumberArgs, context: GraphQLContext) =>
      verifyMyOrderPayment(context, args.orderNumber),

    retryMyOrderPayment: (_parent: unknown, args: OrderNumberArgs, context: GraphQLContext) =>
      retryMyOrderPayment(context, args.orderNumber),
  },
}
