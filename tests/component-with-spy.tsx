import expect, { createSpy, spyOn } from 'expect';
import React from 'react';
import { shallow } from 'enzyme';
import { add } from '../src/function';
import { Add } from '../src/component-with-add-prop';

describe('component: `<Add />` with spy', () => {
  it('should show the sum (using `createSpy`)', () => {
    const addSpy = createSpy().andCall(add);
    // const addSpy = createSpy().andReturn(3);
    const wrapper = shallow(<Add a={1} b={2} add={addSpy as any} />);

    expect(wrapper.type()).toBe('p');
    expect(wrapper.text()).toBe('The sum is: 3.');

    expect(addSpy).toHaveBeenCalled();
    expect(addSpy).toHaveBeenCalledWith(1, 2);
  });

  it('should show the sum (using `spyOn`)', () => {
    const props = {
      a: 1,
      b: 2,
      add
    };
    const addSpy = spyOn(props, 'add').andCallThrough();
    const wrapper = shallow(<Add {...props} />);

    expect(wrapper.type()).toBe('p');
    expect(wrapper.text()).toBe('The sum is: 3.');

    expect(addSpy.calls.length).toEqual(1);
    expect(addSpy).toHaveBeenCalledWith(1, 2);
  });
});

describe('component: `<Add />` with spy resets', () => {
  const addSpy = createSpy().andCall(add);

  // beforeEach(() => {});

  it('should show the sum for 1 + 2', () => {
    const wrapper = shallow(<Add a={1} b={2} add={addSpy as any} />);
    expect(wrapper.text()).toBe('The sum is: 3.');
    expect(addSpy.calls.length).toEqual(1);
    expect(addSpy).toHaveBeenCalledWith(1, 2);
  });

  it('should show the sum for 2 + 2', () => {
    const wrapper = shallow(<Add a={2} b={2} add={addSpy as any} />);
    expect(wrapper.text()).toBe('The sum is: 4.');
    expect(addSpy.calls.length).toEqual(1);
    expect(addSpy).toHaveBeenCalledWith(2, 2);
  });

  afterEach(() => {
    addSpy.reset();
  });
});
