import expect from 'expect';
import React from 'react';
import { shallow } from 'enzyme';
import { nextTick } from './utils';
const { Add, ilOverwriteDefaultAdd, ilResetAll: resetAllInAdd } = require('import-inject-loader?defaultAdd!../src/component-with-add-prop');
const { FetchUser, ilOverwriteFetch, ilResetAll: resetAllInFetchUser } = require('import-inject-loader?fetch!../src/component-with-fetching');

describe('component: `<FetchUser />` with import-inject-loader', () => {
  beforeEach(() => {
    // could be done at the end of the second test only as well,
    // but as this wouldn't be executed for tests with exceptions we should call it before each test individually
    resetAllInFetchUser();
  });

  it('should fetch user with replaced fetch', async () => {
    ilOverwriteFetch((url: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        resolve({
          ok: true,
          json: async () => [{ name: 'Mocked Foo Bar' }]
        });
      });
    });

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
});

describe('component: `<Add />` with import-inject-loader', () => {
  beforeEach(() => {
    // could be done at the end of the second test only as well,
    // but as this wouldn't be executed for tests with exceptions we should call it before each test individually
    resetAllInAdd();
  });

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
});
