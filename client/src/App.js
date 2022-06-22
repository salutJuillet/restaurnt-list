import React from 'react'
import RestList from './components/RestList'
import RestWrite from './components/RestWrite';
import RestEdit from './components/RestEdit';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route index element={<RestList />} />
          <Route path="write" element={<RestWrite />} />
          <Route path="edit/:id" element={<RestEdit />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App