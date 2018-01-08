import React, { Component } from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

/**
 * The `<Counter/>` component counts your clicks.
 */
@observer
export class Counter extends Component {
  @observable count = 0;

  countUp = () => (this.count += 1);

  render() {
    return (
      <div>
        <p>Your count is: {this.count}.</p>
        <button onClick={this.countUp}>Count up!</button>
      </div>
    );
  }
}
