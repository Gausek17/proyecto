import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Intro from './Components/Pages/Intro.jsx';
import ImageGenerator from './Components/Pages/AvatarGenerator.jsx';
import PhotoToAvatar from './Components/Pages/PhotoToAvatar.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/" element={<Intro />} />
            <Route path="/generate" element={<ImageGenerator />} />
            <Route path="/photo-to-avatar" element={<PhotoToAvatar />} />

          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
