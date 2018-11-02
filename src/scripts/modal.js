
const dialog = document.querySelector('.dialog');
const dialogMask = dialog.querySelector('.dialog__mask');
const close = dialog.querySelector('.modal__btn-close');

// for saving previous active element
let previousActiveElement;

// close modal window
const closeDialog = () => {
  // delete all events
  dialogMask.removeEventListener('click', closeDialog);
  close.removeEventListener('click', closeDialog);
  document.removeEventListener('keydown', checkCloseDialog);// eslint-disable-line no-use-before-define

  // return all elements to accessibility tree
  Array.from(document.body.children).forEach((child) => {
    if (child !== dialog) {
      const copyChild = child;
      copyChild.inert = false;
    }
  });

  // close modal window
  dialog.classList.remove('opened');

  // return focus to the previous user click
  previousActiveElement.focus();
};

// check if user enter ESC
const checkCloseDialog = (e) => {
  if (e.key === 'Escape') closeDialog();
};

// open modal window
const openDialog = () => {
  previousActiveElement = document.activeElement;

  // delete all elements which not in modal window from accessibility tree
  Array.from(document.body.children).forEach((child) => {
    if (child !== dialog) {
      const copyChild = child;
      copyChild.inert = true;
    }
  });

  // show modal window
  dialog.classList.add('opened');

  // add events
  dialogMask.addEventListener('click', closeDialog);
  close.addEventListener('click', closeDialog);
  document.addEventListener('keydown', checkCloseDialog);

  // change focus to the title modal window
  dialog.querySelector('input').focus();
};

const addBtn = document.querySelector('.add__note_btn');

addBtn.addEventListener('click', openDialog);
