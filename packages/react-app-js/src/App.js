import {useEffect, useState} from "react";
import logo from './logo.svg';
import './App.css';

function App() {
  const [user, setUser] = useState({id: 0, name: ''});

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
          Edit <code>src/App.js</code> and save to reload.
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
