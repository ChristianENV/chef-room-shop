import Module from 'node:module'

const originalLoad = Module.prototype.require

Module.prototype.require = function (this: NodeModule, id: string) {
  if (id === 'server-only') {
    return {}
  }

  return originalLoad.call(this, id)
}
