import expect, { createSpy } from 'expect';
import React from 'react';
import { shallow } from 'enzyme';
import { FetchUser } from '../src/component-with-fetching';
import { nextTick } from './utils';

describe('component: `<FetchUser />`', () => {
  const originalFetch = fetch;
  let resolveFetch: (value: any) => void;
  const mockedFetch = () => new Promise((resolve) => (resolveFetch = resolve));
  const mockedResponse = {
    ok: true,
    json: async () => [{ name: 'Foo Bar' }]
  };
  const fetchSpy = createSpy().andCall(mockedFetch);

  beforeEach(() => {
    window.fetch = fetchSpy as any;
  });

  it('should fetch user', async () => {
    const wrapper = shallow(<FetchUser />);
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

  it('should change global fetch', async () => {
    expect(window.fetch).toBe(fetchSpy as any);
  });

  afterEach(() => {
    window.fetch = originalFetch;
    fetchSpy.reset();
  });
});
