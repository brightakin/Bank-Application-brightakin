import "core-js/stable";

import "regenerator-runtime/runtime";


/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2022-08-24T17:01:17.194Z",
    "2022-08-26T23:36:17.929Z",
    "2022-08-27T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

//functions
const formatCurr = function (value, currency, locale) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

const formattedDate = function (date, locale) {
  const calcDisplayedDate = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const DisplayedDate = calcDisplayedDate(new Date(), date);

  if (DisplayedDate === 0) return "Today";
  if (DisplayedDate === 1) return "Yesterday";
  if (DisplayedDate <= 7) return `${DisplayedDate} days ago`;

  //const day = `${date.getDate()}`.padStart(2, 0);
  //const month = `${date.getMonth() + 1}`.padStart(2, 0);
  //const year = date.getFullYear();
  return new Intl.DateTimeFormat(locale).format(date);
};

const updateMovement = function (acc, sort = false) {
  const mov = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  containerMovements.innerHTML = "";
  mov.forEach(function (mov, i) {
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formattedDate(date, acc.locale);

    const str = mov > 0 ? "deposit" : "withdrawal";
    const html = `
    <div class="movements__row">
        <div class="movements__type movements__type--${str}">${i} ${str}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatCurr(
          mov,
          acc.currency,
          acc.locale
        )}</div>
    </div>`;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const updateDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, curr) => acc + curr, 0);
  labelBalance.textContent = formatCurr(acc.balance, acc.currency, acc.locale);
};

const updateSummary = function (acc) {
  const income = acc.movements
    .filter((mov) => mov > 0)
    .reduce((arr, curr) => arr + curr);
  labelSumIn.textContent = formatCurr(income, acc.currency, acc.locale);
  const expenditure = Math.abs(
    acc.movements.filter((mov) => mov < 0).reduce((arr, curr) => arr + curr, 0)
  );
  labelSumOut.textContent = formatCurr(expenditure, acc.currency, acc.locale);
  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((mov) => (mov * acc.interestRate) / 100)
    .filter((int) => int > 1)
    .reduce((arr, int) => arr + int);
  labelSumInterest.textContent = formatCurr(interest, acc.currency, acc.locale);
};

const createUserName = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((str) => str[0])
      .join("");
  });
};
createUserName(accounts);
const updateUi = function (acc) {
  updateMovement(acc);
  updateDisplayBalance(acc);
  updateSummary(acc);
};

const startLogoutTimer = function () {
  const tick = function () {
    const minute = String(Math.trunc(time / 60)).padStart(2, 0);
    const second = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${minute}:${second}`;

    if (time === 0) {
      clearTimeout(interval);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = "Login to get started";
    }
    time--;
  };
  let time = 300;
  tick();
  const interval = setInterval(tick, 1000);
  return interval;
};

//event handlers
let currentAccount, interval;

btnLogin.addEventListener("click", function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );

  const now = new Date();
  const options = {
    hour: "numeric",
    minute: "numeric",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  };

  //const day = `${now.getDate()}`.padStart(2, 0);
  //const month = `${now.getMonth() + 1}`.padStart(2, 0);
  //const year = now.getFullYear();
  //const hour = `${now.getHours()}`.padStart(2, 0);
  //const minute = `${now.getMinutes()}`.padStart(2, 0);

  labelDate.textContent = new Intl.DateTimeFormat(
    currentAccount.locale,
    options
  ).format(now);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //display UI and message
    containerApp.style.opacity = 100;
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    if (interval) clearInterval(interval);
    interval = startLogoutTimer();
    //display ui
    updateUi(currentAccount);
  }
});

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find(
    (acc) => inputTransferTo.value === acc.username
  );
  inputTransferAmount.value = inputTransferTo.value = "";
  if (
    amount > 0 &&
    currentAccount.balance > amount &&
    receiverAccount &&
    receiverAccount.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAccount.movementsDates.push(new Date().toISOString());
  }
  console.log(amount, receiverAccount);
  updateUi(currentAccount);

  //reset timer
  clearInterval(interval);
  interval = startLogoutTimer();
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov > amount * 0.1)
  ) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUi(currentAccount);

      //reset timer
      clearInterval(interval);
      interval = startLogoutTimer();
    }, 2500);
  }
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();
  if (
    Number(inputClosePin.value) === currentAccount.pin &&
    inputCloseUsername.value === currentAccount.username
  ) {
    const index = accounts.findIndex(
      (acc) => currentAccount.username === acc.username
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  }
  inputClosePin.value = inputCloseUsername.value = "";
});
let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  updateMovement(currentAccount, !sorted);
  sorted = !sorted;
});

//const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

//const deposit = movements.filter((mov) => mov > 0);

//const withdrawal = movements.filter((mov) => mov < 0);
//console.log(withdrawal);

//const account = accounts.find((acc) => acc.owner === "Jessica Davies");

//for (const acc of accounts) {
//  if (acc.owner === "Jessica Davies") {
//   const account = acc;
// }
//}

//setInterval(function () {
//const now = new Intl.DateTimeFormat("en-US", {
//hour: "numeric",
//minute: "numeric",
//second: "numeric",
//}).format(new Date());
//console.log(now);
//}, 1000);
