import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './screens/Home'
import ShowAllTask from './screens/ShowAllTask'


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/showalltask" element={<ShowAllTask />} />
      </Routes>
    </BrowserRouter>
  )
}
