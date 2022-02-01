import React, {useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import { UserType } from '../../domain/types/user';

function App() {
  const [user, setUser] = useState<UserType>({id: 0, name: ''});

  useEffect(() => {  //  ← サーバーサイドと連携する
    fetch('http://localhost:4000/')
      .then(async (response) => {
        const user: UserType = await response.json();
        setUser(user);
      })
      .catch((error) => {
        console.log('error: ', error);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>{user.id}, {user.name}</p>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
