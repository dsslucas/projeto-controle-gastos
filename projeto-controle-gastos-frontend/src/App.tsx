import React from 'react';
import './App.css';
import Home from './screens/Home';
import Router from './Router';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <header className="flex xs:items-center xs:justify-start xs:h-12 xl:flex-row xl:justify-between xl:items-center bg-gray-800 text-white p-1">
          <Navbar />
        </header>
        <main className='className="flex flex-col xs:overflow-x-hidden xl:h-screen xl:overflow-hidden bg-gray-300"'>
          <Router />
        </main>
        
      </BrowserRouter>

    </div>
  );
}

export default App;
