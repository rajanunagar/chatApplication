import './App.css';
import { Route, Routes } from 'react-router';
import About from './components/About';
import Header from './components/Header';
import Home from './components/Home';
import Login from './components/Login';
import Registration from './components/Registration';
import Logout from './components/Logout';
import Profile from './components/Profile';
import NoPageFound from './components/NoPageFound';
import { createContext, useEffect, useId } from 'react';
import Conversation from './components/Conversation';
import socketIO from "socket.io-client";
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

export const ThemeContext = createContext(null);


function App() {
  const userID = useSelector((store) => store.user.userInfo.id);
  const socket = socketIO.connect("http://localhost:5001");

  socket.on("disconnect", () => {
    console.log('user disconnected', socket.id); // undefined
  });
  
  console.log('app')
  useEffect(() => {
    if (userID) {
      // const destroy = socket.io._destroy;
      // socket.io._destroy = () => { };
      // console.log(token);
      // socket.disconnect().connect();

      // socket.io._destroy = destroy;
      console.log('joinUser', userID);
      socket.emit('joinUser', userID);
    }
    return () => {
      if (userID) {
        socket.off('joinUser');
        console.log(userID);
      }
    };
  }, [userID])
  useEffect(() => {
    return () => {
      console.log('socket disconnnet');
      socket.disconnect();
    }
  }, []);
  return (
    <div className='App' style={{ maxHeight: '100vh' }}>
      {/* <button className="btn btn-secondary" onClick={(e) => socket.disconnect()}>disconnect</button> */}
      <Routes>
        <Route path='/' element={<Header />}>
          <Route index element={<Home />}></Route>
          <Route path='/profile' element={<Profile />}></Route>
          <Route path='/about' element={<About />}></Route>
          <Route path='/logout' element={<Logout socket={socket} />}></Route>
          <Route path='/conversation' element={<Conversation socket={socket} />} ></Route>
        </Route>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/register' element={<Registration />}></Route>
        <Route path='*' element={<NoPageFound />}></Route>
      </Routes>
    </div>
  );
}

export default App;
