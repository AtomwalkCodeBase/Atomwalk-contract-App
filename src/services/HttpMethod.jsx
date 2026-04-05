import axios from "axios";
// import { endpoint } from "../constants";
import {endpoint } from "../services/ConstantServies";

// Utility function to get token from localStorage
const getToken = () => {
  return localStorage.getItem('userToken')?localStorage.getItem('userToken'):localStorage.getItem('customerToken');
};

export const authAxios = async (url, data) => {
  const token = getToken();
  return axios.create({
    baseURL: endpoint,
    params: data,
    headers: {
      Authorization: `Token ${token}`
    }
  }).get(url);
};
export const authAxiosget = async (url, data) => {
  return axios.create({
    baseURL: endpoint,
    params: data,
  }).get(url);
};

export const authAxiosPost = async (url, data) => {
  const token = getToken();
  return axios.create({
    baseURL: endpoint,
    headers: {
      Authorization:token? `Token ${token}`:""
    }
  }).post(url, data);
};

export const authAxiosFilePost = async (url, data) => {
  const token = getToken();

  if (!(data instanceof FormData)) {
    console.error('Data is not FormData!');
    return;
  }

  return axios.create({
    baseURL: endpoint,
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'multipart/form-data',
    }
  }).post(url, data);
};

export const publicAxiosRequest = axios.create({
  baseURL: endpoint,
});

export default {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,
};
