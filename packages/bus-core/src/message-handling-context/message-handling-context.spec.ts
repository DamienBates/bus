import { TransportMessage } from '../transport'
import { messageHandlingContext } from './message-handling-context'

const buildTransportMessage = (): TransportMessage<unknown> => ({
  id: 'a',
  raw: {},
  attributes: { attributes: {}, stickyAttributes: {} },
  domainMessage: { $name: 'a', $version: 1 }
})

describe('messageHandlingContext', () => {
  beforeAll(() => {
    messageHandlingContext.enable()
  })

  afterAll(() => {
    messageHandlingContext.disable()
  })

  describe('when a message is added', () => {
    it('should retrieve the message from within the same context', () => {
      messageHandlingContext.runAndReturn(() => {
        const message = buildTransportMessage()
        messageHandlingContext.set(message)
        const retrievedMessage = messageHandlingContext.get()!
        expect(retrievedMessage).toEqual(message)
      })
    })

    it('should not retrieve a message from a different context', async () => {
      await messageHandlingContext.runAndReturn(async () => {
        const context1 = new Promise<void>(resolve => {
          const message = buildTransportMessage()
          messageHandlingContext.set(message)
          const retrievedMessage = messageHandlingContext.get()!
          expect(retrievedMessage).toEqual(message)
          resolve()
        })
        const context2 = new Promise<void>(resolve => {
          const message = buildTransportMessage()
          messageHandlingContext.set(message)
          const retrievedMessage = messageHandlingContext.get()!
          expect(retrievedMessage).toEqual(message)
          resolve()
        })
        await Promise.all([context1, context2])
      })
    })

    it('should retrieve a message from a nested async chain', async () => {
      await messageHandlingContext.runAndReturn(async () => {
        const message = buildTransportMessage()
        messageHandlingContext.set(message)

        await new Promise<void>(resolve => {
          const retrievedMessage = messageHandlingContext.get()!
          expect(retrievedMessage).toEqual(message)
          resolve()
        })
      })
    })
  })
})
