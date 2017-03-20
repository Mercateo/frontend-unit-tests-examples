import expect from 'expect';
import React from 'react';
import { shallow } from 'enzyme';
import { Counter } from '../src/component-with-interaction';

describe('component: `<Counter />`', () => {
  it('should count up', () => {
    const wrapper = shallow(<Counter />);

    // note: we can't just save `const p = wrapper.find('p')`
    //       `p.text()` would allways return the same string
    const getText = () => wrapper.find('p').text();
    const clickButton = () => wrapper.find('button').simulate('click');

    expect(getText()).toBe('Your count is: 0.');
    clickButton();
    expect(getText()).toBe('Your count is: 1.');
    clickButton();
    expect(getText()).toBe('Your count is: 2.');
    clickButton();
    clickButton();
    expect(getText()).toBe('Your count is: 4.');
  });
});
