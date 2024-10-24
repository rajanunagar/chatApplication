import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import React from 'react'
import api from "../../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import Loading from "../Loading";
import AddUserToGroupModel from "./AddUserToGroupModel";
import { useSelector } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import { setUser } from "../../features/user/userSlice";

function EditGroupModel({ open,id,adminid,handleEditGroupMoel ,socket}) {

    const [show, setShow] = useState(open);
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [errors, setErrors] = useState({});
    const [isAddUserToGroupModelOpen, setIsAddUserToGroupModelOpen] = useState(false);
    const [conversationId, setConversationId] = useState(id);
    const [addedUser, setAddedUser] = useState([]);
    const userid = useSelector((store) => store.user.userInfo.id);

    const handleClose = () => {
        handleEditGroupMoel(false);
        setShow(false);
    };
    const handleAddUserToGroupModel = (value) => {
        setIsAddUserToGroupModelOpen(false);
        if(value){
            setAddedUser((rec) => ([...rec, value]));
        }
    }
    const getGroupMemberList = async ()=>{
        try {
            setFetching(true);
            setSuccess(false);
            setError(false);
            const groupMember = await api.conversation.getGroupMember(id);
            setSuccess(true);
            setAddedUser(groupMember.data);
        } catch (err) {
            setError(err.response.data.message);
        }
        setFetching(false);
    }
    const onMemberDeleteFromGroup=async (userid)=>{
        try {
            const response = await api.conversation.deleteMemberFromGroup(id,userid);
            // socket.emit('addUserToGroup', response.data.users[response.data.users.length-1].userIds);
            // console.log('add user togroup',response.data.users[response.data.users.length-1].userIds);
            setSuccess(true);
            toast.success(`Member exit from the group successfully`);
            socket.emit('deleteUserFromGroup', {userid,conversationid:id});
            if(adminid === userid){
        handleClose();
            }
            else{
                getGroupMemberList();
            }
        } catch (err) {
            setError(true);
            if (err.response.data.message) {
                toast.error(err.response.data.message);
            }
            else {
                console.log(error);
            }
        }
    }

    useEffect(()=>{
       getGroupMemberList();
    },[id])

    return (
        <Modal show={show} onHide={handleClose} size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            backdrop="static"
        >
            <Modal.Header closeButton style={{ backgroundColor: '#c5ecee' }}>
                <Modal.Title>Edit Group</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#c5ecee' }}>
                {
                    isAddUserToGroupModelOpen && <AddUserToGroupModel open={isAddUserToGroupModelOpen} id={conversationId} handleAddUserToGroupModel={handleAddUserToGroupModel} socket={socket} />
                }
                
                {
                    addedUser && addedUser.length>0 && <>
                    <p>Added User</p>
                        {/* <ul class="list-group">
                            {
                                addedUser.map((rec)=><><li class="list-group-item">{rec.username}</li><button>sdk</button></>)
                            }
                        </ul> */}
                        <table className="table table-hover" >
                                            <thead>
                                                <tr>
                                                    <th>Username</th>
                                                    {
                                                        userid ===adminid &&  <th>Action</th>
                                                    }
                                                   
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {addedUser.map((rec, index) => (
                                                    <tr key={rec.id}>
                                                        <td>{rec.username}<span className="text-danger">{rec.id ===adminid?'Admin':''}</span></td>
                                                        {
                                                        userid ===adminid &&<td>
                                                            
                                                           <button className="btn card-link" onClick={() => onMemberDeleteFromGroup(rec.id)}><svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width={16}
                                                                height={16}
                                                                fill="currentColor"
                                                                className="bi bi-trash3-fill"
                                                                viewBox="0 0 16 16"
                                                            >
                                                                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                                                            </svg>
                                                            </button>

                                                        </td>
}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                        </>
                        
                }
                {conversationId && userid ===adminid&& <Button variant="secondary" disabled={userid!==adminid} onClick={(e) => setIsAddUserToGroupModelOpen(true)}>
                    Add User
                </Button>
                }
                {
                    fetching && <Loading />
                }
                {/* {
                error && <p>Error</p>
            } */}
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#c5ecee' }}>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal >
    );
}

export default EditGroupModel;