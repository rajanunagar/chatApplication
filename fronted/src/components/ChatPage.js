import React, { useEffect, useState, useRef, useId } from 'react'
import ChatBar from './ChatBar'
import ChatBody from './ChatBody'
import ChatFooter from './ChatFooter'
import api from '../api/api';
import Loading from './Loading';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const ChatPage = ({ socket }) => {
  const [messages, setMessages] = useState([])
  const [typingStatus, setTypingStatus] = useState("")
  const lastMessageRef = useRef(null);
  const [item, setItem] = useState(null);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [isAddConversationModelOpen, setIsAddConversationModelOpen] = useState(false);
  const userId = useSelector((store) => store.user.userInfo.id);

  const hadnleClick = (data) => {
    setItem(data);
  }
  const getMessagesByConversationId = async (id) => {
    try {
      setFetching(true);
      setSuccess(false);
      setError(false);
      const messages = await api.message.getMessagesByConversationId(id);
      if(item.count){
        try{
          const response = await api.conversation.updateReadUserTime(id);
        }
        catch(error){
          throw error;
        }
      }
      setSuccess(true);
      setMessages(messages.data);
    } catch (err) {
      setError(err.response.data.message);
    }
    setFetching(false);
  }

  useEffect(() => {
    if (item) {
      //socket.emit('joinConversation', item._id);
    socket.on('receiveMessage', async ({savedMessage,conversationId}) => {
      if(conversationId===item._id){
        try{
          const response = await api.conversation.updateReadUserTime(conversationId);
          item.count=undefined;
          setMessages(prevMessages => [...prevMessages, savedMessage]);
        }
        catch(error){
        toast.error(error.response.data.message);
        }
      }
      });
      getMessagesByConversationId(item._id);
    }
    return () => {
      socket.off('receiveMessage');
    };
  }, [item]);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

 

 
  return (
    <div className="chat">
      <ChatBar socket={socket} hadnleClick={hadnleClick} />
      <div className='chat__main'>
        {item && <>
         {success && <>
         <ChatBody messages={messages} title ={item.title} typingStatus={typingStatus} lastMessageRef={lastMessageRef} item={item} socket={socket}/>
         <ChatFooter socket={socket} id={item._id} /></>}
        {fetching && <Loading />}
        
        </>
        }
        

        {
          !item && <p className='mx-auto'>Please select a user to start conversation</p>
        }
      </div>
    </div>
  )
}

export default ChatPage