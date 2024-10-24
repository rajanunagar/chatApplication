import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from "react-router-dom"
import { useSelector } from 'react-redux';
import EditGroupModel from './models/EditGroupModel';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { styled } from "@mui/material/styles";
import Loading from './Loading';

const ChatBody = ({ messages, typingStatus, lastMessageRef, title, item, socket }) => {
  const navigate = useNavigate()
  const username = useSelector((store) => store.user.userInfo.username);
  const [isEditGroupModelOpen, setIsEditGroupModelOpen] = useState(false);
  const ref = useRef(null);

  const handleLeaveChat = () => {
    navigate("/")
  }

  const handleclick = () => {
    if (item.isGroup) {
      setIsEditGroupModelOpen(true);
    }
  }
  const handleEditGroupMoel = () => {
    setIsEditGroupModelOpen(false);
  }
  const convertDate = (createAt) => {
    const dateStr = createAt;
    const date = new Date(dateStr);

    // Get today's date in UTC
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' };
    const timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'Asia/Kolkata' };

    // Get today's date in IST
    const nowIST = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const todayIST = new Date(nowIST);
    todayIST.setHours(0, 0, 0, 0);

    // Check if the date is today in IST
    const dateIST = new Date(date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })).toLocaleDateString('en-IN');
    const isToday = dateIST === todayIST.toLocaleDateString('en-IN');

    return isToday
      ? date.toLocaleTimeString('en-IN', timeOptions)
      : date.toLocaleDateString('en-IN', dateOptions);
  }

  const seenBy = (message) => {
    let x = message.createdAt;
    let list = item.users.map((rec) => {
      const obj = {};
      let y = rec.readAt;
      let dateX = new Date(x);
      let dateY = new Date(y);
      obj.username = rec.username;
      if (dateX <= dateY) {
        obj.seenBy = true;
      } else if (dateX > dateY) {
        obj.seenBy = false;
      }
      return obj;
    })
    list = list.filter((rec) => rec.username !== username);
    return list;
  }

  const List = ({ message }) => {
    const list = seenBy(message);
    return (
      <ul>
        {list.map((rec, index) => (
          <li className={`${rec.seenBy ? 'text-white' : 'text-danger'}`}>{rec.username}</li>
        ))
        }
      </ul>
    )
  }
  const downloadFile = async (e, message) => {
    e.preventDefault();
    console.log(message);
    const response = await fetch(message);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  function isImageFile(filename) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const lowerCaseFilename = filename.toLowerCase();
    return imageExtensions.some(ext => lowerCaseFilename.endsWith(ext));
  }

  useEffect(()=>{
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  },[messages]);

  return (
    <>
      {
        isEditGroupModelOpen && <EditGroupModel socket={socket} id={item._id} adminid={item.admin} open={isEditGroupModelOpen} handleEditGroupMoel={handleEditGroupMoel} />
      }
      <header className='chat__mainHeader'>
        <p onClick={(e) => { handleclick() }}>{title}</p>
        <button className='leaveChat__btn' onClick={handleLeaveChat}>LEAVE CHAT</button>
      </header>


      <div className='message__container' ref={ref}>
        {messages.map((message, index) => (
          message.sender === username ? (
            <div className="message__chats m-3" key={index}>
            {item.isGroup &&  <p className='sender__name text-info'>You</p>}
              <div className='message__sender'>
                {/* <Tooltip title={<List message={message} />} arrow>
                  <Button>SeenBY</Button>
                </Tooltip> */}
                {
                  message.type === 'text' && <><p>{message.text}
                 </p>   <small className='date__chats  text-gray'>{convertDate(message.createdAt)}</small></>
                }
                {
                  message.type === 'file' && <> {isImageFile(message.fileName) &&<div><img src={`http://localhost:5001/Images/${message.fileName}`} style={{ maxWidth: '200px', maxHeight: '200px' }} /></div> }<p>{message.fileName} <button className='btn btn-secondary' type='button' onClick={(e) => downloadFile(e, `http://localhost:5001/Images/${message.fileName}`)}><svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    fill="currentColor"
                    className="bi bi-cloud-arrow-down-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2m2.354 6.854-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L7.5 9.293V5.5a.5.5 0 0 1 1 0v3.793l1.146-1.147a.5.5 0 0 1 .708.708" />
                  </svg>
                  </button></p>

                    <small className='date__chats  text-gray'>{convertDate(message.createdAt)}</small>

                  </>
                }

              </div>
            </div>
          ) : (
            <div className="message__chats m-2" key={message._id}>
            {item.isGroup &&  <p className='receiver_name text-info'>{message.sender}</p>}

              <div className='message__recipient'>
                {/* <Tooltip title={<List message={message} />} arrow>
                  <Button>SeenBY</Button>
                </Tooltip> */}
                {
                 message.type === 'text' && <><p>{message.text}
                 </p>   <small className='date__chats  text-gray'>{convertDate(message.createdAt)}</small></>
                }
                {
                  message.type === 'file' && <> {isImageFile(message.fileName) && <div><img src={`http://localhost:5001/Images/${message.fileName}`} style={{ maxWidth: '200px', maxHeight: '200px' }} /></div>}<p>{message.fileName} <button className='btn btn-secondary' type='button' onClick={(e) => downloadFile(e, `http://localhost:5001/Images/${message.fileName}`)}><svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    fill="currentColor"
                    className="bi bi-cloud-arrow-down-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2m2.354 6.854-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .708-.708L7.5 9.293V5.5a.5.5 0 0 1 1 0v3.793l1.146-1.147a.5.5 0 0 1 .708.708" />
                  </svg>
                  </button></p>

                    <small className='date__chats  text-gray'>{convertDate(message.createdAt)}</small>

                  </>
                }
              </div>
            </div>
          )
        ))}

        {/* <div className='message__status'>
            <p>{typingStatus}</p>
          </div>
          <div ref={lastMessageRef} />    */}
      </div>
    </>
  )
}

export default ChatBody