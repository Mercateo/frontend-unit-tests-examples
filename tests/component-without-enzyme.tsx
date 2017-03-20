import expect from 'expect';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { Add } from '../src/component';

describe('component: `<Add />` without enzyme', () => {
  it('should show the sum', () => {
    const renderer = ReactTestUtils.createRenderer();
    renderer.render(<Add a={1} b={2} />);
    const output = renderer.getRenderOutput();

    expect(output.type).toBe('p');
    expect(output.props.children).toEqual(['The sum is: ', 3, '.']);
  });
});
