const words =
  "in one good real one not school set they state high life consider on and not come what also for set point can want as while with of order child about school thing never hold find order each too between program work end you home place around while place problem end begin interest while public or where see time those increase interest be give end think seem small as both another a child same eye you between way do who into again good fact than under very head become real possible some write know however late each that with because that place nation only for each change form consider we would interest with world so order or run more open that large write turn never over open each over change still old take hold need give by consider line only leave while what set up number part form want against great problem can because head so first this here would course become help year first end want both fact public long word down also long for without new turn against the because write seem line interest call not if line thing what work people way may old consider leave hold want life between most place may if go who need fact such program where which end off child down change to from people high during people find to however into small new general it do that could old for last get another hand much eye great no work and with but good there last think can around use like number never since world need what we around part show new come seem while some and since still small these you general which seem will place come order form how about just also they with state late use both early too lead general seem there point take general seem few out like might under if ask while such interest feel word right again how about system such between late want fact up problem stand new say move a lead small however large public out by eye here over so be way use like say people work for since interest so face order school good not most run problem group run she late other problem real form what just high no man do under would to each too end point give number child through so this large see get form also all those course to work during about he plan still so like down he look down where course at who plan way so since come against he all who at world because while so few last these mean take house who old way large no first too now off would in this course present order home public school back own little about he develop of do over help day house stand present another by few come that down last or use say take would each even govern play around back under some line think she even when from do real problem between long as there school do as mean to all on other good may from might call world thing life turn of he look last problem after get show want need thing old other during be again develop come from consider the now number say life interest to system only group world same state school one problem between for turn run at very against eye must go both still all a as so after play eye little be those should out after which these both much house become both school this he real and may mean time by real number other as feel at end ask plan come turn by all head increase he present increase use stand after see order lead than system here ask in of look point little too without each for both but right we come world much own set we right off long those stand go both but under now must real general then before with much those at no of we only back these person plan from run new as own take early just increase only look open follow get that on system the mean plan man over it possible if most late line would first without real hand say turn point small set at in system however to be home show new again come under because about show face child know person large program how over could thing from out world while nation stand part run have look what many system order some one program you great could write day do he any also where child late face eye run still again on by as call high the must by late little mean never another seem to leave because for day against public long number word about after much need open change also".split(
    " "
  );

const wordsCount = words.length;
const AFK_DELAY = 5000; 

let gameTime = 30 * 1000; 
let timer = null;
let gameStart = null;
let totalMistakes = 0;
let totalCharactersTyped = 0;
let lastTypedTime = Date.now();
let afkTimeout;
let isGameActive = false;

function addClass(el, ...names) {
  el.classList.add(...names);
}

function removeClass(el, ...names) {
  el.classList.remove(...names);
}

function addClass(el, ...classes) {
  el.classList.add(...classes);
}

function removeClass(el, ...classes) {
  el.classList.remove(...classes);
}

function randomWord() {
  const randomIndex = Math.floor(Math.random() * wordsCount);
  return words[randomIndex];
}

function formatWord(word) {
  return `<div class="word"><span class="letter">${word
    .split("")
    .join('</span><span class="letter">')}</span></div>`;
}

function showScreen(screenId) {
  ["start-screen", "game-screen", "end-screen", "highscores-screen"].forEach(
    (id) => {
      document.getElementById(id).style.display =
        id === screenId ? "block" : "none";
    }
  );
}

function startGame() {
  const selectedTime = document.getElementById("nav-test-duration").value;
  gameTime = parseInt(selectedTime) * 1000;
  showScreen("game-screen");
  newGame();
  document.getElementById("game").focus();

  isGameActive = true;
  startTimer();

  clearTimeout(afkTimeout);
  lastTypedTime = Date.now();
  hideAfkPopup();
}

function newGame() {
  clearInterval(timer);
  clearInterval(countdownTimer);
  hideCountdown();
  totalMistakes = 0;
  totalCharactersTyped = 0;
  const wordsContainer = document.getElementById("words");
  wordsContainer.innerHTML = "";
  wordsContainer.style.marginTop = "0px";
  for (let i = 0; i < 200; i++) {
    wordsContainer.innerHTML += formatWord(randomWord());
  }
  addClass(document.querySelector(".word"), "current");
  addClass(document.querySelector(".letter"), "current");
  document.getElementById("info").textContent = (gameTime / 1000).toString();
  removeClass(document.getElementById("game"), "over");
  timer = null;
  updateWordColors();
  updateCursor();
  hideAfkPopup();
  isGameActive = true;
  document.getElementById("game").focus();
}

