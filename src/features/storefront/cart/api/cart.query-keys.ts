export const cartQueryKeys = {
  all: ['cart'] as const,
  myCart: () => [...cartQueryKeys.all, 'myCart'] as const,
}
