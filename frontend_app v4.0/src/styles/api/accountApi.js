import axiosClient from '../axiosClient';

export const getAccounts = () => axiosClient.get('/accounts');
export const createAccount = (payload) => axiosClient.post('/accounts', payload);
export const updateAccount = (id, payload) => axiosClient.put(`/accounts/${id}`, payload);
export const deleteAccount = (id) => axiosClient.delete(`/accounts/${id}`);