function goToHomeScreen() {
  showScreen("start-screen");
  clearInterval(timer);
  clearInterval(countdownTimer);
  hideCountdown();
  document.getElementById("words").innerHTML = "";
  document.getElementById("game").classList.remove("over");
  isGameActive = false;
  hideAfkPopup();
}

function getWpm() {
  const words = [...document.querySelectorAll(".word")];
  const lastTypedWord = document.querySelector(".word.current");
  const lastTypedWordIndex = words.indexOf(lastTypedWord);
  const typedWords = words.slice(0, lastTypedWordIndex);
  const correctWords = typedWords.filter((word) => {
    const letters = [...word.children];
    const incorrectLetters = letters.filter((letter) =>
      letter.classList.contains("incorrect")
    );
    const correctLetters = letters.filter((letter) =>
      letter.classList.contains("correct")
    );
    return (
      incorrectLetters.length === 0 && correctLetters.length === letters.length
    );
  });
  return (correctWords.length / (gameTime / 1000)) * 60;
}

function calculateAccuracy() {
  return (
    ((totalCharactersTyped - totalMistakes) / totalCharactersTyped) * 100 || 0
  );
}

let highscores = JSON.parse(localStorage.getItem("highscores")) || [];

function saveHighscore(wpm, accuracy) {
  const name = document.getElementById("highscore-name").value.trim();
  if (name) {
    const score = { name, wpm, accuracy, date: new Date().toISOString() };
    highscores.push(score);
    highscores.sort((a, b) => b.wpm - a.wpm);
    highscores = highscores.slice(0, 10); 
    localStorage.setItem("highscores", JSON.stringify(highscores));
    showHighscores();
  }
}

