import expect from 'expect';
import React from 'react';
import { createRenderer } from 'react-test-renderer/shallow';
import { Add } from '../src/component';

describe('component: `<Add />` without enzyme', () => {
  it('should show the sum', () => {
    const renderer = createRenderer();
    renderer.render(<Add a={1} b={2} />);
    const output = renderer.getRenderOutput();

    expect(output.type).toBe('p');
    expect(output.props.children).toEqual(['The sum is: ', 3, '.']);

    // also possible
    expect(output).toEqual(<p>The sum is: {3}.</p>);
  });
});
