import 'babel-polyfill';
import 'reflect-metadata';
import 'whatwg-fetch';
import React from 'react';
import { render } from 'react-dom';
import { Add } from './component';
import { Add as Add2 } from './component-with-add-prop';
import { Counter } from './component-with-interaction';
import { FetchUser } from './component-with-fetching';
import { FetchUser2 } from './component-with-fetching-2';
import { FetchUserDi } from './component-with-fetching-di';

render(
  <div>
    <Add a={1} b={2} />
    <hr />
    <Add2 a={1} b={2} />
    <hr />
    <Counter />
    <hr />
    <FetchUser />
    <hr />
    <FetchUser2 />
    <hr />
    <FetchUserDi />
  </div>,
  document.getElementById('app')
);
