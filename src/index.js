import React from 'react';
import ReactDOM from 'react-dom';
import Home from './pages/Home';
import Articles from './pages/Articles';
import Route from "./utils/Route";
import Contact from "./pages/Contact";
import Reading from "./pages/Reading";
import Punchlines from "./pages/Punchlines";

Route
.set('/', <Home/>)
.set('/articles', <Articles/>)
.set('/articles/[0-9]+/[\\S\\s]+', <Reading/>)
.set('/punchlines', <Punchlines/>)
.set('/contact-us', <Contact/>)

ReactDOM.render(
  <React.StrictMode>
    <Route/>
  </React.StrictMode>,
  document.getElementById('root')
);
