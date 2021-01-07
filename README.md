# React Irma

> React version of [irma-frontend](https://github.com/privacybydesign/irma-frontend-packages/tree/master/irma-frontend) 

## Install

```bash
npm install react-irma
```

## Usage

Make sure your server accepts CORS requests. ([for Node](https://expressjs.com/en/resources/middleware/cors.html#simple-usage-enable-all-cors-requests))

```jsx
import React from 'react'
import Irma from 'react-irma'

const options = {
  debugging: false,
  language: 'nl',
  session: {
    url: 'http://localhost:4020',
    start: {
      url: (o) => `${o.url}/session`,
      method: 'GET',
    },
    mapping: {
      sessionPtr: (r) => r,
    },
    result: false,
  },
};

function App() {
  function onResult(result) {
    console.log('Successful disclosure! 🎉', result);
  }
  
  function onError(error) {
    console.error("Couldn't do what you asked 😢", error);
  }
  
  return (
		<Irma options={options} onResult={onResult} onError={onError} />
  );
}

export default App;
```

## License

MIT © [Michiel Mayer](https://github.com/michielmayer)