import "@babel/polyfill"; // 이 라인을 지우지 말아주세요!
import axios from "axios";

const api = axios.create({
  baseURL: "https://grave-staircase.glitch.me",
});

// Axios Interceptor - 그때그때 다른 설정 사용하기
// axios에는 매번 요청이 일어나기 직전에 **설정 객체를 가로채서** 원하는대로 편집할 수 있는 기능이 있습니다.
api.interceptors.request.use(function (config) {
  // localStorage에 token이 있으면 요청에 헤더 설정, 없으면 아무것도 하지 않음
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config;
});

const templates = {
  loginForm : document.querySelector('#loginForm').content,
  todoList: document.querySelector('#todoList').content,
  todoItem: document.querySelector('#todoItem').content,
}

const rootEl = document.querySelector('.root');

const drawLoginForm = () => {
  // 1. template 복사하기
  const fragment = document.importNode(templates.loginForm, true);

  // 2. 내용 채우고, 이벤트 리스너 등록하기
  const loginFormEl = fragment.querySelector('.login-form');

  loginFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = e.target.elements.username.value;
    const password = e.target.elements.password.value;

    const res = await api.post('users/login',{
      username,
      password
    });

    localStorage.setItem('token',res.data.token);
    drawTodoList();
  });

  // 3. 문서 내부에 삽입하기
  rootEl.textContent = '';
  rootEl.appendChild(fragment);
}

const drawTodoList = async () => {

  const res = await api.get('todos');
  const list = res.data;

  // 1. template 복사하기
  const fragment = document.importNode(templates.todoList, true);

  // 2. 내용 채우고, 이벤트 리스너 등록하기
  const todoListEl = fragment.querySelector('.todo-list');
  const todoFormEl = fragment.querySelector('.todo-form');

  todoFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = e.target.elements.body.value;

    const res = await api.post('todos',{
      body,
      complete: false
    });

    if(res.status === 201){
      drawTodoList();
    }
  });

  list.forEach((todoItem) => {
    // 1. template 복사하기
    const fragment = document.importNode(templates.todoItem, true);

    // 2. 내용 채우고, 이벤트 리스너 등록하기
    const bodyEl = fragment.querySelector('.body');
    const deleteButtonEl = fragment.querySelector('.delete-button');

    deleteButtonEl.addEventListener('click', async (e) => {
      await api.delete('todos/' + todoItem.id);
      drawTodoList();
    });
    bodyEl.textContent = todoItem.body;

    // 3. 문서 내부에 삽입하기
    rootEl.textContent = '';
    todoListEl.appendChild(fragment);
  });

  // 3. 문서 내부에 삽입하기
  rootEl.appendChild(fragment);
}

drawLoginForm();
// drawTodoList();
