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

  // Initialize Cloud Firestore through Firebase
  const db = firebase.firestore();// eslint-disable-line no-undef

  // Disable deprecated features
  db.settings({
    timestampsInSnapshots: true,
  });

  // element for appear user email
  const userEmail = document.querySelector('.note__user__email');
  // element for log out user
  const userLogOutBtn = document.querySelector('.note__user__logout');

  // element for add 'notes'
  const addNoteBtn = document.querySelector('.modal__btn-add');
  // element note title
  const noteTitle = document.querySelector('.dialog__input-title');
  // element note describe
  const noteDescribe = document.querySelector('.dialog__input-text');

  // for adding sorted 'notes' by time from latest to newest
  const ascElem = document.querySelector('.filter__asc');
  // for adding sorted 'notes' by time from newest to latest
  const descElem = document.querySelector('.filter__desc');
  // for adding  event 'changing filter type'
  const filter = document.querySelector('#select__filter-type');

  // by default we show 'notes' sorted by time from latest to newest
  // and hidden 'notes' sorted by time from newest to latest
  descElem.classList.add('hidden');

  // show or hidden 'notes' depending on user click
  const showFiltredNotes = (e) => {
    if (e.target.value === 'desc') {
      ascElem.classList.add('hidden');
      descElem.classList.remove('hidden');
    } else {
      descElem.classList.add('hidden');
      ascElem.classList.remove('hidden');
    }
  };

  // return how many days(minutes, hours etc) has passed
  const howManyTimesPassed = from => moment(from).fromNow();// eslint-disable-line no-undef

  // delete note from Firestore
  const deleteNoteFromFirestore = (userId, docId) => (e) => {
    // don't reload the page
    e.preventDefault();

    // delete from Firestore
    db.collection('users').doc(userId).collection('notes').doc(docId)
      .delete()
      .then(() => {
        // console.log('Document successfully deleted!');
      })
      .catch((error) => {
        console.error('Error removing document: ', error);
      });
  };

  // adding new 'note' to DOM
  const renderNotes = (userId, doc, sortType) => {
    /*eslint-disable */
    const parentElement = sortType ? descElem : ascElem;
    // create new Node(it' new 'note')
    const newNote = Cr.elm('div', { class: 'note', id: `note__${doc.id}` }, [
      Cr.elm('h3', { class: 'note__title' }, [
        Cr.txt(doc.data().title),
      ]),
      Cr.elm('p', { class: 'note__describe' }, [
        Cr.txt(doc.data().describe),
      ]),
      Cr.elm('p', { class: 'note__date' }, [
        Cr.txt(doc.data().date),
      ]),
      Cr.elm('p', { class: 'note__time' }, [
        Cr.txt(howManyTimesPassed(doc.data().time)),
      ]),
      Cr.elm('button', { class: 'note__delete', type: 'submit', events: [['click', deleteNoteFromFirestore(userId, doc.id)]] }, [
        Cr.txt('Delete note'),
      ]),
    ], document.body);
    /* eslint-enable */

    // add new 'note' to DOM
    parentElement.appendChild(newNote);
  };

  // remove Node from Dom after deleting it from Firestore
  const removedNoteFromDOM = (doc) => {
    // deleting element
    const removedElement = document.querySelector(`#note__${doc.id}`);
    // remove it from parent(remove 'note')
    removedElement.parentNode.removeChild(removedElement);
  };

  // realtime updates Firestore(sorted by time from latest to newest)
  const realtimeUpdatesFirestore = (userId) => {
    // 'listen' to a collection 'notes'
    db.collection('users').doc(userId).collection('notes').orderBy('time')
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
        // if add doceument
          if (change.type === 'added') {
          // we render document('note') (add it to DOM)
            renderNotes(userId, change.doc);
          }
          // if document modifed
          if (change.type === 'modified') {
          //
          }
          // if document removed
          if (change.type === 'removed') {
          // removed document('note') (delete it from DOM)
            removedNoteFromDOM(change.doc);
          }
        });
      });

    // (sorted by time from newest to latest)
    db.collection('users').doc(userId).collection('notes').orderBy('time', 'desc')
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
        // if add doceument
          if (change.type === 'added') {
          // we render document('note') (add it to DOM)
            renderNotes(userId, change.doc, 'desc');
          }
          // if document modifed
          if (change.type === 'modified') {
          //
          }
          // if document removed
          if (change.type === 'removed') {
          // removed document('note') (delete it from DOM)
            removedNoteFromDOM(change.doc);
          }
        });
      });
  };

  // add 'note' to Firebase (Database)
  const addNoteToFirestore = user => (e) => {
    // dont reload the page
    e.preventDefault();

    // title text of 'note'
    const title = noteTitle.value;
    // describe text of 'note'
    const describe = noteDescribe.value;
    // get added date
    const date = moment().format('Do MMMM YYYY');// eslint-disable-line no-undef
    // get added time and convert it to ISO format for correct working fromNow() method
    const time = moment().toISOString();// eslint-disable-line no-undef

    // if user dont enter anything
    if (!noteTitle || !noteDescribe) {
      // close modal window (func from modal.js)
      closeDialog();// eslint-disable-line no-undef
      return;
    }

    // clear text of tittle 'note'
    noteTitle.value = '';
    // clear text of describe 'note'
    noteDescribe.value = '';

    // close modal window (func from modal.js)
    closeDialog();// eslint-disable-line no-undef

    // add to Firestore
    db.collection('users').doc(user.uid).collection('notes').doc()
      .set({
        title,
        describe,
        date,
        time,
      })
      .then(() => {
        console.log('Document successfully written!');
      })
      .catch((error) => {
        console.error('Error writing document: ', error);
      });

    // remove listener for click event
    addNoteBtn.removeEventListener('click', addNoteToFirestore(user));
  };

  // add userId doc to 'user' collection with email data
  const initUser = user => db.collection('users').doc(user.uid).set({
    email: user.email,
  });

  // is user sign in
  firebase.auth().onAuthStateChanged((user) => { // eslint-disable-line no-undef
    // if user sign in
    if (user) {
      // show user email
      userEmail.textContent = user.email;
      // add listener for adding 'note' to Firestore
      addNoteBtn.addEventListener('click', addNoteToFirestore(user));
      // add user to FireStore
      initUser(user);
      // 'listen' to a document
      realtimeUpdatesFirestore(user.uid);
    } else {
      console.log('error');
      // redirect user to auth page
      window.location = 'auth.html';
    }
  });

  // log out user
  const logOutUser = (e) => {
    // don't reload the page
    e.preventDefault();
    // log out user
    firebase.auth().signOut();// eslint-disable-line no-undef
    // redirect to auth page
    window.location = 'auth.html';
  };

  // listener for log out user
  userLogOutBtn.addEventListener('click', logOutUser);
  // listener for show and hidden sorted 'notes'
  filter.addEventListener('change', showFiltredNotes);
}());
