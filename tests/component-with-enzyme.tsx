import expect from 'expect';
import React from 'react';
import { shallow } from 'enzyme';
import { Add } from '../src/component';

describe('component: `<Add />` with enzyme', () => {
  it('should show the sum', () => {
    const wrapper = shallow(<Add a={1} b={2} />);

    expect(wrapper.type()).toBe('p');
    expect(wrapper.text()).toBe('The sum is: 3.');
  });
});
