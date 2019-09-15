import React from 'react';
import logo from './logo.svg';
import './App.css';
import {JobList} from "./JobList";

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>GPUppy</h1>
        <p><i>What if we tried more power?</i></p>
        <JobList />
      </header>
    </div>
  );
}

export default App;
