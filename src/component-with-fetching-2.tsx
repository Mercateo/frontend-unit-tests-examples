import React, { Component } from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

interface User {
  name: string;
}

type Users = Array<User>;

/**
 * The `<FetchUser/>` fetches a user.
 */
@observer
export class FetchUser2 extends Component {
  static fetch = fetch.bind(window);

  @observable data: Users | null = null;

  async componentWillMount() {
    const response = await FetchUser2.fetch(
      'https://jsonplaceholder.typicode.com/users'
    );
    if (response.ok) {
      this.data = (await response.json()) as Users;
    }
  }

  render() {
    if (this.data) {
      return <p>Hello {this.data[0].name}!</p>;
    } else {
      return <p>Loading...</p>;
    }
  }
}
