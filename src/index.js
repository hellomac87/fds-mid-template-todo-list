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
  const logoutEl = fragment.querySelector('.logout');

  // 로그아웃 버튼 이벤트 리스너
  logoutEl.addEventListener('click', (e) => {
    // 로그아웃 절차
    // 1. 토큰 삭제
    localStorage.removeItem('token');
    // 2. 로그인 폼 그려주기
    drawLoginForm();
  });

  todoFormEl.addEventListener('submit', async (e) => {
    document.body.classList.add('loading');
    e.preventDefault();
    const body = e.target.elements.body.value;

    const res = await api.post('todos',{
      body,
      complete: false
    });

    if(res.status === 201){
      await drawTodoList(); // 비동기함수는 promise를 반환한다. 여기서는 undefined 를 반환
      // await 미작성시 drawTodoList 가 시행되는 도중에 loading indicator 사라짐
      document.body.classList.remove('loading');
    }

  });

  list.forEach((todoItem) => {
    // 1. template 복사하기
    const fragment = document.importNode(templates.todoItem, true);

    // 2. 내용 채우고, 이벤트 리스너 등록하기
    const bodyEl = fragment.querySelector('.body');
    const deleteButtonEl = fragment.querySelector('.delete-button');
    const checkboxEl = fragment.querySelector('.check-box');

    if(todoItem.complete){
      checkboxEl.setAttribute('checked', '');
    }else{
      checkboxEl.removeAttribute('checked');
    }

    // 삭제 버튼 이벤트 리스너
    deleteButtonEl.addEventListener('click', async (e) => {
      await api.delete('todos/' + todoItem.id);
      drawTodoList();
    });

    // 체크박스 이벤트 리스너
    checkboxEl.addEventListener('click', async (e) => {
      // 주석을 풀면 비관적 업데이트 방식으로 변함
      // e.preventDefault()
      // 삭제 요청 보내기
      await api.patch('todos/' + todoItem.id, {
        complete: !todoItem.complete
      });

      // 삭제 요청 성공시 할일 목록 다식 그리기
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


if (localStorage.getItem('token')) {
  // 로그인을 한 상태(토큰이 존재하는상태) 면 할일 목록을 바로 보여주고
  drawTodoList();
}else{
  // 아니라면 로그인 폼을 보여준다
  drawLoginForm();
}

// drawTodoList();
