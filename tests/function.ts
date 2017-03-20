import expect from 'expect';
import { add } from '../src/function';

describe('function: add', () => {
  it('should add numbers', () => {
    expect(add(1, 1)).toBe(2);
    expect(add(1000, 2345)).toBe(3345);
    expect(add(-55, -33)).toBe(-88);
  });

  it('should behave like normal javascript', () => {
    expect(add(false as any, 1)).toBe(1);
    expect(add('1' as any, 1)).toBe('11' as any);
  });
});
