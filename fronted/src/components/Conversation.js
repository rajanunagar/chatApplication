import React, { useEffect } from 'react'
import ChatPage from './ChatPage';
import { useSelector } from 'react-redux';

function Conversation({socket}) {
  return (
    <ChatPage socket={socket}/>
  )
}

export default Conversation