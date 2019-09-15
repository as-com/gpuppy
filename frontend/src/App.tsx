import React from 'react';
import './App.css';
import {JobList} from "./JobList";
import {Workers} from "./Workers";

const App: React.FC = () => {
    return (
        <div className="App container">
            <header className="App-header">
                <h1>GPUppy</h1>
                <p><i>What if we tried more power?</i></p>
                <p>Install: <code>curl "https://raw.githubusercontent.com/as-com/gpuppy/master/client-cli/install.sh?token=AC74CEO462QFMB33SA7US3S5Q6GDS" | bash</code></p>
                <JobList/>
                <Workers/>
            </header>
        </div>
    );
}

export default App;
