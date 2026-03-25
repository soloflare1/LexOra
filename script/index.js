// Helper to create synonym buttons
const createElements = (arr) => {
  return arr
    .map(
      (el) =>
        `<span class="btn rounded-full bg-sky-100 hover:bg-sky-300 m-1 transition">${el}</span>`
    )
    .join(" ");
};

// Speak a word
function pronounceWord(word) {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-EN";
  window.speechSynthesis.speak(utterance);
}

// Toggle Spinner
const manageSpinner = (status) => {
  const spinner = document.getElementById("spinner");
  const container = document.getElementById("word-container");
  if (status) {
    spinner.classList.remove("hidden");
    container.classList.add("hidden");
  } else {
    spinner.classList.add("hidden");
    container.classList.remove("hidden");
  }
};

// Load all lessons
const loadLessons = () => {
  fetch("https://openapi.programming-hero.com/api/levels/all")
    .then((res) => res.json())
    .then((json) => displayLesson(json.data));
};

// Remove active class from all lesson buttons
const removeActive = () => {
  document.querySelectorAll(".lesson-btn").forEach((btn) =>
    btn.classList.remove("active")
  );
};

// Load words for a specific level
const loadLevelWord = (id) => {
  manageSpinner(true);
  fetch(`https://openapi.programming-hero.com/api/level/${id}`)
    .then((res) => res.json())
    .then((data) => {
      removeActive();
      const clickBtn = document.getElementById(`lesson-btn-${id}`);
      clickBtn.classList.add("active");
      displayLevelWord(data.data);
    });
};

// Load word details in modal
const loadWordDetail = async (id) => {
  const res = await fetch(`https://openapi.programming-hero.com/api/word/${id}`);
  const details = await res.json();
  displayWordDetails(details.data);
};

// Display word details
const displayWordDetails = (word) => {
  const detailsBox = document.getElementById("details-container");
  detailsBox.innerHTML = `
    <h2 class="text-2xl font-bold">${word.word} 
      (<i class="fa-solid fa-microphone-lines"></i> : ${word.pronunciation})
    </h2>
    <div>
      <h3 class="font-bold">Meaning</h3>
      <p>${word.meaning}</p>
    </div>
    <div>
      <h3 class="font-bold">Example</h3>
      <p>${word.sentence}</p>
    </div>
    <div>
      <h3 class="font-bold">Synonyms</h3>
      <div>${createElements(word.synonyms)}</div>
    </div>
  `;
  document.getElementById("word_modal").showModal();
};

// Display words for a level
const displayLevelWord = (words) => {
  const container = document.getElementById("word-container");
  container.innerHTML = "";

  if (words.length === 0) {
    container.innerHTML = `
      <div class="text-center col-span-full rounded-2xl py-10 space-y-6 font-bangla shadow bg-white">
        <img class="mx-auto" src="./assets/alert-error.png"/>
        <p class="text-xl text-gray-400">এই Lesson এ এখনো কোন Vocabulary যুক্ত করা হয়নি।</p>
        <h2 class="font-bold text-4xl">নেক্সট Lesson এ যান</h2>
      </div>
    `;
    manageSpinner(false);
    return;
  }

  words.forEach((word) => {
    const card = document.createElement("div");
    card.innerHTML = `
      <div class="bg-white rounded-2xl shadow-md hover:shadow-xl transition text-center py-8 px-5 space-y-4 border border-gray-100">
        <h2 class="font-bold text-2xl">${word.word || "শব্দ পাওয়া যায়নি"}</h2>
        <p class="font-semibold">Meaning / Pronunciation</p>
        <div class="text-2xl font-medium font-bangla">
          "${word.meaning || 'অর্থ পাওয়া যায়নি'} / ${word.pronunciation || 'Pronunciation পাওয়া যায়নি'}"
        </div>
        <div class="flex justify-between items-center">
          <button onclick="loadWordDetail(${word.id})" class="btn rounded-full bg-sky-100 hover:bg-sky-300 transition">
            <i class="fa-solid fa-circle-info"></i>
          </button>
          <button onclick="pronounceWord('${word.word}')" class="btn rounded-full bg-sky-100 hover:bg-sky-300 transition">
            <i class="fa-solid fa-volume-high"></i>
          </button>
        </div>
      </div>
    `;
    container.append(card);
  });

  manageSpinner(false);
};

// Display lessons
const displayLesson = (lessons) => {
  const levelContainer = document.getElementById("level-container");
  levelContainer.innerHTML = "";

  lessons.forEach((lesson) => {
    const btnDiv = document.createElement("div");
    btnDiv.innerHTML = `
      <button id="lesson-btn-${lesson.level_no}" onclick="loadLevelWord(${lesson.level_no})"
        class="btn btn-outline btn-primary lesson-btn rounded-full">
        <i class="fa-solid fa-book-open"></i> Lesson - ${lesson.level_no}
      </button>
    `;
    levelContainer.append(btnDiv);
  });
};

// Initial load
loadLessons();

// Search functionality
document.getElementById("btn-search").addEventListener("click", () => {
  removeActive();
  const searchValue = document.getElementById("input-search").value.trim().toLowerCase();
  fetch("https://openapi.programming-hero.com/api/words/all")
    .then((res) => res.json())
    .then((data) => {
      const filtered = data.data.filter((word) =>
        word.word.toLowerCase().includes(searchValue)
      );
      displayLevelWord(filtered);
    });
});