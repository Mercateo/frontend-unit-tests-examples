import React, { Component } from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Container } from 'inversify';

/**
 * Injectable dependencies for `<FetchUserDi />`.
 */
export const fetchUserDependencies = new Container();
export const Fetch = Symbol('fetch');
fetchUserDependencies.bind(Fetch).toConstantValue(fetch.bind(window));

interface User {
  name: string;
}

type Users = Array<User>;

/**
 * The `<FetchUser/>` fetches a user.
 */
@observer
export class FetchUserDi extends Component {
  fetch = fetchUserDependencies.get(Fetch) as typeof fetch;

  @observable data: Users | null = null;

  async componentWillMount() {
    const response = await this.fetch(
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
