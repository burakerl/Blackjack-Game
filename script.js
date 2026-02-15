const aiCard = document.querySelectorAll(".ai-card-img");
const playerCard = document.querySelectorAll(".player-card-img");
const hitBtn = document.querySelector("#hit-btn");
const stayBtn = document.querySelector("#stay-btn");
const againBtn = document.querySelector("#again-btn");
const dounbleDBtn = document.querySelector("#doubledown-btn");
const splitBtn = document.querySelector("#split-btn");
const aiCards = document.querySelector(".cards-ai");
const playerCards = document.querySelector(".cards-player");
const msg = document.querySelector(".message");

let deckID = "";
let aiCardsValue = 0;
let playerCardsValue = 0;
let current = 0;

function normalizeValue(value, target) {
  if (value === "KING" || value === "QUEEN" || value === "JACK") {
    return 10;
  }
  if (value === "ACE") {
    if (target === "player") {
      current = playerCardsValue;
    } else {
      current = aiCardsValue;
    }
    if (current + 11 > 21) {
      return 1;
    } else {
      return 11;
    }
  }
  return Number(value);
}

function checkPoints() {
  if (
    playerCardsValue === aiCardsValue ||
    (playerCardsValue > 21 && aiCardsValue > 21)
  ) {
    msg.textContent = "It's a Tie!";
  } else if (playerCardsValue === 21 && aiCardsValue !== 21) {
    msg.textContent = "You Win!";
  } else if (playerCardsValue < 21 && aiCardsValue < playerCardsValue) {
    msg.textContent = "You Win!";
  } else if (aiCardsValue > 21 && playerCardsValue < 21) {
    msg.textContent = "You Win!";
  } else {
    msg.textContent = "You Lost!";
  }
  stayBtn.disabled = true;
}

async function startGame() {
  const response = await fetch(
    "https://deckofcardsapi.com/api/deck/new/draw/?count=2",
  );
  const data = await response.json();

  deckID = data.deck_id;

  playerCard[0].src = data.cards[0].image;
  playerCard[1].src = data.cards[1].image;

  playerCardsValue =
    normalizeValue(data.cards[0].value, "player") +
    normalizeValue(data.cards[1].value, "player");

  console.log("AI:", aiCardsValue, "Player:", playerCardsValue);
  againBtn.disabled = true;
  dounbleDBtn.disabled = true;
  splitBtn.disabled = true;

  if (playerCardsValue === 21) {
    displayRestart("Blackjack!!");
  }
}

async function drawCardTo(table, target) {
  const response = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`,
  );
  const data = await response.json();

  const img = document.createElement("img");
  img.classList.add("card-img");
  img.src = data.cards[0].image;
  table.appendChild(img);

  let value = normalizeValue(data.cards[0].value, target);

  if (target === "player") {
    playerCardsValue += value;
    console.log("Player total:", playerCardsValue);
  }
  if (target === "ai") {
    aiCardsValue += value;
    console.log("AI total:", aiCardsValue);
  }
  if (playerCardsValue === 21) {
    displayRestart("You win.");
  }
  if (playerCardsValue > 21) {
    displayRestart("You Lost.");
  }
}

hitBtn.addEventListener("click", () => {
  drawCardTo(playerCards, "player");
});

stayBtn.addEventListener("click", async () => {
  while (
    aiCardsValue < 19 &&
    aiCardsValue < playerCardsValue &&
    playerCardsValue <= 21
  ) {
    await drawCardTo(aiCards, "ai");
    if (aiCardsValue >= 21) {
      break;
    }
  }
  setTimeout(checkPoints, 1000);
  hitBtn.disabled = true;
  againBtn.disabled = false;

  againBtn.addEventListener("click", () => {
    window.location.reload();
  });
});

startGame();

function displayRestart(text) {
  msg.textContent = text;
  hitBtn.disabled = true;
  stayBtn.disabled = true;
  againBtn.disabled = false;
  againBtn.addEventListener("click", () => {
    window.location.reload();
  });
}
