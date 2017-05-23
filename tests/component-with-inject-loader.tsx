import expect from 'expect';
import React from 'react';
import { shallow } from 'enzyme';
import { nextTick } from './utils';
const { Add, injectableDefaultAdd, resetAllInjects: resetAllInAdd }  = require('../injectable-loader?defaultAdd!../src/component-with-add-prop');
const { FetchUser, injectableFetch, resetAllInjects: resetAllInFetchUser } = require('../injectable-loader?fetch!../src/component-with-fetching');

describe('component: `<FetchUser />` with inject loader', () => {
  it('should fetch user with replaced fetch and magic val', async () => {
    injectableFetch((url: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        resolve({
          ok: true,
          json: async () => [{ name: 'Mocked Foo Bar' }]
        })
      });
    });

    const wrapper = shallow(<FetchUser />);
    const getText = () => wrapper.find('p').text();

    expect(getText()).toBe('Loading...');
    await nextTick();
    expect(getText()).toBe('Hello Mocked Foo Bar!');

    resetAllInFetchUser();
  });

  it('should fetch user with default impl', async () => {
    const wrapper = shallow(<FetchUser />);
    const getText = () => wrapper.find('p').text();

    expect(getText()).toBe('Loading...');
    await nextTick();
    // Keeps loading, as the Promise doesn't get resolved
    expect(getText()).toBe('Loading...');
  });
});

describe('component: `<Add />` with inject loader', () => {
  it('should show the sum', () => {
    const wrapper = shallow(<Add a={1} b={2} />);

    expect(wrapper.type()).toBe('p');
    expect(wrapper.text()).toBe('The sum is: 3.');
  });

  it('should show the product because of function replacement', () => {
    injectableDefaultAdd((a: number, b: number) => a * b);

    const wrapper = shallow(<Add a={1} b={2} />);

    expect(wrapper.type()).toBe('p');
    expect(wrapper.text()).toBe('The sum is: 2.');

    resetAllInAdd();
  });

  it('should show the product because of function replacement', () => {
    const wrapper = shallow(<Add a={7} b={8} />);

    expect(wrapper.type()).toBe('p');
    expect(wrapper.text()).toBe('The sum is: 15.');
  });
});
