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


  // elemnt for add childs (add 'notes')
  const noteSection = document.querySelector('.notes');
  // element for add 'notes'
  const addNoteBtn = document.querySelector('.modal__btn-add');
  // element note title
  const noteTitle = document.querySelector('.dialog__input-title');
  // element note describe
  const noteDescribe = document.querySelector('.dialog__input-text');

  // delete note from Firestore
  const deleteNoteFromFirestore = (userId, docId) => (e) => {
    // don't reload the page
    e.preventDefault();

    // delete from Firestore
    db.collection('users').doc(userId).collection('notes').doc(docId)
      .delete()
      .then(() => {
        console.log('Document successfully deleted!');
      })
      .catch((error) => {
        console.error('Error removing document: ', error);
      });
  };

  // adding new 'note' to DOM
  const renderNotes = (userId, doc) => {
    // create new Node(it' new 'note')
    /*eslint-disable */
    const newNote = Cr.elm('div', { class: 'note', id: `note__${doc.id}` }, [
      Cr.elm('h3', { class: 'note__title' }, [
        Cr.txt(doc.data().title),
      ]),
      Cr.elm('p', { class: 'note__describe' }, [
        Cr.txt(doc.data().describe),
      ]),
      Cr.elm('p', { class: 'note__date' }, [
        Cr.txt(''),
      ]),
      Cr.elm('p', { class: 'note__time' }, [
        Cr.txt(''),
      ]),
      Cr.elm('button', { class: 'note__delete', type: 'submit', events: [['click', deleteNoteFromFirestore(userId, doc.id)]] }, [
        Cr.txt('Delete note'),
      ]),
    ], document.body);
    /* eslint-enable */

    // add new 'note' to DOM
    noteSection.appendChild(newNote);
  };

  // remove Node from Dom after deleting it from Firestore
  const removedNoteFromDOM = (doc) => {
    // deleting element
    const removedElement = document.querySelector(`#note__${doc.id}`);
    // remove it from parent(remove 'note')
    removedElement.parentNode.removeChild(removedElement);
  };

  // realtime updates Firestore
  const realtimeUpdatesFirestore = (userId) => {
    // 'listen' to a collection 'notes'
    db.collection('users').doc(userId).collection('notes').onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        // if add doceument
        if (change.type === 'added') {
          console.log('New city: ', change.doc.data());
          // we render document('note') (add it to DOM)
          renderNotes(userId, change.doc);
        }
        // if document modifed
        if (change.type === 'modified') {
          console.log('Modified city: ', change.doc.data());
        }
        // if document removed
        if (change.type === 'removed') {
          console.log('Removed city: ', change.doc.data());
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
      console.log('eror');
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
}());
