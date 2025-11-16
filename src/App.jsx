import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './screens/Home'
import ShowAllTask from './screens/ShowAllTask'
import AddTask from './screens/AddTask'
import UpdateTask from './screens/UpdateTask'


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" exact={true} element={<Home />} />
        <Route path="/showalltask" exact={true} element={<ShowAllTask />} />
        <Route path="/addtask" exact={true} element={<AddTask />} />
        <Route path="/updatetask/:id" exact={true} element={<UpdateTask />} />
      </Routes>
    </BrowserRouter>
  )
}
