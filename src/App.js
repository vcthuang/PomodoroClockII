import React from 'react';
import { Provider } from 'react-redux';
import { store } from './clock';

import './App.css';
import ClockContainer from './clock';

function App() {
  return (
    <Provider store = {store}>
      <ClockContainer />
    </Provider>
  );
}

export default App;
