document.addEventListener("DOMContentLoaded", loadPage);

function loadPage() {
  const url = "https://64b6b8aadf0839c97e16081a.mockapi.io/tasks";
  getAllNotes(url)
    .then(notes => {
      displayArticle(notes);
    })
    .catch(error => {
      console.error("Error loading notes:", error);
    });

  const linkTag = document.getElementById("link-to-add-form");
  linkTag.addEventListener("click", openAddNoteForm);
}

function openAddNoteForm(event) {
  event.preventDefault();
  createFormInput("Add note");
}

function createFormInput(formType) {
  const opacityBg = document.createElement("div");
  opacityBg.classList.add("shadow-bg");

  const section = document.createElement("section");
  section.setAttribute("id", "add-note-form");
  section.setAttribute("class", "add-note-section");

  const formHeading = formType === "Add note" ? "Add a new note" : "Update note";
  const editFormSection = createFormSection(formHeading);
  const formInputs = createFormInputElement(formType);

  section.append(editFormSection, formInputs);
  document.body.style.overflow = "hidden";
  document.body.append(opacityBg, section);
}

function createFormSection(formHeading) {
  const division = document.createElement("div");
  division.setAttribute("class", "form-flex");

  const p = document.createElement("p");
  p.textContent = formHeading;
  p.setAttribute("id", "add-note-heading");

  const cancelFormBtn = document.createElement("button");
  cancelFormBtn.setAttribute("id", "cancel-form");
  cancelFormBtn.setAttribute("class", "x-button update-buttons");
  cancelFormBtn.onclick = cancelFormInput;
  cancelFormBtn.innerHTML = `
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="14" fill="white" />
      <path d="M8 20L20 8" stroke="#101840" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M20 20L8 8" stroke="#101840" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `;

  division.append(p, cancelFormBtn);
  return division;
}

function createFormInputElement(submitBtn) {
  const form = document.createElement("form");
  form.setAttribute("id", "note-form");

  const textArea = document.createElement("textarea");
  textArea.setAttribute("id", "note");

  const button = document.createElement("button");
  button.setAttribute("class", "submit-note btn-state");
  button.setAttribute("type", "submit");
  button.setAttribute("id", "submit");
  button.textContent = submitBtn;

  form.append(textArea, button);

  if (submitBtn === "Add note") {
    form.addEventListener("submit", postNote);
  }

  return form;
}

function postNote(event) {
  event.preventDefault();
  const textarea = document.getElementById("note");
  const newNote = textarea.value;
  
  if (newNote.trim() !== "") {
    const url = "https://64b6b8aadf0839c97e16081a.mockapi.io/tasks";
    const noteObject = {
      content: newNote,
      date: dateNotePosted(),
    };
    
    const requestObject = {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(noteObject),
    };
    
    fetch(url, requestObject)
      .then(response => response.json())
      .then(data => {
        createNewArticle(data);
        cancelFormInput();
      })
      .catch(error => {
        console.error("Error adding note:", error);
      });
  }
}

function dateNotePosted() {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  const date = new Date();
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function cancelFormInput() {
  const section = document.getElementById("add-note-form");
  const opacityBg = document.querySelector(".shadow-bg");
  document.body.removeChild(section);
  document.body.removeChild(opacityBg);
  document.body.style.overflow = "visible";
}

function getAllNotes(url) {
  return fetch(url)
    .then(response => response.json())
    .catch(error => {
      console.error("Error fetching notes:", error);
    });
}

function displayArticle(noteArray) {
  noteArray.forEach(createNewArticle);
}

function createNewArticle(note) {
  const bgColors = ["#FCF5D2", "#FCD2F8", "#D2FCDE", "#FCD9D2"];
  const article = document.createElement("article");
  article.style.backgroundColor = bgColors[bgColorPicker()];

  const htmlComponents = `
    <p id="note-${note.id}" class="note-content">${note.content}</p>
    <div class="date-btn-flex">
      <p class="date-posted" id="para-${note.id}">${note.date}</p>
      <div class="btn-flex">
        <button class="update-buttons">
          <img src="./images/edit-btn.svg" alt="" srcset="" onClick="updateform(this)" getId="${note.id}">
        </button>
        <button class="update-buttons">
          <img id="delete-btn" src="./images/delete-btn.svg" alt="" onClick="deleteNote(this)" srcset="" getId="${note.id}">
        </button>
      </div>
    </div>
  `;

  article.setAttribute("id", `article-${note.id}`);
  article.classList.add("article-section");
  article.innerHTML = htmlComponents;

  document.getElementById("article-div").appendChild(article);
}

function bgColorPicker() {
  return Math.floor(Math.random() * 4);
}
function updateform(element) {
  const noteId = element.getAttribute("getId");
  const textNoteToUpdate = document.getElementById("note");

  const url = `https://64b6b8aadf0839c97e16081a.mockapi.io/tasks/${noteId}`;
  
  getSigleNote(url)
    .then(note => {
      textNoteToUpdate.value = note.content;

      const submitButton = document.getElementById("submit");
      submitButton.textContent = "Update";

      submitButton.addEventListener("click", function (e) {
        e.preventDefault();
        const updatedNote = textNoteToUpdate.value;

        if (updatedNote.trim() !== "") {
          updateNoteInApi(noteId, updatedNote)
            .then(() => {
              const noteContentElement = document.getElementById(`note-${noteId}`);
              noteContentElement.textContent = updatedNote;
              cancelFormInput();
            })
            .catch(error => {
              console.error("Error updating note:", error);
            });
        }
      });
    })
    .catch(error => {
      console.error("Error fetching note:", error);
    });
}

function deleteNote(element) {
  const noteId = element.getAttribute("getId");
  const url = `https://64b6b8aadf0839c97e16081a.mockapi.io/tasks/${noteId}`;

  fetch(url, { method: "DELETE" })
    .then(response => response.json())
    .then(data => {
      const articleElement = document.getElementById(`article-${noteId}`);
      articleElement.remove();
    })
    .catch(error => {
      console.error("Error deleting note:", error);
    });
}

function getSigleNote(url) {
  return fetch(url)
    .then(response => response.json())
    .catch(error => {
      console.error("Error fetching single note:", error);
    });
}

function updateNoteInApi(noteId, updatedNote) {
  const url = `https://64b6b8aadf0839c97e16081a.mockapi.io/tasks/${noteId}`;

  const requestObject = {
    method: "PUT",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      content: updatedNote,
    }),
  };

  return fetch(url, requestObject);
}

