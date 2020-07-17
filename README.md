## cypress-autostub
This plugin for the [Cypress automation framework](https://www.cypress.io/) alleviates the need to mantain brittle manual mocks by automating the **recording** and **stubbing** of requests.


#### Features
- Written in Typescript, strongly typed interfaces for all functions
- Global default configs in JS
- Local spec configs to override globals
- Simple to setup + mantain, plug-n-play auto mocking
- CI/Robot friendly (record with an env variable)

### API Docs
View the API docs [here](https://dan-cooke.github.io/cypress-autostub/index.html)

### Installation

```
yarn install cypress-autostub
```

----

### Setup
Setup the plugin along with any desired [global settings](https://dan-cooke.github.io/cypress-autostub/interfaces/_types_.autostubglobalconfig.html) in `cypress/plugins/index.js`

```javascript
// Import the plugin
import { autoStubSetup } from 'cypress-autostub'

module.exports = (on, config) => {
    autoStubSetup(on, {
        // Global settings go here
    })
}
```


Import the stubbing/recording function in your spec files

**example.spec.js**
```javascript
import { autoStub } from 'cypress-autostub'

describe('Some Feature', () => {

    beforeEach(() => {
        // Put it in a before each
        autoStub()

    })
    it('should do the thing', () => {
        // Or even at the test level
        autoStub()

    })
})
```

And you are good to go!

----


### Recording
Recording is the process of listening to the network requests that are fired during the execution of your test, and writing the responses to disk.

#### Mock Files
Mock files are stored on disk in a format that can be directly plugged into `cy.route`.

The default location for these mock responses to be stored is `cypress/mocks` but this can be configured [globally](#global-settings)

The name of the mock file is tied to:

a: The currently executing spec

b: The currently executing test

So if you are running the following test in `SomePage/example.spec.js`:

```javascript
describe('MyFeature', () => {
    it('should do a really important thing')
})
```

The mock file will by default be stored at:

>cypress/mocks/SomePage/example/should do a really important thing.json


> **Note:** The spacing in the file name is something I was not entirely happy with , and may be subject to change (or be configurable)

#### When does it record?
Provided the currently executing spec file has called `autoStub` , the plugin will begin recording if any of the following are true:

1. `CYPRESS_FORCE_RECORD` is set in the environment
2. `forceRecord: true` is set [globally](https://dan-cooke.github.io/cypress-autostub/interfaces/_types_.autostubglobalconfig.html)
3. `forceRecord: true` is set [locally](#local-settings)

#### Force recording
There is no such thing as "cleaning" up your mock files. If a mock file already exists and the plugin is **force recording**. The previous mock file will be overwritten.

I believe this is the least error prone method of mantaining the mock files.

----

### Stubbing
Stubbing is very simply calling:
```
cy.route()
```

With the data stored in the [mock files](#mock-files) used as arguments for the `cy.route`


----

### Troubleshooting

#### How can I stub/record my fetch requests?
Cypress currently only supports XHR requests. However...
Theres an [open issue](https://github.com/cypress-io/cypress/issues/95) on Cypress with many suggested workarounds for converting your fetch requests into XHR

And more recently theres an `experimentalFetchPolyfill` option which you can enable in your `cypress.json`
