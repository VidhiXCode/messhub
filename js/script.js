// ===== DATA: menu for each day (Monday to Sunday) =====
var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
var meals = ["Breakfast", "Lunch", "Snacks", "Dinner"];
var times = ["7:30 - 9:30 am", "12:30 - 2:30 pm", "5:00 - 6:00 pm", "7:30 - 9:30 pm"];
var menu = {
  Monday:    ["Poha,Boiled eggs,Tea", "Rajma,Rice,Roti,Salad", "Samosa,Chutney", "Paneer butter masala,Dal,Roti"],
  Tuesday:   ["Aloo paratha,Curd,Tea", "Chole,Rice,Roti", "Bread pakora,Ketchup", "Mix veg,Dal fry,Roti,Kheer"],
  Wednesday: ["Idli,Sambar,Chutney", "Kadhi pakora,Rice,Roti", "Veg sandwich,Tea", "Matar paneer,Dal,Roti"],
  Thursday:  ["Upma,Banana,Tea", "Dal makhani,Rice,Roti", "White sauce pasta", "Soya chaap,Jeera rice,Roti"],
  Friday:    ["Chole bhature,Lassi", "Veg biryani,Raita,Papad", "Maggi,Cold drink", "Aloo gobhi,Dal,Roti,Gulab jamun"],
  Saturday:  ["Puri bhaji,Tea", "Paneer curry,Pulao,Roti", "Veg momos,Chutney", "Fried rice,Manchurian"],
  Sunday:    ["Masala dosa,Sambar", "Special thali,Sweet", "Pav bhaji", "Kofta curry,Naan,Ice cream"]
};

// ===== HELPER FUNCTIONS =====
function $(id) { return document.getElementById(id); }

// Today's index: JavaScript gives Sunday = 0, so we shift it to Monday = 0
function todayIndex() { return (new Date().getDay() + 6) % 7; }

// Start and end of every meal, in minutes after midnight (same order as "meals")
// Breakfast 7:30-9:30, Lunch 12:30-2:30, Snacks 5:00-6:00, Dinner 7:30-9:30
var startMin = [450, 750, 1020, 1170];
var endMin   = [570, 870, 1080, 1290];

