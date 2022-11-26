import React from 'react';
import ReactDOM from 'react-dom';
import Home from './pages/Home';
import Articles from './pages/Articles';
import Route from "./utils/Route";

Route
.set('/', <Home/>)
.set('/articles', <Articles/>)

ReactDOM.render(
  <React.StrictMode>
    <Route/>
  </React.StrictMode>,
  document.getElementById('root')
);
