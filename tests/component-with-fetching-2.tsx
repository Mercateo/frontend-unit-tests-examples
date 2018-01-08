import expect, { createSpy } from 'expect';
import React from 'react';
import { shallow } from 'enzyme';
import { FetchUser2 } from '../src/component-with-fetching-2';
import { nextTick } from './utils';

describe('component: `<FetchUser2 />`', () => {
  const originalFetch = FetchUser2.fetch;
  let resolveFetch: (value: any) => void;
  const mockedFetch = () => new Promise((resolve) => (resolveFetch = resolve));
  const mockedResponse = {
    ok: true,
    json: async () => [{ name: 'Foo Bar' }]
  };
  const fetchSpy = createSpy().andCall(mockedFetch);

  beforeEach(() => {
    FetchUser2.fetch = fetchSpy as any;
  });

  it('should fetch user', async () => {
    const wrapper = shallow(<FetchUser2 />);
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
    FetchUser2.fetch = originalFetch;
    fetchSpy.reset();
  });
});
