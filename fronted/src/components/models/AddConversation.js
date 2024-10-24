import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import React from 'react'
import api from "../../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import Loading from "../Loading";

function AddConversation({ open, handleAddConversation ,socket}) {

    const [show, setShow] = useState(open);
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData((formData) => ({
            ...formData,
            [e.target.name]: e.target.value,
        }));
    };

    const validate = () => {
        let tempErrors = {};
        let isValid = true;
        if (!formData.title) {
            tempErrors["title"] = "title is required";
            isValid = false;
        }
        setErrors(tempErrors);
        return isValid;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            try {
                setIsProcessing(true)
                const response = await api.conversation.addConversationByUserId({...formData,isGroup:false});
                toast.success(`Coversation created successfully`);
                socket.emit('addUserToGroup', response.data.users[response.data.users.length-1].userIds);
                console.log('add user',response.data.users[response.data.users.length-1].userIds);
                setSuccess(true);
                setShow(false);
                handleAddConversation(true);
            } catch (err) {
                setError(true);
                if (err.response.data.message) {
                    toast.error(err.response.data.message);
                    // handleClose();
                }
                else {
                    console.log(err);
                }
            }
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        handleAddConversation(false);
        setShow(false);
    };



    return (
        <Modal show={show} onHide={handleClose} size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            backdrop="static"
        >
            <Modal.Header closeButton style={{ backgroundColor: '#c5ecee' }}>
                <Modal.Title>Creat new conversation</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#c5ecee' }}>
                 <form noValidate className="my-3">
                    <div className="form-group">
                        <label htmlFor="title">User</label>
                        <input
                            type="text"
                            name="title"
                            className="form-control"
                            id="title"
                            placeholder="Title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                        {errors.title && (
                            <small id="fullnameHelp" className="form-text text-danger">
                                {errors.title}
                            </small>
                        )}
                    </div>
                </form>
                {
                    fetching && <Loading />
                }
                {/* {
                error && <p>Error</p>
            } */}
            </Modal.Body>
            <Modal.Footer style={{ backgroundColor: '#c5ecee' }}>
                <Button variant="secondary" onClick={handleClose}>
                    No
                </Button>
                {
                    isProcessing && <div className="spinner-border" role="status">
                        <span className="sr-only">  </span>
                    </div>
                }
                {
                    !isProcessing &&
                    <Button variant="primary" onClick={handleSubmit}>
                      Create
                    </Button>
                }
            </Modal.Footer>
        </Modal >
    );
}

export default AddConversation;