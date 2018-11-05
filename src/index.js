import "@babel/polyfill"; // 이 라인을 지우지 말아주세요!
import axios from "axios";

const api = axios.create({
  baseURL: "https://grave-staircase.glitch.me",
});

const templates = {
  loginForm : document.querySelector('#loginForm').content,
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

    console.log(res.data.token);
  });

  // 3. 문서 내부에 삽입하기
  rootEl.appendChild(fragment);
}

drawLoginForm();
