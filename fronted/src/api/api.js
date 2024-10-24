import axios from "axios";
import { setHeader } from "../functions/function";

const baseUrl = 'http://localhost:5001/api/';
axios.defaults.baseURL = baseUrl;

const auth = {
    login: (data) => {
        return axios.post('user/login', data);
    },
    register: (data) => {
        return axios.post('user/register', data);
    },
    tokenValid: () => {
        return axios.get('validatetoken', setHeader());
    },
    mailForgotPasswordLink: (data) => {
        return axios.post('user/forgot-password', data);
    },
    logout : (data)=>{
        return axios.patch('user/logout', data,setHeader());
    },
}
const user = {
    getCurrentUser: () => {
        return axios.get('user/current', setHeader());
    },
    getAllUsers: (pageNo = 1, contactPerPage = 10, searchInput = '') => {
        return axios.get(`user?page=${pageNo}&size=${contactPerPage}&name=${searchInput}`, setHeader());
    },
    getUserById: (id) => {
        return axios.get(`user/${id}`, setHeader())
    }
    ,
    updateCurrentUser: (data) => {
        return axios.patch('user', data, setHeader());
    },
    updateUserPassword: (data) => {
        return axios.patch('user/updatepassword', data, setHeader());
    },
    updateUserbyAdmin: (id, data) => {
        return axios.patch(`user/${id}`, data, setHeader());
    },
    deleteUserByAdmin: (id) => {
        return axios.delete(`user/${id}`, setHeader());
    },
    deleteUser: () => {
        return axios.delete('user', setHeader());
    }
}
const contact = {
    getContactByUserId: (pageNo = 1, contactPerPage = 10, searchInput = '') => {
        return axios.get(`contact?page=${pageNo}&size=${contactPerPage}&name=${searchInput}`, setHeader());
    },
    addContactByUserId: (data) => {
        return axios.post('contact', data, setHeader());
    },
    deleteContactById: (id) => {
        return axios.delete(`contact/${id}`, setHeader());
    },
    updateContactById: (id, data) => {
        return axios.put(`contact/${id}`, data, setHeader());
    },
    getContactById: (id) => {
        return axios.get(`contact/${id}`, setHeader());
    },
    bulkImportContactByUsrId: (data) => {
        return axios.post('contact/bulkimport', data, setHeader());
    },

}
const message = {
    getMessagesByConversationId: (id) => {
        return axios.get(`message/${id}`, setHeader());
    }
}

const conversation = {
    getConversationByUserId: () => {
        return axios.get('conversation/user', setHeader());
    },
    addConversationByUserId: (data) => {
        return axios.post('conversation', data, setHeader());
    },
    addUserToGroup:(id,data)=>{
        return axios.put(`conversation/user/${id}`, data, setHeader());
    },
    getGroupMember:(id)=>{
        return axios.get(`conversation/${id}`,setHeader());
    },
    deleteMemberFromGroup:(id,userid)=>{
        return axios.delete(`conversation/exit/${id}/${userid}`,setHeader());
    },
    updateReadUserTime :(id)=>{
        return axios.patch(`conversation/update/${id}`, {},setHeader());
    }
}

const file = {
    fileUpload: (data) => {
        return axios.post('file', data, setHeader());
    },
}

const api = {
    auth,
    contact,
    user,
    conversation,
    message,
    file
}
export default api;