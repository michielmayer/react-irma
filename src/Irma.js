import React, { useEffect, useRef, useState } from 'react'
import IrmaCore from '@privacybydesign/irma-core'
import IrmaClient from '@privacybydesign/irma-client'
import IrmaInit from './IrmaInit'
import '@privacybydesign/irma-css'
import QRCode from 'qrcode.react'

export default function Irma({ options: orgOptions, onResult, onError }) {
  const [state, setState] = useState('Loading')
  const [payload, setPayload] = useState()
  const [options, setOptions] = useState()
  const [isFinal, setIsFinal] = useState()
  const transitionFunction = useRef()

  useEffect(() => {
    const changeState = (newState, payloadd, isFinall) => {
      setState(newState)
      setPayload(payloadd)
      setIsFinal(isFinall)
    }

    function setup(tf, options) {
      transitionFunction.current = tf
      setOptions(options)
    }

    const irma = new IrmaCore(orgOptions)
    irma.use(IrmaClient)
    irma.use(IrmaInit)
    irma
      .start({ setup, changeState })
      .then((result) => onResult(result))
      .catch((error) => onError(error))
  }, [])

  const handleClick = (e) => {
    if (e.target.matches('[data-irma-glue-transition]')) {
      transitionFunction.current(
        e.target.getAttribute('data-irma-glue-transition')
      )
    }
  }

  if (!options) return <div>loading...</div>

  const translations = options.translations

  const stateLoading = [
    <div key='1' className='irma-web-loading-animation'>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
    </div>,
    <p key='2' dangerouslySetInnerHTML={{ __html: translations.loading }}></p>
  ]

  const stateShowingQRCode = payload && payload.qr && (
    <QRCode size={230} value={payload.qr} />
  )

  const stateShowingIrmaButton = [
    <a
      key='1'
      className='irma-web-button-link'
      href={payload && payload.mobile}
    >
      <button
        className='irma-web-button'
        dangerouslySetInnerHTML={{ __html: translations.button }}
      ></button>
    </a>,
    <p key='2'>
      <a
        data-irma-glue-transition='chooseQR'
        dangerouslySetInnerHTML={{ __html: translations.qrCode }}
      ></a>
    </p>
  ]

  const stateShowingQRCodeInstead = payload &&
    payload.qr && [
      <QRCode key='1' size={230} value={payload.qr} />,
      <p key='2'>
        <a
          data-irma-glue-transition='showIrmaButton'
          dangerouslySetInnerHTML={{ __html: translations.back }}
        ></a>
      </p>
    ]

  const stateContinueInIrmaApp = [
    <div key='1' className='irma-web-waiting-for-user-animation'></div>,
    <p key='2' dangerouslySetInnerHTML={{ __html: translations.app }}></p>,
    <p key='3'>
      <a
        data-irma-glue-transition='cancel'
        dangerouslySetInnerHTML={{ __html: translations.cancel }}
      ></a>
    </p>
  ]

  const stateCancelled = [
    <div key='1' className='irma-web-forbidden-animation'></div>,
    <p
      key='2'
      dangerouslySetInnerHTML={{ __html: translations.cancelled }}
    ></p>,
    <p key='3' className='irma-web-restart-button'>
      {!isFinal && (
        <a
          data-irma-glue-transition='restart'
          dangerouslySetInnerHTML={{ __html: translations.retry }}
        ></a>
      )}
    </p>
  ]

  const stateTimedOut = [
    <div key='1' className='irma-web-clock-animation'></div>,
    <p key='2' dangerouslySetInnerHTML={{ __html: translations.timeout }}></p>,
    <p key='3' className='irma-web-restart-button'>
      {!isFinal && (
        <a
          data-irma-glue-transition='restart'
          dangerouslySetInnerHTML={{ __html: translations.retry }}
        ></a>
      )}
    </p>
  ]

  const stateError = [
    <div key='1' className='irma-web-forbidden-animation'></div>,
    <p key='2' dangerouslySetInnerHTML={{ __html: translations.error }}></p>,
    <p key='3' className='irma-web-restart-button'>
      {!isFinal && (
        <a
          data-irma-glue-transition='restart'
          dangerouslySetInnerHTML={{ __html: translations.retry }}
        ></a>
      )}
    </p>
  ]

  const stateBrowserNotSupported = [
    <div key='1' className='irma-web-forbidden-animation'></div>,
    <p key='2' dangerouslySetInnerHTML={{ __html: translations.browser }}></p>
  ]

  const stateSuccess = [
    <div key='1' className='irma-web-checkmark-animation'></div>,
    <p key='2' dangerouslySetInnerHTML={{ __html: translations.success }}></p>
  ]

  const stateToPartialMapping = {
    Uninitialized: stateLoading,
    Loading: stateLoading,
    MediumContemplation: stateLoading,
    ShowingQRCode: stateShowingQRCode,
    ContinueOn2ndDevice: stateContinueInIrmaApp,
    ShowingIrmaButton: stateShowingIrmaButton,
    ShowingQRCodeInstead: stateShowingQRCodeInstead,
    ContinueInIrmaApp: stateContinueInIrmaApp,
    Cancelled: stateCancelled,
    TimedOut: stateTimedOut,
    Error: stateError,
    BrowserNotSupported: stateBrowserNotSupported,
    Success: stateSuccess,
    Aborted: null
  }

  function renderState() {
    const newPartial = stateToPartialMapping[state]
    if (!newPartial) {
      return console.log(`I don't know how to render '${state.newState}'`)
    }
    return newPartial
  }

  return (
    <div className='irma-web-form' onClick={handleClick}>
      <div
        className={`irma-web-header ${
          options.showHelper ? 'irma-web-show-helper' : ''
        }`}
      >
        <p dangerouslySetInnerHTML={{ __html: translations.header }}></p>
        <div className='irma-web-helper'>
          <p dangerouslySetInnerHTML={{ __html: translations.helper }}></p>
        </div>
        {options.showCloseButton && (
          <button className='irma-web-close'></button>
        )}
      </div>
      <div className='irma-web-content'>
        <div className='irma-web-centered'>{renderState(translations)}</div>
      </div>
    </div>
  )
}
