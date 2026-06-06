import Module from 'node:module'

const originalLoad = Module.prototype.require

Module.prototype.require = function (this: NodeModule, id: string) {
  if (id === 'server-only') {
    return {}
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return originalLoad.apply(this, arguments as any)
}
