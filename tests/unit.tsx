import 'babel-polyfill';
import 'reflect-metadata';
import 'whatwg-fetch';
import './function';
import './component-without-enzyme';
import './component-with-enzyme';
import './component-with-spy';
import './component-with-interaction';
import './component-with-fetching';
import './component-with-fetching-2';
import './component-with-fetching-di';
import './component-with-import-inject-loader';

// instead of manually importing all tests, we could use a context based import like this:
// const testsContext = require.context('.', true, /\.(ts|tsx)$/);
// testsContext.keys().forEach(testsContext);
