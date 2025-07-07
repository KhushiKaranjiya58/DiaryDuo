function formatDate(dateStr, format = "month-first"){
  const [year, month, day] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const options = format === "day-first"
  ? {day: 'numeric', month:'long', year: 'numeric'}
  : {month: 'long', day: 'numeric', year:'numeric'};
  return date.toLocaleDateString("en-US", options);
}

const entriesPerStack = 4;
const stacksPerRow = 5;
const entriesPerPage = entriesPerStack * stacksPerRow;
let currentStackPage = 0;
let currentDiaryPage = 0;
const diaryPageSize = 10;

// ---------- SIGNUP ----------
function signup(event) {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('useremail').value.trim();
  const password = document.getElementById('userpassword').value;
  const confirmPassword = document.getElementById('confirmpassword').value;

  if (!username || !email || !password || !confirmPassword) {
    alert("Please fill all fields");
    return;
  }

  if (!email.includes("@")) {
    alert("Please enter a valid email");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  if (localStorage.getItem(username)) {
    alert("User already exists! Please log in.");
    return;
  }

  localStorage.setItem(username, JSON.stringify({ email, password }));
  alert("Sign up successful! Now log in.");
  window.location.href = "loginpage.html";
}

// ---------- LOGIN ----------
function logIn(event) {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('useremail').value.trim();

  const userData = JSON.parse(localStorage.getItem(username));

  if (!userData) {
    alert("User not found. Please sign up.");
    return;
  }

  if (userData.email !== email) {
    alert("Incorrect email!");
    return;
  }

  alert("Login successful!");
  sessionStorage.setItem("loggedInUser", username);
  window.location.href = "dashboard.html";
}

// ---------- HABIT TRACKER ----------
function loadHabits() {
  const savedHabits = JSON.parse(localStorage.getItem("habits")) || [];
  const habitList = document.getElementById("habitlist");
  habitList.innerHTML = "";

  const startIndex = currentStackPage * entriesPerPage;
  const habitsToShow = savedHabits.slice(startIndex, startIndex + entriesPerPage);

  habitsToShow.forEach((habit, index) => {
    const entryDiv = document.createElement("div");
    entryDiv.className = "habit-entry";

    const span = document.createElement("span");
    span.textContent = habit;
    span.title = habit;
    span.onclick = () => showHabitPopup(startIndex + index);

    const editBtn = document.createElement("button");
    editBtn.innerHTML = `<img src="edit.png" style="width:20px; height:20px;">`;
    editBtn.onclick = () => editHabit(entryDiv, span, startIndex + index);

    const delBtn = document.createElement("button");
    delBtn.innerHTML = `<img src="trash-bin.svg" style="width:20px; height:20px;">`;
    delBtn.onclick = () => deleteHabit(startIndex + index);

    entryDiv.appendChild(span);
    entryDiv.appendChild(editBtn);
    entryDiv.appendChild(delBtn);
    habitList.appendChild(entryDiv);
  });

  const seeMoreLink = document.getElementById("seeMoreLink");
  if (seeMoreLink) {
    if (savedHabits.length > (currentStackPage + 1) * entriesPerPage) {
      seeMoreLink.style.display = "inline";
      seeMoreLink.onclick = (e) => {
        e.preventDefault();
        currentStackPage++;
        loadHabits();
      };
    } else {
      seeMoreLink.style.display = "none";
    }
  }
}

function editHabit(entryDiv, span, index) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = span.textContent;
  input.style.flex = "1";
  input.style = `
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  margin-right: 10px;
`;

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.textContent = "Cancel";
  cancelBtn.onclick = () => loadHabits();

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.innerHTML = '<i class="fas fa-check"></i>';
  saveBtn.onclick = () => {
    const updatedText = input.value.trim();
    if (!updatedText) return;
    const habits = JSON.parse(localStorage.getItem("habits")) || [];
    habits[index] = updatedText;
    localStorage.setItem("habits", JSON.stringify(habits));
    loadHabits();
  };

  entryDiv.innerHTML = "";
  entryDiv.appendChild(input);
  entryDiv.appendChild(saveBtn);
  entryDiv.appendChild(cancelBtn);
}

function deleteHabit(index) {
  const savedHabits = JSON.parse(localStorage.getItem("habits")) || [];
  savedHabits.splice(index, 1);
  localStorage.setItem("habits", JSON.stringify(savedHabits));
  currentStackPage = 0;
  loadHabits();
}

function addHabit() {
  const habitInput = document.getElementById("addhabits");
  const habit = habitInput.value.trim().replace(/\s+/g, " ");
  currentStackPage = 0;

  if (!habit) {
    alert("Please enter a habit.");
    return;
  }

  const savedHabits = JSON.parse(localStorage.getItem("habits")) || [];
  savedHabits.push(habit);
  localStorage.setItem("habits", JSON.stringify(savedHabits));

  loadHabits();
  habitInput.value = "";
}

function showHabitPopup(index) {
  const habits = JSON.parse(localStorage.getItem("habits")) || [];
  const modal = document.getElementById("popupModal");

  document.getElementById("popupDate").textContent = "Edit Habit";
  document.getElementById("popupText").value = habits[index];

  document.getElementById("popupSaveBtn").onclick = function () {
    const updatedText = document.getElementById("popupText").value.trim();
    if(!updatedText) return;
    habits[index] = updatedText;
    localStorage.setItem("habits", JSON.stringify(habits));
    closeModal();
    loadHabits();
  };
  modal.style.display = "flex";
}