function showHighscores() {
  const highscoresHTML = highscores
    .map(
      (score, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${score.name}</td>
      <td>${score.wpm.toFixed(2)}</td>
      <td>${score.accuracy.toFixed(2)}%</td>
      <td>${new Date(score.date).toLocaleDateString()}</td>
    </tr>
  `
    )
    .join("");

  const highscoresTable = `
    <h2>Highscores</h2>
    <table id="highscores-table">
      <tr>
        <th>Rank</th>
        <th>Name</th>
        <th>WPM</th>
        <th>Accuracy</th>
        <th>Date</th>
      </tr>
      ${highscoresHTML}
    </table>
  `;

  document.getElementById("highscores").innerHTML = highscoresTable;
  showScreen("highscores-screen");
}

document.body.insertAdjacentHTML(
  "beforeend",
  `
    <div id="afk-popup">
        <h2>AFK!!</h2>
        <p>You haven't typed anything for 5 seconds. Ready to continue?</p>
    </div>
`
);

function gameOver() {
  clearInterval(timer);
  clearInterval(countdownTimer);
  addClass(document.getElementById("game"), "over");
  isGameActive = false;
  hideAfkPopup(); 
  hideCountdown(); 

  const wpm = getWpm();
  const accuracy = calculateAccuracy();

  document.getElementById("final-wpm").textContent = wpm.toFixed(2);
  document.getElementById("final-accuracy").textContent = accuracy.toFixed(2);
  document.getElementById("total-mistakes").textContent = totalMistakes;

  if (highscores.length < 10 || wpm > highscores[highscores.length - 1].wpm) {
    document.getElementById("save-score-container").style.display = "block";
  } else {
    document.getElementById("save-score-container").style.display = "none";
  }

  showScreen("end-screen");
}

function gameOver() {
  clearInterval(timer);
  addClass(document.getElementById("game"), "over");
  const wpm = getWpm();
  const accuracy = calculateAccuracy();

  document.getElementById("final-wpm").textContent = wpm.toFixed(2);
  document.getElementById("final-accuracy").textContent = accuracy.toFixed(2);
  document.getElementById("total-mistakes").textContent = totalMistakes;

  if (highscores.length < 10 || wpm > highscores[highscores.length - 1].wpm) {
    document.getElementById("save-score-container").style.display = "block";
  } else {
    document.getElementById("save-score-container").style.display = "none";
  }

  showScreen("end-screen");
}

function updateWordColors() {
  const words = document.querySelectorAll(".word");
  let foundCurrent = false;
  let wordCount = 0;

  words.forEach((word) => {
    if (word.classList.contains("current")) {
      foundCurrent = true;
      word.classList.add("current");
      word.classList.remove("typed", "upcoming");
    } else if (foundCurrent) {
      if (wordCount >= 1) {
        word.classList.add("upcoming");
      }
      word.classList.remove("typed", "current");
    } else {
      word.classList.add("typed");
      word.classList.remove("current", "upcoming");
    }
    wordCount++;
  });

  document.querySelectorAll(".letter.correct").forEach((letter) => {
    letter.style.color = "var(--typedColor)";
  });
}

function updateCursor() {
  const currentWord = document.querySelector(".word.current");
  const currentLetter = currentWord.querySelector(".letter.current");
  const cursor = document.getElementById("cursor");

  if (currentLetter) {
    const rect = currentLetter.getBoundingClientRect();
    cursor.style.top = `${rect.top}px`;
    cursor.style.left = `${rect.left}px`;
  } else {
    const lastLetter = currentWord.querySelector(".letter:last-child");
    if (lastLetter) {
      const rect = lastLetter.getBoundingClientRect();
      cursor.style.top = `${rect.top}px`;
      cursor.style.left = `${rect.right}px`;
    }
  }

  cursor.style.display = "block";
  cursor.classList.remove("blink");
  cursor.classList.add("typing");

  if (getRemainingTime() > 10) {
    clearTimeout(afkTimeout);
    afkTimeout = setTimeout(() => {
      showAfkPopup();
    }, AFK_DELAY);
  }
}

function showAfkPopup() {
  if (isGameActive && getRemainingTime() > 10) {
    const popup = document.getElementById("afk-popup");
    popup.style.display = "block";
  }
}

document.getElementById("afk-popup").innerHTML +=
  '<button id="close-afk-popup">Close</button>';
document
  .getElementById("close-afk-popup")
  .addEventListener("click", hideAfkPopup);

function hideAfkPopup() {
  const popup = document.getElementById("afk-popup");
  popup.style.display = "none";
}

function handleKeyUp(ev) {
  const key = ev.key;
  const currentWord = document.querySelector(".word.current");
  const currentLetter = currentWord.querySelector(".letter.current");
  const expected = currentLetter?.textContent || " ";
  const isLetter = key.length === 1 && key !== " ";
  const isSpace = key === " ";
  const isBackspace = key === "Backspace";
  const isFirstLetter = currentLetter === currentWord.firstChild;

  if (document.querySelector("#game.over")) {
    return;
  }

  if (!timer) {
    startTimer();
  }

  if (isLetter) {
    if (currentLetter) {
      totalCharactersTyped++;
      if (key === expected) {
        addClass(currentLetter, "correct");
      } else {
        addClass(currentLetter, "incorrect");
        totalMistakes++;
      }
      removeClass(currentLetter, "current");
      if (currentLetter.nextSibling) {
        addClass(currentLetter.nextSibling, "current");
      }
    } else {
      totalMistakes++;
    }
  }

  if (isSpace) {
    if (expectedWord()) {
      moveToNextWord();
    } else {
      const unfinishedLetters = currentWord.querySelectorAll(".letter:not(.correct):not(.incorrect)");
      unfinishedLetters.forEach(letter => {
        addClass(letter, "incorrect");
        totalMistakes++;
      });
      moveToNextWord();
    }
    totalCharactersTyped++;
  }

  if (isBackspace) {
    if (currentLetter && isFirstLetter) {
      if (currentWord.previousElementSibling) {
        removeClass(currentWord, "current");
        addClass(currentWord.previousElementSibling, "current");
        removeClass(currentWord.previousElementSibling.lastChild, "correct", "incorrect");
        addClass(currentWord.previousElementSibling.lastChild, "current");
      }
    } else if (currentLetter) {
      removeClass(currentLetter, "current");
      addClass(currentLetter.previousSibling, "current");
      removeClass(currentLetter.previousSibling, "correct", "incorrect");
    } else {
      const lastLetter = currentWord.lastChild;
      addClass(lastLetter, "current");
      removeClass(lastLetter, "correct", "incorrect");
    }
  }

  updateCursor();
  updateWordColors();

  if (currentWord.getBoundingClientRect().top > 250) {
    const wordsContainer = document.getElementById("words");
    const margin = parseInt(wordsContainer.style.marginTop || "0px", 10);
    wordsContainer.style.marginTop = (margin - 35) + "px";
  }

  if (getRemainingTime() > 10) {
    lastTypedTime = Date.now();
    hideAfkPopup();
  }

  startCursorBlink();
}

function expectedWord() {
  const currentWord = document.querySelector(".word.current");
  const letters = [...currentWord.children];
  return letters.every(letter => letter.classList.contains("correct"));
}

function moveToNextWord() {
  const currentWord = document.querySelector(".word.current");
  const nextWord = currentWord.nextElementSibling;
  if (nextWord) {
    removeClass(currentWord, "current");
    addClass(nextWord, "current");
    addClass(nextWord.firstChild, "current");
  }
}

let cursorBlinkTimeout;
function startCursorBlink() {
  const cursor = document.getElementById("cursor");
  clearTimeout(cursorBlinkTimeout);
  cursor.classList.remove("blink");
  cursor.classList.add("typing");

  cursorBlinkTimeout = setTimeout(() => {
    cursor.classList.remove("typing");
    cursor.classList.add("blink");
  }, 1000); 
}

function getRemainingTime() {
  const currentTime = Date.now();
  const msPassed = currentTime - gameStart;
  return Math.max(0, Math.round(gameTime / 1000 - msPassed / 1000));
}

function startTimer() {
  gameStart = Date.now();
  timer = setInterval(() => {
    const sLeft = getRemainingTime();

    if (sLeft <= 5) {
      showCountdown(sLeft);
    }

    if (sLeft <= 0) {
      gameOver();
      return;
    }
    document.getElementById("info").textContent = sLeft.toString();
  }, 1000);
}

let countdownTimer;

function showCountdown(seconds) {
  const countdownElement =
    document.getElementById("countdown") || createCountdownElement();
  countdownElement.textContent = seconds;
  countdownElement.style.display = "block";

  if (!countdownTimer) {
    countdownTimer = setInterval(() => {
      seconds--;
      if (seconds > 0) {
        countdownElement.textContent = seconds;
      } else {
        hideCountdown();
      }
    }, 1000);
  }
}

function hideCountdown() {
  const countdownElement = document.getElementById("countdown");
  if (countdownElement) {
    countdownElement.style.display = "none";
  }
  clearInterval(countdownTimer);
  countdownTimer = null;
}

function createCountdownElement() {
  const countdownElement = document.createElement("div");
  countdownElement.id = "countdown";
  countdownElement.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 10rem;
    font-weight: bold;
    color: var(--textPrimary);
    background-color: var(--bgColor);
    padding: 20px;
    border-radius: 10px;
    z-index: 1001;
    display: none;
    border: 5px solid var(--primaryColor);
  `;
  document.body.appendChild(countdownElement);
  return countdownElement;
}

function setTheme(theme) {
  const root = document.documentElement;
  const themeSwitch = document.getElementById("theme-switch");

  if (theme === "secondary") {
    root.classList.add("theme-secondary");
    themeSwitch.checked = true;
  } else {
    root.classList.remove("theme-secondary");
    themeSwitch.checked = false;
  }
  updateWordColors();
}

document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("newGameBtn").addEventListener("click", newGame);
document.getElementById("restart-btn").addEventListener("click", () => {
  showScreen("game-screen");
  newGame();
});

document
  .getElementById("view-highscores")
  .addEventListener("click", showHighscores);
document
  .getElementById("back-to-game")
  .addEventListener("click", () => showScreen("start-screen"));
document.getElementById("save-score").addEventListener("click", () => {
  const wpm = parseFloat(document.getElementById("final-wpm").textContent);
  const accuracy = parseFloat(
    document.getElementById("final-accuracy").textContent
  );
  saveHighscore(wpm, accuracy);
});

document.querySelectorAll(".view-highscores-btn").forEach((button) => {
  button.addEventListener("click", showHighscores);
});

document.getElementById("game").addEventListener("keyup", handleKeyUp);

document.getElementById("logo").addEventListener("click", goToHomeScreen);

document
  .getElementById("nav-test-duration")
  .addEventListener("change", (event) => {
    gameTime = parseInt(event.target.value) * 1000;
    document.getElementById("test-duration").value = event.target.value;
  });

document.getElementById("test-duration").addEventListener("change", (event) => {
  gameTime = parseInt(event.target.value) * 1000;
  document.getElementById("nav-test-duration").value = event.target.value;
});

document.getElementById("theme-switch").addEventListener("change", (event) => {
  setTheme(event.target.checked ? "secondary" : "blue");
});

setTheme("blue"); 
showScreen("start-screen");

document.getElementById("nav-controls").style.display = "flex";
