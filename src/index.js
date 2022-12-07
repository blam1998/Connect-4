import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {App} from './App';
import reportWebVitals from './reportWebVitals';
import {Table} from './Table';
import {Nav} from './Nav';
import Playerstate from './Playerstate';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <div className = "View">
    <div className = "User-Info">
      <Nav />
    </div>
    
    <div className = "Main-Interface">
      <div className = "Player-State">
        <Playerstate />
      </div>
      <div className = "Table">
        <Table />
      </div>
      <div className = "Chat-Room">
        <App />
      </div>
    </div>
  </div>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
