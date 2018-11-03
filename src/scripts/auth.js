(function immediatelyInvoked() {
  // Initialize Firebase
  const config = {
    apiKey: 'AIzaSyA4tY89Zt1QgtrFk-bBMF3Qw1Gz0Iifak0',
    authDomain: 'appnote-12c8c.firebaseapp.com',
    databaseURL: 'https://appnote-12c8c.firebaseio.com',
    projectId: 'appnote-12c8c',
    storageBucket: '',
    messagingSenderId: '918730972949',
  };
  firebase.initializeApp(config);// eslint-disable-line no-undef

  // auth.html
  const loginForm = document.querySelector('.auth__form');
  const emailText = document.getElementById('email');
  const passText = document.getElementById('password');
  const btnLogIn = loginForm.querySelector('.auth__login');
  const btnSignUp = loginForm.querySelector('.auth__signup');
  const btnLogOut = loginForm.querySelector('.auth__logout');

  // for showing error
  const showError = loginForm.querySelector('.hide__error');

  // verify user after log in
  const verifyUser = (e) => {
    e.preventDefault();
    // get email and password
    const email = emailText.value;
    const pass = passText.value;
    const auth = firebase.auth();// eslint-disable-line no-undef

    // sign in
    const user = auth.signInWithEmailAndPassword(email, pass);// return promise

    // erors sign in
    user.catch(() => {
      showError.classList.add('show__error');
      showError.textContent = 'Incorrect email address or password';
      window.setTimeout(() => showError.classList.remove('show__error'), 5000);
      // console.error(error.message)
    });
  };

  // create an account after sign up
  const signUpUser = (e) => {
    e.preventDefault();
    // get email and password
    const email = emailText.value;
    const pass = passText.value;
    const auth = firebase.auth();// eslint-disable-line no-undef

    // sign up
    const user = auth.createUserWithEmailAndPassword(email, pass);// return promise

    // erors sign up
    user.catch(() => {
      showError.classList.add('show__error');
      showError.textContent = 'Incorrect email address or password';
      window.setTimeout(() => showError.classList.remove('show__error'), 5000);
      // console.error(error.message)
    });
  };

  // log out user
  const logOutUser = () => {
    firebase.auth().signOut();// eslint-disable-line no-undef
  };

  // check if user log in (or sign up successfully)
  const checkUser = (user) => {
    if (user) {
      // succsesfull log in(or sign up)
      btnLogOut.classList.remove('hidden');
      window.location = 'main.html';
    } else {
      btnLogOut.classList.add('hidden');
    }
  };

  // add Login Event
  btnLogIn.addEventListener('click', verifyUser);
  // add Login Event
  btnSignUp.addEventListener('click', signUpUser);
  // add realtime listener
  firebase.auth().onAuthStateChanged(checkUser);// eslint-disable-line no-undef
  // add Log out Event
  btnLogOut.addEventListener('click', logOutUser);
}());
