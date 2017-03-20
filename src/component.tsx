import React, { SFC } from 'react';
import { add } from './function';

/**
 * These are the props which can be passed to `<Add/>`.
 */
interface AddProps {
  /**
   * The first summand.
   */
  a: number;
  /**
   * The second summand.
   */
  b: number;
}

/**
 * The `<Add/>` component adds two summands and shows the sum.
 */
export const Add: SFC<AddProps> = ({ a, b }) => <p>The sum is: {add(a, b)}.</p>;
