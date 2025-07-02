// var natureAnim = lottie.loadAnimation({
//   container: document.getElementById('nature.json'),
//   renderer: 'svg',
//   loop: true,           // true means animation repeat hoti rahegi
//   autoplay: true,       // true means automatically chalegi
//   path: 'nature.json'   // sahi path dena yahan apni .json file ka
// });

const entriesPerStack = 4;
const stacksPerRow = 5;
const entriesPerPage = entriesPerStack * stacksPerRow; // 20
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
    const habitList = document.getElementById('habitlist');
    habitList.innerHTML = "";

    const startIndex = currentStackPage * entriesPerPage;
    const habitsToShow = savedHabits.slice(startIndex, startIndex + entriesPerPage);

    //Create row container
    const rowContainer = document.createElement('div');
    rowContainer.className = 'habit-row' // for styling

    //Create upto 5 stacks
    for (let stackIndex = 0; stackIndex < stacksPerRow; stackIndex++){
        const stackDiv = document.createElement('div');
        stackDiv.className = 'habit-stack';

        for(let entryIndex = 0; entryIndex < entriesPerStack; entryIndex++) {
            const overallIndex = stackIndex * entriesPerStack + entryIndex;
            const habit = habitsToShow[overallIndex];
            if(!habit) break;

            const entryDiv = document.createElement('div');
            entryDiv.className = 'habit-entry';

            // const checkbox = document.createElement('input');
            // checkbox.className = 'checkbox';

            const span = document.createElement('span');
            span.textContent = habit;
            span.title = habit;
            span.style.cursor = "pointer";

            const delBtn = document.createElement('button');
            delBtn.innerHTML = `<img src = "trash-bin.svg" style="width:20px; height:20px;">`;
            delBtn.onclick = () => deleteHabit(startIndex + overallIndex);

            // entryDiv.appendChild(checkbox);
            entryDiv.appendChild(span);
            entryDiv.appendChild(delBtn);
            stackDiv.appendChild(entryDiv); 
        }
        rowContainer.appendChild(stackDiv);
    }
     habitList.appendChild(rowContainer);

    //Show/hide see more
    const seeMoreLink = document.getElementById("seeMoreLink");
    if (seeMoreLink) {
        if (savedHabits.length > (currentStackPage + 1) * entriesPerPage) {
            seeMoreLink.style.display = "inline";
            seeMoreLink.onclick = function (e) {
                e.preventDefault();
                currentStackPage++;
                loadHabits();
            };
        } else {
            seeMoreLink.style.display = "none";
        }
    }
}


function deleteHabit(index) {
    let savedHabits = JSON.parse(localStorage.getItem("habits")) || [];
    savedHabits.splice(index, 1);
    localStorage.setItem("habits", JSON.stringify(savedHabits));
    currentStackPage = 0;
    loadHabits();
}

function addHabit() {
    const habitInput = document.getElementById("addhabits");
    const habit = habitInput.value.trim().replace(/\s+/g, ' ');
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

// ---------- PERSONAL DIARY ----------
function loadDiary() {
    const savedEntries = JSON.parse(localStorage.getItem("diaryEntries")) || [];
    const diaryContainer = document.getElementById("diaryEntries");
    diaryContainer.innerHTML = "";

    const start = currentDiaryPage * diaryPageSize;
    const diaryToShow = savedEntries.slice(start, start + diaryPageSize);

     diaryToShow.forEach((entry, index) => {
        const div = document.createElement('div');
        div.className = "diary-entry";

        const checkbox = document.createElement('input');
        checkbox.type = "checkbox";

        const span = document.createElement('span');
        span.textContent = entry;

        const delBtn = document.createElement('button');
        delBtn.innerHTML = `<img src="trash-bin.svg" style="width:20px; height:20px;">`;
        delBtn.style.marginLeft = "10px";
        delBtn.onclick = function () {
            deleteDiaryEntry(start + index);
        };

        div.appendChild(checkbox);
        div.appendChild(span);
        div.appendChild(delBtn);
        diaryContainer.appendChild(div);
    });

    //Show/hide see more
    const seeMoreLink = document.getElementById("seeMoreDiary");
    if (seeMoreLink) {
        if (savedEntries.length > (currentDiaryPage + 1) * diaryPageSize) {
            seeMoreLink.style.display = "inline";
            seeMoreLink.onclick = function (e) {
                e.preventDefault();
                currentDiaryPage++;
                loadDiary();
            };
        } else {
            seeMoreLink.style.display = "none";
        }
    }
}





function deleteDiaryEntry(index) {
    let savedEntries = JSON.parse(localStorage.getItem("diaryEntries")) || [];
    savedEntries.splice(index, 1);
    localStorage.setItem("diaryEntries", JSON.stringify(savedEntries));
    loadDiary();
}

function saveDiary() {
    const entry = document.getElementById('diaryInput').value.trim();

    if (!entry) {
        alert("Write something before saving!");
        return;
    }

    const savedEntries = JSON.parse(localStorage.getItem("diaryEntries")) || [];
    savedEntries.push(entry);
    localStorage.setItem("diaryEntries", JSON.stringify(savedEntries));

    loadDiary();
    document.getElementById('diaryInput').value = "";
}

// ---------- INIT ----------
window.onload = function () {
    if (document.getElementById('habitlist')) loadHabits();
    if (document.getElementById('diaryEntries')) loadDiary();
};
