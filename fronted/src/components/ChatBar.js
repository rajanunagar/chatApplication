import React, { useState, useEffect } from 'react';
import api from '../api/api';
import Loading from './Loading';
import AddConversation from './models/AddConversation';
import AddGroupModel from './models/AddGroupModel';
import { useSelector } from 'react-redux';

const ChatBar = ({ socket,hadnleClick }) => {

    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [isAddConversationModelOpen, setIsAddConversationModelOpen] = useState(false);
    const [conversationId1,setConversationId] = useState(null);
    const [isAddGroupModelOpen, setIsAddGroupModelOpen] = useState(false);
    const [isUpdate,setIsUpdate]=useState(false);
    const [selectedConversaation,setSelectedConversation]=useState(null);
    const userID = useSelector((store) => store.user.userInfo.id);


    const sortConversationList = (data)=>{
        data.sort((a, b) => {
            const dateA = a.lastMessageCreatedAt ? new Date(a.lastMessageCreatedAt) : new Date(0); // Use a default past date if null
            const dateB = b.lastMessageCreatedAt ? new Date(b.lastMessageCreatedAt) : new Date(0); // Use a default past date if null
        
            return dateB - dateA; // For descending order
        });
    }

    const getConversations = async () => {
        try {
            // setConversationId(null);
            setFetching(true);
            setSuccess(false);
            setError(false);
            const contactsRes = await api.conversation.getConversationByUserId();
            setSuccess(true);
            sortConversationList(contactsRes.data);
            setConversations(contactsRes.data);
            if(contactsRes.data && contactsRes.data.length>0){
                contactsRes.data.forEach(element => {
                    socket.emit('joinConversation', element._id);
                   
                });
              }
            setIsUpdate(!isUpdate);
        } catch (err) {
            setError(err.response.data.message);
        }
        setFetching(false);
    };
    function handleAddConversation(value) {
        setIsAddConversationModelOpen(false);
        if (value) {
            getConversations();
        }
    };
    function handleAddGroup(value) {
        setIsAddGroupModelOpen(false);
        // if (value) {
            getConversations();
        // }
    };
    function setCount(conversationId){
        setConversations((list)=>{
            const ans =  list.map((rec)=>{
                const obj = rec;
                if(obj._id === conversationId){
                    if(obj.count){
                       obj.count+=1;
                    }
                    else{
                        obj.count=1;
                    }
                    obj.lastMessageCreatedAt= new Date();
                }
                if(obj._id === conversationId1){
                    //console.log('reset');
                    obj.count=undefined;
                }
                return obj;
            })
            sortConversationList(ans);
           return ans;
        })
    }
    useEffect(() => {
        socket.on('receiveDeleteUserFromGroup',({userid})=>{
            console.log(userid,'deleted');
            if(userid===userID) {
               getConversations();
               hadnleClick(null);
            }
       });
       socket.on('notification', ({conversationId}) => {
        setCount(conversationId);
      });
      socket.on('receiveAddUserToGroup',({userId})=>{
        console.log(typeof userID,typeof userId);
        console.log(userID,userId);
        if(userId === userID ){
            getConversations();
        }
      });
        getConversations();
        return () => {
            socket.off('notification');
            socket.off('receiveDeleteUserFromGroup');
            socket.off('receiveAddUserToGroup');
            console.log('hello');
          };
    }, []);

    useEffect(()=>{
    //   if(conversations && conversations.length>0){
    //     conversations.forEach(element => {
    //         socket.emit('joinConversation', element._id);
           
    //     });
    //   }
      return () => {
        socket.off('joinConversation');
      };
    },[isUpdate])

    return (
        <div className='chat__sidebar'>
            <h2>Conversation</h2>
            <button className="sendBtn" onClick={(e)=>setIsAddConversationModelOpen(true)}>Create</button>
            <br/>
            <button className="sendBtn mt-3" onClick={(e)=>setIsAddGroupModelOpen(true)}>Group</button>
            {isAddConversationModelOpen &&
                <AddConversation open={isAddConversationModelOpen} handleAddConversation={handleAddConversation} socket={socket}/>
            }
             {isAddGroupModelOpen &&
                <AddGroupModel open={isAddGroupModelOpen} handleAddGroup={handleAddGroup} socket={socket}/>
            }
            <div>
                <h4 className='chat__header'>Chat</h4>
                {success &&
                    <div className='chat__users'>
                        {conversations.map(conversation => <p onClick={(e)=>{
                            if(selectedConversaation) selectedConversaation.count=undefined;
                            setSelectedConversation(conversation);
                            setConversationId(conversation._id);hadnleClick(conversation)}} key={conversation._id}>{conversation.title}<span className='text-danger'>{conversationId1!==conversation._id ? conversation.count?conversation.count:'':''}</span></p>)}
                    </div>
                }
                {fetching && <Loading />}
            </div>
        </div>
    )
}

export default ChatBar