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

const database = firebase.database();// eslint-disable-line no-undef

console.log(database);
