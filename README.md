**DEPRECATED** This project is unmantained, deprecated and goes into archive with followup removal in 2 years.

# frontend-unit-tests-examples

> How to write unit tests in our current frontend stack.

This project is built with [`@mercateo/ws`](https://github.com/Mercateo/ws). We assume you use an alias like `alias ws="npm run -s ws --"` to use it.

To build and serve the app call `ws watch`. To run the unit tests call `ws unit`.

# Frameworks

Here is a breakdown of all involved frameworks:

* [`expect`](https://github.com/mjackson/expect): Our assertion framework (e.g. `expect(foo).toBe(bar)`). Includes support for [spies](https://github.com/mjackson/expect#spies).
* [Mocha](https://mochajs.org/): Our test framework responsible for structuring (e.g. `decribe`, `it`) and reporting.
* [Karma](karma-runner.github.io/): Our test runner which takes care of launching browsers.
* [`react-test-renderer`](https://www.npmjs.com/package/react-test-renderer) (and [`react-dom/test-utils`](https://facebook.github.io/react/docs/test-utils.html)): A lib for basic React tests. (`react-addons-test-utils` is deprecated.)
* [Enzyme](http://airbnb.io/enzyme/): A lib for more complex React tests.
* [InversifyJS](http://inversify.io/): Used for dependency injection/inversion of control in some of our packages.
* [PhantomJS](http://phantomjs.org/): A headless browser which is used to execute the tests. (It is based on WebKit and has the same APIs as a real browser, but starts faster.)
* [`import-inject-loader`](https://github.com/Mercateo/import-inject-loader): A WebPack loader which can add new APIs to your modules at build time, so you can override `import`'s or globals with mocks in your tests.

Note that we don't really use a mocking library in our stack. In most cases this is not necessary due to the dynamic nature of JavaScript. We just write down what we need. However [@otbe](https://github.com/otbe) experimented with writing a TypeScript specific mocking library called [`emock`](https://github.com/otbe/emock). It was quite nice, but we don't really used it so far.

# Overview

In [`src/`](./src) you can find basic components written with our current stack: React, MobX and TypeScript.

* [`src/component.tsx`](./src/component.tsx) exports `<Add />`. This is a stateless functional component which uses the function `add` from [`src/function.ts`](./src/function.ts).
* [`src/component-with-add-prop.tsx`](./src/component-with-add-prop.tsx) exports `<Add2 />`. This is the same component as `<Add />`, but `add` can be overwritten via `props`.
* [`src/component-with-interaction.tsx`](./src/component-with-interaction.tsx) exports `<Counter />`. This is a stateful class component to showcase testing of dynamic state based on user interactions.
* [`src/component-with-fetching.tsx`](./src/component-with-fetching.tsx) exports `<FetchUser />`. This stateful class component showcases the testing of components which request data.
* [`src/component-with-fetching-2.tsx`](./src/component-with-fetching-2.tsx) and [`src/component-with-fetching-di.tsx`](./src/component-with-fetching-di.tsx) are variations of `<FetchUser />` similar to like `<Add2 />` is a variation of `<Add />` to make `fetch` overwriteable.

In [`tests/`](./tests/) you can find the according tests:

* [`tests/function.ts`](./tests/function.ts) shows you the most basic test of a JavaScript function.
* [`tests/component-without-enzyme.tsx`](./tests/component-without-enzyme.tsx) shows you a basictest of a React component with `'react-addons-test-utils'`. The same test written with `'enzyme'` can be found in [`tests/component-with-enzyme.tsx`](./tests/component-with-enzyme.tsx).
* [`tests/component-with-spy.tsx`](./tests/component-with-spy.tsx) shows you how to use spies.
* [`tests/component-with-interaction.tsx`](./tests/component-with-interaction.tsx) shows you how to fake user interactions.
* [`tests/component-with-fetching.tsx`](./tests/component-with-fetching.tsx), [`tests/component-with-fetching-2.tsx`](./tests/component-with-fetching-2.tsx) and [`tests/component-with-fetching-di.tsx`](./tests/component-with-fetching-di.tsx) shows you how to mock http requests via re-assigning `fetch` or with dependency injection.
* [`tests/component-with-import-inject-loader.tsx`](./tests/component-with-import-inject-loader.tsx) shows the usage of `import-inject-loader` in the components `<FetchUser />` and `<Add />`.

# Good to know

To run a single test write `it.only(...)` instead of `it(...)`. To ignore a single test write `it.skip(...)`. The same is true for test suites created with `describe` (e.g. `describe.only` and `describe.skip`).

# Gotchas

PhantomJS is based on Chrome and like other browsers PhantomJS becomes _old_. That's why we typically need similar polyfills in our tests like we use in our real app (e.g. `babel-polyfill` for `Object.assign`).

For primitive values there is no real difference between `expect(foo).toBe(bar)` and `expect(foo).toEqual(bar)`. `toBe` means _"the same"_ and is like a strict comparison with `===`. E.g. `expect(foo).toBe(bar)` is the same as `expect(foo === bar).toBe(true)`. On the other hand `toEqual` checks if two objects look alike - it compares all keys and values in the object with each other. I'd default to use `toBe` as it is more _strict_.

The line numbers in the stack trace are currently allways a little bit off... that happens because of incorrect source maps. But the file name should be allways correct.

# Other approaches

Many people prefer [Jest](https://facebook.github.io/jest/) nowadays. It's fast, because it is only run inside a Node environment - not inside a browser engine. So you have to mock _all_ Browser APIs (e.g. the DOM). Of course most people have done this already in open source projects. But it feels _odd_ to test your code inside a different environment where it will be executed by the user.

Jest features Snapshot testing. This can be usefull for testing something liek complex React trees. You capture a _know good result_ and use it for test to see, if your result changes _anywhere_. However this tests really _everything_ and some things are likely to change often (like styling), so it could be possible that you would need to update your snapshots very often - even if your test is not interested in styling differences. However... this can be avoided, if you write custom serializers. At the end it depends on your use case.

Another interesting approach is [`html-looks-like`](https://github.com/staltz/html-looks-like) which only tests what "looks like" something.
