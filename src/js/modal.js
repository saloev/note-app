const dialog = document.querySelector('.dialog');
const dialogMask = dialog.querySelector('.dialog__mask');
const close = dialog.querySelector('.modal__btn-close');

let previousActiveElement;

const closeDialog = () => {
  dialogMask.removeEventListener('click', closeDialog);
  close.removeEventListener('click', closeDialog);
  document.removeEventListener('keydown', checkCloseDialog);// eslint-disable-line no-use-before-define

  Array.from(document.body.children).forEach((child) => {
    if (child !== dialog) {
      const copyChild = child;
      copyChild.inert = false;
    }
  });

  dialog.classList.remove('opened');
  previousActiveElement.focus();
};

const checkCloseDialog = (e) => {
  if (e.key === 'Escape') closeDialog();
};

const openDialog = () => {
  previousActiveElement = document.activeElement;
  Array.from(document.body.children).forEach((child) => {
    if (child !== dialog) {
      const copyChild = child;
      copyChild.inert = true;
    }
  });

  dialog.classList.add('opened');

  dialogMask.addEventListener('click', closeDialog);
  close.addEventListener('click', closeDialog);
  document.addEventListener('keydown', checkCloseDialog);

  dialog.querySelector('input').focus();
};

const addBtn = document.querySelector('.add__note_btn');

addBtn.addEventListener('click', openDialog);