// Minutes passed since midnight right now
function minutesNow() {
  var d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

// Which meal is being served right now? Returns 0-3, or -1 if NO meal is being served
function currentMeal() {
  var now = minutesNow();
  for (var i = 0; i < 4; i++) {
    if (now >= startMin[i] && now < endMin[i]) return i;
  }
  return -1;
}

// The meal that started most recently (used to pre-select the feedback form)
function lastMeal() {
  var now = minutesNow(), last = 0;
  for (var i = 0; i < 4; i++) {
    if (now >= startMin[i]) last = i;
  }
  return last;
}

// Text for the status line on the home page
function statusText() {
  var m = currentMeal();
  if (m !== -1) return meals[m] + " is being served now (" + times[m] + ").";
  var now = minutesNow();
  for (var i = 0; i < 4; i++) {
    if (now < startMin[i]) return "No meal is being served right now. Next: " + meals[i] + ", " + times[i] + ".";
  }
  return "No meal is being served right now. Next: Breakfast tomorrow, " + times[0] + ".";
}

// Feedback is saved in the browser using localStorage
function getFeedback() { return JSON.parse(localStorage.getItem("feedback")) || []; }
function saveFeedback(list) { localStorage.setItem("feedback", JSON.stringify(list)); }

// Makes the HTML for one meal card. "word" is the search text (optional)
function makeCard(d, m, highlight, word) {
  var items = menu[days[d]][m].split(",");
  var html = "";
  for (var i = 0; i < items.length; i++) {
    if (!word || items[i].toLowerCase().indexOf(word) !== -1) {
      html += "<li>" + items[i] + "</li>";
    }
  }
  if (html === "") return "";   // nothing matched the search
  var badge = highlight ? '<span class="badge">Serving now</span>' : "";
  var css = highlight ? "card now" : "card";
  return '<article class="' + css + '"><h2>' + meals[m] + badge + "</h2><small>" + times[m] + "</small><ul>" + html + "</ul></article>";
}

// Shows an error under a field. Returns true if the field is OK.
function check(id, isValid, message) {
  $(id + "-err").textContent = isValid ? "" : message;
  if ($(id)) $(id).className = isValid ? "" : "bad";
  return isValid;
}

// ===== HOME PAGE =====
function homePage() {
  $("title").textContent = days[todayIndex()] + "'s menu";

  // Draws the 4 cards. Only the meal that is being served right now gets highlighted.
  function drawCards() {
    var html = "";
    for (var m = 0; m < 4; m++) html += makeCard(todayIndex(), m, m === currentMeal(), "");
    $("grid").innerHTML = html;
    $("status").textContent = statusText();
  }
  drawCards();
  setInterval(drawCards, 30000);   // check again every 30 seconds

  // Live clock, updates every second
  setInterval(function () { $("clock").textContent = new Date().toLocaleTimeString(); }, 1000);

  // "Surprise me" picks a random dish from the whole week
  $("surprise").onclick = function () {
    var d = Math.floor(Math.random() * 7), m = Math.floor(Math.random() * 4);
    var items = menu[days[d]][m].split(",");
    var dish = items[Math.floor(Math.random() * items.length)];
    $("pick").textContent = "Try: " + dish + " (" + days[d] + " " + meals[m].toLowerCase() + ")";
  };
}

// ===== WEEKLY MENU PAGE =====
function menuPage() {
  var day = todayIndex(), meal = -1, word = "";   // meal -1 means "all meals"

  // Create the day buttons and meal buttons
  var dayHtml = "", mealHtml = '<button class="chip" data-m="-1">All meals</button>';
  for (var i = 0; i < 7; i++) dayHtml += '<button class="chip" data-d="' + i + '">' + days[i].slice(0, 3) + "</button>";
  for (var j = 0; j < 4; j++) mealHtml += '<button class="chip" data-m="' + j + '">' + meals[j] + "</button>";
  $("days").innerHTML = dayHtml;
  $("meals").innerHTML = mealHtml;

  function show() {
    // highlight the selected buttons
    for (var i = 0; i < 7; i++) $("days").children[i].className = i === day ? "chip on" : "chip";
    for (var j = 0; j < 5; j++) $("meals").children[j].className = j - 1 === meal ? "chip on" : "chip";
    $("heading").textContent = days[day] + (meal === -1 ? "" : " - " + meals[meal]);
    // build the cards
    var html = "";
    for (var m = 0; m < 4; m++) {
      if (meal === -1 || meal === m) html += makeCard(day, m, day === todayIndex() && m === currentMeal(), word);
    }
    $("grid").innerHTML = html || "<p>No dish found. Try another word or day.</p>";
  }

  $("days").onclick = function (e) { if (e.target.dataset.d) { day = +e.target.dataset.d; show(); } };
  $("meals").onclick = function (e) { if (e.target.dataset.m) { meal = +e.target.dataset.m; show(); } };
  $("search").oninput = function () { word = $("search").value.toLowerCase().trim(); show(); };
  show();
}

// ===== FEEDBACK PAGE =====
function feedbackPage() {
  var f = $("fbForm");
  var words = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

  // Fill the day and meal drop-downs, and select today by default
  for (var i = 0; i < 7; i++) f.day.innerHTML += "<option>" + days[i] + "</option>";
  for (var j = 0; j < 4; j++) f.meal.innerHTML += "<option>" + meals[j] + "</option>";
  f.day.value = days[todayIndex()];
  f.meal.value = meals[currentMeal() === -1 ? lastMeal() : currentMeal()];

  // Show a word when a rating is chosen
  f.onchange = function (e) {
    if (e.target.name === "rating") $("ratingWord").textContent = words[e.target.value];
  };
  // Live character counter
  f.comment.oninput = function () { $("count").textContent = f.comment.value.length + " / 300"; };

  f.onsubmit = function (e) {
    e.preventDefault();   // stop the page from reloading
    var name = f.name.value.trim(), enroll = f.enroll.value.trim(), comment = f.comment.value.trim();

    // Validation: every check must pass
    var ok = true;
    ok = check("name", /^[A-Za-z ]{2,40}$/.test(name), "Enter your name (letters only).") && ok;
    ok = check("enroll", /^S\d{2}[A-Z]{3,5}U\d{4}$/i.test(enroll), "Enter a valid enrollment number, like S26CSEU0276.") && ok;
    ok = check("rating", f.rating.value !== "", "Please choose a rating from 1 to 5.") && ok;
    ok = check("comment", comment.length >= 10, "Write at least 10 characters.") && ok;
    if (!ok) return;

    // Save the feedback
    var list = getFeedback();
    list.push({ day: f.day.value, meal: f.meal.value, rating: Number(f.rating.value), comment: comment });
    saveFeedback(list);
    $("ok").innerHTML = "Thank you, " + name + "! Your feedback is saved. <a href='ratings.html'>See ratings</a>";
    f.reset();
    $("ratingWord").textContent = "";
    $("count").textContent = "0 / 300";
  };
}

// ===== RATINGS PAGE =====
function ratingsPage() {
  function show() {
    var list = getFeedback(), total = 0, bars = "", recent = "";
    for (var i = 0; i < list.length; i++) total += list[i].rating;
    $("overall").textContent = list.length ? (total / list.length).toFixed(1) + " / 5" : "No ratings yet";
    $("total").textContent = list.length + " response(s)";

    // One bar for each meal: average rating out of 5
    for (var m = 0; m < 4; m++) {
      var sum = 0, count = 0;
      for (var i = 0; i < list.length; i++) {
        if (list[i].meal === meals[m]) { sum += list[i].rating; count++; }
      }
      var avg = count ? sum / count : 0;
      bars += '<div class="bar"><span>' + meals[m] + '</span><div class="track"><div class="fill" style="width:' + avg * 20 + '%"></div></div><b>' + avg.toFixed(1) + "</b></div>";
    }
    $("bars").innerHTML = bars;

    // Last 5 comments, newest first
    for (var k = list.length - 1; k >= 0 && k >= list.length - 5; k--) {
      recent += "<li><b>" + list[k].rating + "/5</b> for " + list[k].day + " " + list[k].meal.toLowerCase() + "<br>" + list[k].comment + "</li>";
    }
    $("recent").innerHTML = recent || "<li>No feedback yet. Rate a meal first.</li>";
  }

  // Sample data button (for demo)
  $("sample").onclick = function () {
    var list = getFeedback();
    for (var i = 0; i < 12; i++) {
      list.push({ day: days[i % 7], meal: meals[i % 4], rating: (i * 3) % 5 + 1, comment: "Sample comment " + (i + 1) });
    }
    saveFeedback(list);
    show();
  };
  $("clear").onclick = function () {
    if (confirm("Delete all feedback?")) { saveFeedback([]); show(); }
  };
  show();
}

// ===== CONTACT PAGE =====
function contactPage() {
  var f = $("ctForm");
  f.onsubmit = function (e) {
    e.preventDefault();
    var ok = true;
    ok = check("name", /^[A-Za-z ]{2,40}$/.test(f.name.value.trim()), "Enter your name (letters only).") && ok;
    ok = check("email", /^\S+@\S+\.\S+$/.test(f.email.value.trim()), "Enter a valid email address.") && ok;
    ok = check("message", f.message.value.trim().length >= 10, "Write at least 10 characters.") && ok;
    if (ok) { $("ok").textContent = "Message checked. This demo has no server, so nothing is sent."; f.reset(); }
  };
}

// ===== START: run the function for the current page =====
var page = document.body.id;
if (page === "home") homePage();
if (page === "menu") menuPage();
if (page === "feedback") feedbackPage();
if (page === "ratings") ratingsPage();
if (page === "contact") contactPage();
