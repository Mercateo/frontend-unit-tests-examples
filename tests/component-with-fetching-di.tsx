import expect, { createSpy } from 'expect';
import React from 'react';
import { shallow } from 'enzyme';
import {
  FetchUserDi,
  fetchUserDependencies,
  Fetch
} from '../src/component-with-fetching-di';
import { nextTick } from './utils';

describe('component: `<FetchUserDi />`', () => {
  let resolveFetch: (value: any) => void;
  const mockedFetch = () => new Promise((resolve) => (resolveFetch = resolve));
  const mockedResponse = {
    ok: true,
    json: async () => [{ name: 'Foo Bar' }]
  };
  const fetchSpy = createSpy().andCall(mockedFetch);

  beforeEach(() => {
    fetchUserDependencies.snapshot();
    fetchUserDependencies.unbind(Fetch);
    fetchUserDependencies.bind(Fetch).toConstantValue(fetchSpy);
  });

  it('should fetch user', async () => {
    const wrapper = shallow(<FetchUserDi />);
    const getText = () => wrapper.find('p').text();

    expect(getText()).toBe('Loading...');

    resolveFetch(mockedResponse);
    await nextTick();

    expect(fetchSpy.calls.length).toEqual(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/users'
    );
    expect(getText()).toBe('Hello Foo Bar!');
  });

  it('should NOT change global fetch', async () => {
    expect(window.fetch).toNotBe(fetchSpy);
  });

  afterEach(() => {
    fetchUserDependencies.restore();
  });
});
