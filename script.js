// ===== Demo login details (ONLY for a college project; not secure for real websites) =====
const VALID_USER = "dexent";
const VALID_PASS = "rajput";
const DELIVERY_FEE = 100;

// ===== Menu data: an array of objects =====
const menuItems = [
  { id: 1, name: "Zinger Burger", price: 450, category: "Fast Food", desc: "Crispy spicy chicken fillet with lettuce and creamy sauce.", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=70", icon: "🍔" },
  { id: 2, name: "Chicken Biryani", price: 350, category: "Pakistani Food", desc: "Fragrant basmati rice cooked with tender spiced chicken.", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=70", icon: "🍛" },
  { id: 3, name: "Pizza", price: 1200, category: "Fast Food", desc: "Large cheesy pizza with fresh toppings and a golden crust.", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=70", icon: "🍕" },
  { id: 4, name: "Chicken Shawarma", price: 250, category: "Fast Food", desc: "Juicy chicken wrapped in warm bread with garlic sauce.", img: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&q=70", icon: "🌯" },
  { id: 5, name: "French Fries", price: 200, category: "Fast Food", desc: "Golden, crunchy fries with a pinch of salt.", img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=70", icon: "🍟" },
  { id: 6, name: "Club Sandwich", price: 400, category: "Fast Food", desc: "Triple-layer sandwich with chicken, egg and fresh veggies.", img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=70", icon: "🥪" },
  { id: 7, name: "Chicken Broast", price: 550, category: "Pakistani Food", desc: "Crispy pressure-fried chicken pieces served hot.", img: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&q=70", icon: "🍗" },
  { id: 8, name: "Cold Drink", price: 100, category: "Drinks", desc: "Chilled soft drink to go with your meal.", img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=70", icon: "🥤" }
];
const categories = ["All", "Fast Food", "Pakistani Food", "Drinks"];

// ===== App state =====
let cart = [];                 // each item: { id, qty }
let activeCategory = "All";
let searchText = "";
let lastTotal = 0;

// Helper to find an element by id
const $ = (id) => document.getElementById(id);
const money = (n) => "Rs. " + n.toLocaleString("en-US");

// Shown when an image fails to load
function fallbackBox(icon) {
  const box = document.createElement("div");
  box.className = "fallback";
  box.textContent = icon;
  return box;
}

// ===== LOGIN =====
$("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();                       // stop page reload (Enter key also triggers submit)
  const user = $("username").value.trim();
  const pass = $("password").value;

  if (user === VALID_USER && pass === VALID_PASS) {
    $("loginError").textContent = "";
    $("loginPage").classList.add("hidden");
    $("mainSite").classList.remove("hidden");
    $("welcomeMsg").textContent = "Welcome, " + user + "! Enjoy your meal at Foodie Express.";
    window.scrollTo(0, 0);
  } else {
    $("loginError").textContent = "Incorrect username or password. Please try again.";
  }
});

// Show / Hide password
$("togglePass").addEventListener("click", function () {
  const field = $("password");
  const hiding = field.type === "password";
  field.type = hiding ? "text" : "password";
  this.textContent = hiding ? "Hide" : "Show";
});

// Logout: hide the site and show the login page again
$("logoutBtn").addEventListener("click", function () {
  closeCart();
  $("mainSite").classList.add("hidden");
  $("loginPage").classList.remove("hidden");
  $("loginForm").reset();
  $("password").type = "password";
  $("togglePass").textContent = "Show";
});

// ===== NAVIGATION (mobile) =====
$("menuToggle").addEventListener("click", () => $("nav").classList.toggle("open"));
$("nav").addEventListener("click", () => $("nav").classList.remove("open"));

// ===== MENU: search + category filter work together =====
function renderCategories() {
  $("categoryButtons").innerHTML = "";
  for (const cat of categories) {
    const btn = document.createElement("button");
    btn.textContent = cat;
    if (cat === activeCategory) btn.classList.add("active");
    btn.addEventListener("click", function () {
      activeCategory = cat;
      renderCategories();
      renderMenu();
    });
    $("categoryButtons").appendChild(btn);
  }
}

function renderMenu() {
  const grid = $("menuGrid");
  grid.innerHTML = "";
  let shown = 0;

  for (const item of menuItems) {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchText);
    if (!(matchesCategory && matchesSearch)) continue;
    shown++;

    const card = document.createElement("article");
    card.className = "card";
    const img = document.createElement("img");
    img.src = item.img;
    img.alt = item.name;
    img.onerror = () => img.replaceWith(fallbackBox(item.icon));   // keeps layout if image fails
    const body = document.createElement("div");
    body.className = "card-body";
    body.innerHTML = "<h3>" + item.name + "</h3><p>" + item.desc + "</p><div class='price'>" + money(item.price) + "</div>";
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = "Add to Cart";
    btn.addEventListener("click", () => addToCart(item.id));
    body.appendChild(btn);
    card.append(img, body);
    grid.appendChild(card);
  }
  $("noResults").classList.toggle("hidden", shown > 0);
}

$("searchBox").addEventListener("input", function () {
  searchText = this.value.trim().toLowerCase();
  renderMenu();
});

// ===== CART =====
function saveCart() { localStorage.setItem("foodieCart", JSON.stringify(cart)); }   // only food items, no credentials
function loadCart() {
  try { cart = JSON.parse(localStorage.getItem("foodieCart")) || []; } catch (e) { cart = []; }
  cart = cart.filter(c => menuItems.some(m => m.id === c.id));
}

function addToCart(id) {
  const line = cart.find(c => c.id === id);
  if (line) line.qty++; else cart.push({ id: id, qty: 1 });
  renderCart();
  openCart();
}

function changeQty(id, change) {
  const line = cart.find(c => c.id === id);
  if (!line) return;
  line.qty += change;
  if (line.qty <= 0) removeItem(id); else renderCart();
}

function removeItem(id) {
  cart = cart.filter(c => c.id !== id);
  renderCart();
}

function renderCart() {
  const box = $("cartItems");
  box.innerHTML = "";
  let subtotal = 0, count = 0;

  for (const line of cart) {
    const item = menuItems.find(m => m.id === line.id);
    subtotal += item.price * line.qty;
    count += line.qty;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = "<div><strong>" + item.name + "</strong><small>" + money(item.price) + " each</small></div>";
    const right = document.createElement("div");
    right.innerHTML = "<strong>" + money(item.price * line.qty) + "</strong>";

    const qty = document.createElement("div");
    qty.className = "qty";
    const minus = document.createElement("button"); minus.textContent = "−"; minus.setAttribute("aria-label", "Decrease quantity");
    const num = document.createElement("span"); num.textContent = line.qty;
    const plus = document.createElement("button"); plus.textContent = "+"; plus.setAttribute("aria-label", "Increase quantity");
    const rem = document.createElement("button"); rem.className = "remove"; rem.textContent = "Remove";
    minus.addEventListener("click", () => changeQty(line.id, -1));
    plus.addEventListener("click", () => changeQty(line.id, 1));
    rem.addEventListener("click", () => removeItem(line.id));
    qty.append(minus, num, plus, rem);
    row.firstChild.appendChild(qty);
    row.appendChild(right);
    box.appendChild(row);
  }

  if (cart.length === 0) box.innerHTML = "<p class='empty'>Your cart is empty. Add something tasty from the menu!</p>";

  const fee = cart.length > 0 ? DELIVERY_FEE : 0;
  lastTotal = subtotal + fee;
  $("subtotal").textContent = money(subtotal);
  $("delivery").textContent = money(fee);
  $("total").textContent = money(lastTotal);
  $("cartCount").textContent = count;
  saveCart();
}

function openCart() { $("cartPanel").classList.add("open"); }
function closeCart() { $("cartPanel").classList.remove("open"); $("cartMsg").textContent = ""; }
$("cartBtn").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);
$("orderNow").addEventListener("click", closeCart);

// ===== CHECKOUT =====
$("checkoutBtn").addEventListener("click", function () {
  if (cart.length === 0) {
    $("cartMsg").textContent = "Your cart is empty. Add items before checkout.";
    return;
  }
  $("cartMsg").textContent = "";
  $("orderError").textContent = "";
  $("checkoutForm").classList.remove("hidden");
  $("confirmBox").classList.add("hidden");
  $("checkoutModal").classList.remove("hidden");
});
$("cancelCheckout").addEventListener("click", () => $("checkoutModal").classList.add("hidden"));

$("checkoutForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = $("oName").value.trim();
  const phone = $("oPhone").value.trim();
  const address = $("oAddress").value.trim();
  const phoneOk = /^[0-9+\-\s]{10,15}$/.test(phone);

  if (name === "" || phone === "" || address === "") {
    $("orderError").textContent = "Please fill in your name, phone number and address.";
  } else if (!phoneOk) {
    $("orderError").textContent = "Please enter a valid phone number (10 to 15 digits).";
  } else if (cart.length === 0) {
    $("orderError").textContent = "Your cart is empty.";
  } else {
    const orderNumber = "FE-" + Math.floor(100000 + Math.random() * 900000);
    $("orderNo").textContent = orderNumber;
    $("orderTotal").textContent = money(lastTotal);
    $("checkoutForm").classList.add("hidden");
    $("confirmBox").classList.remove("hidden");
    cart = [];                      // clear the cart after the demo order
    renderCart();
    this.reset();
  }
});

$("closeConfirm").addEventListener("click", function () {
  $("checkoutModal").classList.add("hidden");
  closeCart();
});

// ===== CONTACT FORM (demo only) =====
$("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = $("cName").value.trim();
  const email = $("cEmail").value.trim();
  const message = $("cMessage").value.trim();
  const msg = $("contactMsg");
  msg.style.color = "#b3261e";

  if (name === "" || email === "" || message === "") {
    msg.textContent = "Please fill in your name, email and message.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    msg.textContent = "Please enter a valid email address.";
  } else {
    msg.style.color = "#2e7d32";
    msg.textContent = "Thank you, " + name + "! Your message was received (demo only, no email was sent).";
    this.reset();
  }
});

// ===== START =====
loadCart();
renderCategories();
renderMenu();
renderCart();
