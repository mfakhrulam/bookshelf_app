const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

const yearNow = new Date();
document.getElementById("book-year").setAttribute("max", yearNow.getFullYear());

document.addEventListener("DOMContentLoaded", function () {
  const formBookInput = document.getElementById("form-book-input");
  formBookInput.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById("unread-books");
  uncompletedBookList.innerHTML = "";

  const completedBookList = document.getElementById("already-read-books");
  completedBookList.innerHTML = "";

  for (const book of books) {
    const bookElement = makeBook(book);
    if (!book.isComplete) {
      uncompletedBookList.append(bookElement);
    } else {
      completedBookList.append(bookElement);
    }
  }
});

function addBook() {
  const bookTitle = document.getElementById("book-title").value;
  const bookAuthor = document.getElementById("book-author").value;
  const bookYear = parseInt(document.getElementById("book-year").value);
  const isComplete = document.getElementById("is-complete").checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    bookTitle,
    bookAuthor,
    bookYear,
    isComplete
  );

  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveDataToStorage();
}

function makeBook(bookObject) {
  const textTitle = document.createElement("h5");
  const textAuthor = document.createElement("h6");
  const textYear = document.createElement("h6");
  const textContainer = document.createElement("div");
  const container = document.createElement("div");
  const imageDiv = document.createElement("div");
  const image = document.createElement("img");

  textTitle.innerText = bookObject.title;
  textTitle.classList.add("book-title");
  textAuthor.innerText = bookObject.author;
  textYear.innerText = bookObject.year;

  textContainer.classList.add("card-body");
  textContainer.append(textTitle, textAuthor, textYear);

  imageDiv.classList.add("img-book");

  container.classList.add("card", "mt-3", "item");
  container.append(imageDiv, textContainer);
  container.setAttribute("id", `book-${bookObject.id}`);

  image.classList.add("img-fluid");

  const trashButton = document.createElement("button");
  const unreadButton = document.createElement("button");
  const checkButton = document.createElement("button");
  checkButton.classList.add("down-button");
  trashButton.classList.add("trash-button");
  unreadButton.classList.add("up-button");

  if (bookObject.isComplete) {
    image.setAttribute("src", "assets/img/book-complete.jpg");
    image.setAttribute("alt", "Complete Book");

    unreadButton.addEventListener("click", function () {
      addBookToUncompleted(bookObject.id);
    });

    trashButton.addEventListener("click", function () {
      deleteBook(bookObject.id);
    });

    imageDiv.append(image);
    container.append(unreadButton, trashButton);
  } else {
    image.setAttribute("src", "assets/img/book-uncomplete.jpg");
    image.setAttribute("alt", "Uncomplete Book");

    checkButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    trashButton.addEventListener("click", function () {
      deleteBook(bookObject.id);
    });

    imageDiv.append(image);
    container.append(checkButton, trashButton);
  }

  return container;
}

function findBook(id) {
  for (const book of books) {
    if (book.id === id) {
      return book;
    }
  }
  return null;
}

function findBookIndex(id) {
  for (const idx in books) {
    if (books[idx].id === id) {
      return idx;
    }
  }
  return -1;
}

function addBookToCompleted(id) {
  const bookTarget = findBook(id);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveDataToStorage();
}

function addBookToUncompleted(id) {
  const bookTarget = findBook(id);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveDataToStorage();
}

function deleteBook(id) {
  const modal = document.getElementById("modal-deletion");
  modal.classList.add("show");
  const deleteButton = document.getElementById("delete-btn");
  const cancelButton = document.getElementById("cancel-btn");

  deleteButton.addEventListener("click", function () {
    const bookTarget = findBookIndex(id);
    if (bookTarget === -1) return;
    books.splice(bookTarget, 1);
    modal.classList.remove("show");
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataToStorage();
  });

  cancelButton.addEventListener("click", function () {
    modal.classList.remove("show");
  });
  
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.classList.remove("show");
    }
  };
}

function saveDataToStorage() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log("Data berhasil diupdate");
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let datas = JSON.parse(serializedData);

  if (datas !== null) {
    for (const book of datas) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document
  .getElementById("form-search")
  .addEventListener("submit", function (event) {
    const searchInput = document.getElementById("search-input").value;
    const getTitle = document.getElementsByClassName("book-title");

    for (const title of getTitle) {
      if (
        title.innerText
          .trim()
          .toLowerCase()
          .includes(searchInput.trim().toLowerCase())
      ) {
        title.parentElement.parentElement.classList.remove("hidden");
      } else {
        title.parentElement.parentElement.classList.add("hidden");
      }
    }
    event.preventDefault();
  });
