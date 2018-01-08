import expect from 'expect';
import React from 'react';
import { shallow } from 'enzyme';
import { nextTick } from './utils';
/* eslint-disable import/no-extraneous-dependencies */
import {
  Add,
  ilOverwriteDefaultAdd,
  ilResetAll as resetAllInAdd
} from 'import-inject-loader?defaultAdd!../src/component-with-add-prop';
import {
  FetchUser,
  ilOverwriteFetch,
  ilResetAll as resetAllInFetchUser
} from 'import-inject-loader?fetch!../src/component-with-fetching';
/* eslint-enable import/no-extraneous-dependencies */

describe('component: `<FetchUser />` with import-inject-loader', () => {
  it('should fetch user with replaced fetch', async () => {
    ilOverwriteFetch(() => ({
      ok: true,
      json: () => [{ name: 'Mocked Foo Bar' }]
    }));

    const wrapper = shallow(<FetchUser />);
    const getText = () => wrapper.find('p').text();

    expect(getText()).toBe('Loading...');
    await nextTick();

    expect(getText()).toBe('Hello Mocked Foo Bar!');
  });

  it('should fetch user with default fetch', async () => {
    const wrapper = shallow(<FetchUser />);
    const getText = () => wrapper.find('p').text();

    expect(getText()).toBe('Loading...');
    await nextTick();

    // Keeps loading, as the Promise doesn't get resolved
    expect(getText()).toBe('Loading...');
  });

  afterEach(resetAllInFetchUser);
});

describe('component: `<Add />` with import-inject-loader', () => {
  it('should show the sum', () => {
    const wrapper = shallow(<Add a={1} b={2} />);

    expect(wrapper.type()).toBe('p');
    expect(wrapper.text()).toBe('The sum is: 3.');
  });

  it('should show the product', () => {
    ilOverwriteDefaultAdd((a: number, b: number) => a * b);

    const wrapper = shallow(<Add a={1} b={2} />);

    expect(wrapper.type()).toBe('p');
    expect(wrapper.text()).toBe('The sum is: 2.');
  });

  it('should show the sum as before', () => {
    const wrapper = shallow(<Add a={7} b={8} />);

    expect(wrapper.type()).toBe('p');
    expect(wrapper.text()).toBe('The sum is: 15.');
  });

  afterEach(resetAllInAdd);
});