function closeModal() {
  document.getElementById("popupModal").style.display = "none";
}


// ---------- PERSONAL DIARY ----------
function loadDiary() {
  const savedEntries = JSON.parse(localStorage.getItem("diaryEntries")) || [];
  const diaryContainer = document.getElementById("diaryEntries");
  diaryContainer.innerHTML = "";

  const start = currentDiaryPage * diaryPageSize;
  const diaryToShow = savedEntries.slice(start, start + diaryPageSize);

  diaryToShow.forEach((entry, index) => {
    const div = document.createElement("div");
    div.className = "diary-entry";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    const span = document.createElement("span");
    span.textContent = `${formatDate(entry.date)} - ${entry.text}`;
    span.onclick = () => showDiaryPopup(start + index);

    const editBtn = document.createElement("button");
    editBtn.innerHTML = `<img src="edit.png" style="width:20px; height:20px;">`;
    editBtn.onclick = () => editDiary(div, span, start + index);

    const delBtn = document.createElement("button");
    delBtn.innerHTML = `<img src="trash-bin.svg" style="width:20px; height:20px;">`;
    delBtn.style.marginLeft = "10px";
    delBtn.onclick = () => deleteDiaryEntry(start + index);

    div.appendChild(checkbox);
    div.appendChild(span);
    div.appendChild(editBtn);
    div.appendChild(delBtn);
    diaryContainer.appendChild(div);
  });

  const seeMoreLink = document.getElementById("seeMoreDiary");
  if (seeMoreLink) {
    if (savedEntries.length > (currentDiaryPage + 1) * diaryPageSize) {
      seeMoreLink.style.display = "inline";
      seeMoreLink.onclick = (e) => {
        e.preventDefault();
        currentDiaryPage++;
        loadDiary();
      };
    } else {
      seeMoreLink.style.display = "none";
    }
  }
}

function openCalendar() {
  document.getElementById("diaryDate").showPicker();
}


function editDiary(div, span, index) {
  const entries = JSON.parse(localStorage.getItem("diaryEntries")) || [];
  const oldEntry = entries[index];
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.textContent = "Cancel";
  cancelBtn.onclick = () => loadDiary();

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.value = oldEntry.text;
  textInput.placeholder = "Edit your diary entry";
  textInput.style = `
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  margin-right: 10px;
`;

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.value = oldEntry.date || new Date().toISOString().split("T")[0];
  dateInput.style = `
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  margin-right: 10px;
  width: 160px;
`;

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.innerHTML = '<i class="fas fa-check"></i>';

  saveBtn.onclick = () => {
    const updatedText = textInput.value.trim();
    const updatedDate = dateInput.value.trim();
    if (!updatedText || !updatedDate) {
      alert("Both date and text are required.");
      return;
    }

    entries[index] = { text: updatedText, date: updatedDate };
    localStorage.setItem("diaryEntries", JSON.stringify(entries));
    loadDiary();
  };

  div.innerHTML = "";
  div.appendChild(dateInput);
  div.appendChild(textInput);
  div.appendChild(saveBtn);
  div.appendChild(cancelBtn);
}


function deleteDiaryEntry(index) {
  const savedEntries = JSON.parse(localStorage.getItem("diaryEntries")) || [];
  savedEntries.splice(index, 1);
  localStorage.setItem("diaryEntries", JSON.stringify(savedEntries));
  loadDiary();
}

function saveDiary() {
  const entry = document.getElementById("diaryInput").value.trim();
  const dateInput = document.getElementById('diaryDate').value;
 
  if (!entry) {
    alert("Write something before saving!");
    return;
  }

  const savedEntries = JSON.parse(localStorage.getItem("diaryEntries")) || [];

  const today = new Date().toISOString().split('T')[0];
  const date = dateInput || today;

  savedEntries.push({text: entry, date });
  localStorage.setItem("diaryEntries", JSON.stringify(savedEntries));

  loadDiary();
  document.getElementById("diaryInput").value = "";
  document.getElementById('diaryDate').value = "";
}

function showDiaryPopup(index) {
  const entries = JSON.parse(localStorage.getItem("diaryEntries")) || [];
  const entry = entries[index];
  if(!entry) return;
  
  const modal = document.getElementById("popupModal");
  const textArea = document.getElementById("popupText");
  const dateSpan = document.getElementById("popupDate");
  const saveBtn = document.getElementById("popupSaveBtn");
  const cancelBtn = document.getElementById("popupCancelBtn");
  document.getElementById("popupDate").textContent = formatDate(entry.date);
  document.getElementById("popupText").value = entry.text;

  if(!textArea || !dateSpan || !saveBtn || !cancelBtn) {
  alert("Popup elements not found.");
  return;
  } 
  textArea.value = entry.text;
  dateSpan.textContent = formatDate(entry.date);
  cancelBtn.onclick = closeModal;

  saveBtn.onclick = null; 
  saveBtn.onclick = function (){
    const updatedText = document.getElementById("popupText").value.trim();
    if(!updatedText) {
      alert("Please enter some text before saving.");
      return;
    }

    entry.text = updatedText;
    entries[index] = entry;
    localStorage.setItem("diaryEntries", JSON.stringify(entries));
    closeModal();
    loadDiary(); 
  };

  modal.style.display = "flex";
}

function closeModal() {
  document.getElementById("popupModal").style.display = "none";
}

// ---------- INIT ----------
window.onload = function () {
  if (document.getElementById("habitlist")) loadHabits();
  if (document.getElementById("diaryEntries")) loadDiary();
};
