"use strict";
document.body.onload = loadPage;
// onpage load fetch all data and display
async function loadPage() {
  const url = "https://64b6b8aadf0839c97e16081a.mockapi.io/tasks";
  const notes = await getAllNotes(url);
  displayArticle(notes);
}

const displayFormComponent = document.getElementById("add-note-form");
// const showFormInput = document.getElementById("link-to-add-form");
const darkBg = document.getElementById("opacity-bg");

// show form input to add new note
let section, opacityBg;

const linkTag = document.getElementById("link-to-add-form");
linkTag.addEventListener("click", function (event) {
  event.preventDefault();
  createFormInput("Add note");
});
function createFormInput(element) {
  opacityBg = document.createElement("div");
  opacityBg.classList.add("shadow-bg");

  section = document.createElement("section");
  section.setAttribute("id", "add-note-form");
  section.setAttribute("class", "add-note-section");
  const editFormSection =
    element == "Add note"
      ? manupilateForm("Add a new note")
      : manupilateForm("Update note");

  const formInputs =
    element == "Add note"
      ? formInputElement("Add note")
      : formInputElement("Update note");

  section.append(editFormSection, formInputs);
  document.body.style.overflow = "hidden";
  document.body.append(opacityBg, section);
}

function manupilateForm(formHeading) {
  const division = document.createElement("div");
  division.setAttribute("class", "form-flex");
  const p = document.createElement("p");
  p.textContent = formHeading;
  p.setAttribute("id", "add-note-heading");

  const cancelFormBtn = document.createElement("button");
  cancelFormBtn.setAttribute("id", "cancel-form");
  cancelFormBtn.setAttribute("class", "x-button update-buttons");
  cancelFormBtn.onclick = cancelFormInput;
  cancelFormBtn.innerHTML = ` <svg
width="28"
height="28"
viewBox="0 0 28 28"
fill="none"
xmlns="http://www.w3.org/2000/svg"
>
<rect width="28" height="28" rx="14" fill="white" />
<path
  d="M8 20L20 8"
  stroke="#101840"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
/>
<path
  d="M20 20L8 8"
  stroke="#101840"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
/>
</svg>`;
  division.append(p, cancelFormBtn);
  return division;
}

// cancel form inplementation
function cancelFormInput() {
  document.body.removeChild(section);
  document.body.removeChild(opacityBg);
  document.body.style.overflow = "visible";
  // onclicking body, remove thank you note
  document.body.removeEventListener("click", cancelFormInput);
}

// create the textarea input form

function formInputElement(submitBtn) {
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
  form.onsubmit = submitBtn == "Add note" && postNote;
  return form;
}

// post note to Api implemention

function postNote(event) {
  event.preventDefault();
  let newNote = "";

  const textarea = document.getElementById("note").value;
  console.log(textarea);
  newNote = textarea;
  let noteObject = {
    content: newNote,
    date: dateNotePosted(),
  };

  if (noteObject.content != "" || noteObject.content == undefined) {
    const url = "https://64b6b8aadf0839c97e16081a.mockapi.io/tasks";

    // request object used in fetch api
    const requestObject = {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(noteObject),
    };
    // setting esponse to promise object

    fetch(url, requestObject).then((response) => {
      if (response.statusText == "Created") {
        // replace form section with thank you note

        section.replaceChildren(
          ...successfulAddedNote("Note added successfully")
        );
        //remove thank you note
        response.json().then(function (data) {
          console.log(data.id);
          const url = `https://64b6b8aadf0839c97e16081a.mockapi.io/tasks/${data.id}`;
          getSigleNote(url).then(function (data) {
            createNewArticle(data);
          });
          document.body.addEventListener("click", cancelFormInput);
        });
      }
    });
  }
}

// onsuccesfull note addition, create thank you card
function successfulAddedNote(onUpdate) {
  const image = document.createElement("img");
  image.setAttribute("src", "./images/Tick 1.svg");
  const p = document.createElement("p");
  p.setAttribute("style", "font-weight: 700");
  p.textContent = onUpdate;
  return [image, p];
}

// fetching notes from the API
async function getAllNotes(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
async function getSigleNote(url) {
  const res = await fetch(url);
  const note = await res.json();
  return note;
}

// display new note to the screen
function displayArticle(noteArray) {
  noteArray.forEach(createNewArticle);
}

//random background colors
function bgColorPicker() {
  return Math.floor(Math.random() * 4);
}

// creating new note function
function createNewArticle(note) {
  const bgColors = ["#FCF5D2", "#FCD2F8", "#D2FCDE", "#FCD9D2"];
  const article = document.createElement("article");
  article.style.backgroundColor = bgColors[bgColorPicker()];
  const htmlComponents = `<p id="note-${note.id}" class="note-content">${note.content}</p>
      <div class="date-btn-flex">
          <p class="date-posted" id="para-${note.id}">${note.date}</p>
          <div  class="btn-flex"  >
              <button class="update-buttons" >
                  <img src="./images/edit-btn.svg" alt="" srcset="" class="update-form" onClick="updateform(this)" getId="${note.id}">
              </button>
              <button class="update-buttons">
                  <img id="delete-btn" src="./images/delete-btn.svg" alt="" onClick="deleteNote(this)" srcset="" getId="${note.id}">
              </button>
          </div>
      </div>`;
  article.setAttribute("id", `article-${note.id}`);
  article.classList.add("article-section");
  article.innerHTML = htmlComponents;
  document.getElementById("article-div").appendChild(article);
}

const updateBtns = document.querySelectorAll(".update-form");


// form update notes
async function updateform(element) {
  createFormInput("Update note");
  const textNoteToUpdate = document.getElementById("note");
  let updateNote = "";
  const noteId = element.getAttribute("getId");
  const url = `https://64b6b8aadf0839c97e16081a.mockapi.io/tasks/${noteId}`;
  const { content } = await getSigleNote(url);
  textNoteToUpdate.value = content;
  document
    .getElementById("submit")
    .addEventListener("click", async function (e) {
      e.preventDefault();

      updateNote = textNoteToUpdate.value;
      if (updateNote == "") {
        updateNote = content;
      }
      console.log(content);
      const response = await fetch(url, {
        method: "PUT",
        mode: "cors",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          content: updateNote,
        }),
      });
      console.log(response);
      const noteToUpdate = document.getElementById(`note-${noteId}`);
      if (response.ok == true) {
        noteToUpdate.innerHTML = updateNote;
        // add updated note
        section.replaceChildren(
          ...successfulAddedNote("Note updated successfully")
        );
        // cancel updated note
        document.body.addEventListener("click", cancelFormInput);
      }
    });
}

// note added succesfully alert

function dateNotePosted() {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const date = new Date();

  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// delete notes implementation
async function deleteNote(element) {
  const getId = element.getAttribute("getId");
  const url = `https://64b6b8aadf0839c97e16081a.mockapi.io/tasks/${getId}`;
  const response = await fetch(url, { method: "DELETE", mode: "cors" });

  if (response.statusText === "OK") {
    const articleId = document.getElementById(`article-${getId}`).remove();
  }
}
