import React from 'react';
import './App.css';
import {JobList} from "./JobList";
import {Workers} from "./Workers";

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>GPUppy</h1>
        <p><i>What if we tried more power?</i></p>
        <JobList />
        <Workers />
      </header>
    </div>
  );
}

export default App;
