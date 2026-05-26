/**
 * GraphQL mutations for authenticated account BFF (requires session cookie).
 */

export const UPDATE_MY_PROFILE_MUTATION = /* GraphQL */ `
  mutation UpdateMyProfile($input: UpdateMyProfileInput!) {
    updateMyProfile(input: $input) {
      id
      email
      firstName
      lastName
      phone
      marketingOptIn
      roles
    }
  }
`

export const CREATE_MY_ADDRESS_MUTATION = /* GraphQL */ `
  mutation CreateMyAddress($input: MyAddressInput!) {
    createMyAddress(input: $input) {
      id
      type
      street
      city
      state
      postalCode
      country
      isDefault
    }
  }
`

export const UPDATE_MY_ADDRESS_MUTATION = /* GraphQL */ `
  mutation UpdateMyAddress($id: ID!, $input: MyAddressInput!) {
    updateMyAddress(id: $id, input: $input) {
      id
      type
      street
      city
      state
      postalCode
      country
      isDefault
    }
  }
`

export const DELETE_MY_ADDRESS_MUTATION = /* GraphQL */ `
  mutation DeleteMyAddress($id: ID!) {
    deleteMyAddress(id: $id)
  }
`

export const SET_DEFAULT_ADDRESS_MUTATION = /* GraphQL */ `
  mutation SetDefaultAddress($id: ID!, $type: String!) {
    setDefaultAddress(id: $id, type: $type) {
      id
      type
      isDefault
    }
  }
`

const ACCOUNT_PAYMENT_STATUS_FIELDS = /* GraphQL */ `
  orderNumber
  orderStatus
  paymentStatus
  paymentMethod
  canRetryPayment
  canContinuePayment
  paymentRedirectUrl
  checkedAt
  message
`

export const VERIFY_MY_ORDER_PAYMENT_MUTATION = /* GraphQL */ `
  mutation VerifyMyOrderPayment($orderNumber: String!) {
    verifyMyOrderPayment(orderNumber: $orderNumber) {
      ${ACCOUNT_PAYMENT_STATUS_FIELDS}
    }
  }
`

export const RETRY_MY_ORDER_PAYMENT_MUTATION = /* GraphQL */ `
  mutation RetryMyOrderPayment($orderNumber: String!) {
    retryMyOrderPayment(orderNumber: $orderNumber) {
      ${ACCOUNT_PAYMENT_STATUS_FIELDS}
    }
  }
`
