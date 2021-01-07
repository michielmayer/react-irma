import merge from 'deepmerge'

export default class IrmaInit {
  constructor({ stateMachine, options }) {
    this._stateMachine = stateMachine
    this._options = this._sanitizeOptions(options)
    this._lastPayload = null

    this._addVisibilityListener()
  }

  start({ setup, changeState }) {
    this._changeState = changeState

    setup((t) => {
      // Check for validity of function to prevent errors when multiple events are cached.
      if (this._stateMachine.isValidTransition(t))
        this._stateMachine.transition(t, this._lastPayload)
    }, this._options)
  }

  stateChange(state) {
    const { newState, payload, isFinal } = state
    this._lastPayload = payload
    if (this._changeState) this._changeState(newState, payload, isFinal)

    switch (newState) {
      case 'ShowingQRCode':
      case 'ShowingQRCodeInstead':
        break

      case 'ShowingIrmaButton':
        break

      default:
        if (isFinal) this._removeVisibilityListener()
        break
    }
  }

  _sanitizeOptions(options) {
    const defaults = {
      showHelper: false,
      // translations: translations[options.language || 'nl']
      translations: require(`./translations/${options.language || 'nl'}`)
    }

    return merge(defaults, options)
  }

  _addVisibilityListener() {
    const onVisibilityChange = () => {
      if (this._stateMachine.currentState() !== 'TimedOut' || document.hidden)
        return
      if (this._stateMachine.isValidTransition('restart')) {
        if (this._options.debugging)
          console.log('🖥 Restarting because document became visible')
        this._stateMachine.transition('restart')
      }
    }
    const onFocusChange = () => {
      if (this._stateMachine.currentState() !== 'TimedOut') return
      if (this._stateMachine.isValidTransition('restart')) {
        if (this._options.debugging)
          console.log('🖥 Restarting because window regained focus')
        this._stateMachine.transition('restart')
      }
    }
    const onResize = () => {
      if (this._stateMachine.isValidTransition('checkUserAgent'))
        this._stateMachine.transition('checkUserAgent', this._lastPayload)
    }

    if (typeof document !== 'undefined' && document.addEventListener)
      document.addEventListener('visibilitychange', onVisibilityChange)

    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('focus', onFocusChange)
      window.addEventListener('resize', onResize)
    }

    this._removeVisibilityListener = () => {
      if (typeof document !== 'undefined' && document.removeEventListener)
        document.removeEventListener('visibilitychange', onVisibilityChange)
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('focus', onFocusChange)
        window.removeEventListener('resize', onResize)
      }
    }
  }
}
