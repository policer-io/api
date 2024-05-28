import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { diff } from 'deep-object-diff'
import { ChangeLogger } from '../@types/change'
import { ChangeCreate, Diff, ModelName } from '../models'

const plugin: FastifyPluginAsync = async function (server) {
  server.log.debug('Change logger plugin registering...')

  server.decorate<ChangeLogger<Exclude<ModelName, 'Change'>>>('change', {
    log: async function (modelName, type, original, changed) {
      const forward = diff(original || {}, changed || {}) as Diff
      const backward = diff(changed || {}, original || {}) as Diff
      const document = changed?._id || original?._id
      const change: ChangeCreate = {
        document,
        modelName,
        type,
        diffs: {
          forward,
          backward,
        },
        application: modelName === 'Application' ? changed?._id || original?._id : changed?.application || original?.application,
        tenant: modelName === 'Tenant' ? changed?._id || original?._id : changed?.tenant || original?.tenant,
      }
      const entry = new server.models.Change(change)
      await entry.save()
    },
  })

  server.log.debug('Change logger plugin registerd')
}

export default fp(plugin, {
  name: 'change',
  decorators: {
    fastify: ['models'],
  },
  dependencies: ['models', 'change-model'],
})
