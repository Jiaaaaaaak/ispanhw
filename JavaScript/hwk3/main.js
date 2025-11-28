// ====== 假資料：餐廳 / 食物列表 ======
const FOOD_DATA = [
    // 飯類
    { name: "滷肉飯＋貢丸湯", priceRange: "70-90", category: "rice", tag: "飯類" },
    { name: "雞腿飯", priceRange: "110-130", category: "rice", tag: "飯類" },
    { name: "泰式打拋豬飯", priceRange: "110-140", category: "rice", tag: "微辣" },
    { name: "咖哩飯", priceRange: "110-140", category: "rice", tag: "微辣" },

    // 麵類
    { name: "紅燒牛肉麵", priceRange: "130-160", category: "noodle", tag: "麵類" },
    { name: "麻醬涼麵＋味噌湯", priceRange: "75-95", category: "noodle", tag: "清爽" },
    { name: "炸醬麵", priceRange: "80-110", category: "noodle", tag: "麵類" },

    // 便當
    { name: "排骨便當", priceRange: "95-120", category: "bento", tag: "便當" },
    { name: "控肉便當", priceRange: "95-120", category: "bento", tag: "便當" },

    // 粥/鍋物
    { name: "皮蛋瘦肉粥", priceRange: "70-90", category: "soup", tag: "粥" },
    { name: "小火鍋", priceRange: "100-150", category: "soup", tag: "鍋" },


    // 清爽
    { name: "和風雞肉沙拉", priceRange: "110-150", category: "light", tag: "清爽" },
    { name: "鮪魚生菜沙拉", priceRange: "90-130", category: "light", tag: "清爽" },
    { name: "夏威夷生魚飯", priceRange: "120-200", category: "light", tag: "清爽" },

    // 輕食類
    { name: "美式起司漢堡", priceRange: "120-160", category: "lightmeal", tag: "漢堡" },
    { name: "培根牛肉堡", priceRange: "150-180", category: "lightmeal", tag: "漢堡" },
    { name: "鮪魚潛艇堡", priceRange: "90-120", category: "lightmeal", tag: "潛艇堡" },
    { name: "雞肉凱薩潛艇堡", priceRange: "110-140", category: "lightmeal", tag: "潛艇堡" },
    { name: "墨西哥雞肉捲", priceRange: "90-130", category: "lightmeal", tag: "肉捲" },
    { name: "脆皮椒鹽雞腿漢堡", priceRange: "140-170", category: "lightmeal", tag: "漢堡" }
];

// ====== 元素取得 ======
const suggestCard = document.getElementById("suggest-card");
const categoryButtons = document.querySelectorAll(".category-btn");
const btnRandom = document.getElementById("btn-random");

const orderForm = document.getElementById("order-form");
const inputName = document.getElementById("order-name");
const inputPrice = document.getElementById("order-price");
const orderListEl = document.getElementById("order-list");
const emptyTextEl = document.getElementById("empty-text");
const totalCountEl = document.getElementById("total-count");
const totalAmountEl = document.getElementById("total-amount");
const btnClear = document.getElementById("btn-clear");

// ====== 狀態 ======
let currentCategory = "all";
let orders = [];

// localStorage key
const STORAGE_KEY = "group_order_data_v1";

// ====== 工具函式 ======
function randomPick(array) {
    if (!array.length) return null;
    const index = Math.floor(Math.random() * array.length);
    return array[index];
}

// 讀取 localStorage
function loadOrdersFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
        orders = JSON.parse(saved);
    } catch (e) {
        console.error("解析 localStorage 失敗", e);
        orders = [];
    }
}

// 儲存到 localStorage
function saveOrdersToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

// ====== 抽餐邏輯 ======
function getFilteredFood() {
    if (currentCategory === "all") return FOOD_DATA;
    return FOOD_DATA.filter((item) => item.category === currentCategory);
}

function renderSuggestion(food) {
    if (!food) {
        suggestCard.innerHTML = `<p class="suggest-placeholder">這個分類目前沒有餐點，可以先試試「全部隨機」 🍱</p>`;
        return;
    }

    suggestCard.innerHTML = `
    <div class="suggest-info">
      <p class="suggest-name">${food.name}</p>
      <p class="suggest-meta">大約價位：${food.priceRange} 元</p>
      <span class="suggest-tag">${food.tag}</span>
    </div>
    <div class="suggest-emoji">🍚</div>
  `;
}

function handleRandomClick() {
    const list = getFilteredFood();
    if (!list.length) {
        renderSuggestion(null);
        return;
    }

    // 加上 flip class → 啟動動畫
    suggestCard.classList.add("flip");

    // 在動畫 0.25 秒（翻到一半）時換內容
    setTimeout(() => {
        const finalFood = randomPick(list);
        renderSuggestion(finalFood);
    }, 250);

    // 動畫結束後移除 class，才能下一次再觸發
    suggestCard.addEventListener("animationend", () => {
        suggestCard.classList.remove("flip");
    }, { once: true });
}

function handleCategoryClick(e) {
    const btn = e.target.closest(".category-btn");
    if (!btn) return;
    currentCategory = btn.dataset.category;

    // active 樣式
    categoryButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // 一選類別就抽一次
    const list = getFilteredFood();
    const temp = randomPick(list);
    renderSuggestion(temp);

    suggestCard.classList.remove("animate");
    void suggestCard.offsetWidth;
    suggestCard.classList.add("animate");
}



// ====== 團訂邏輯 ======
function renderOrders() {
    orderListEl.innerHTML = "";

    if (!orders.length) {
        emptyTextEl.style.display = "block";
    } else {
        emptyTextEl.style.display = "none";
    }

    let totalAmount = 0;

    orders.forEach((order, index) => {
        totalAmount += order.price;

        const li = document.createElement("li");
        li.className = "order-item";

        li.innerHTML = `
      <div class="order-item-main">
        <span class="order-item-name">${order.name}</span>
        <span class="order-item-price">${order.price} 元</span>
      </div>
      <button class="btn order-item-btn" data-index="${index}">刪除</button>
    `;

        orderListEl.appendChild(li);
    });

    totalCountEl.textContent = orders.length;
    totalAmountEl.textContent = totalAmount;
}

function handleAddOrder(e) {
    e.preventDefault();

    const name = inputName.value.trim();
    const priceValue = inputPrice.value.trim();

    if (!name || !priceValue) {
        alert("請填寫餐點名稱與價格");
        return;
    }

    const price = parseInt(priceValue, 10);
    if (isNaN(price) || price < 0) {
        alert("價格請輸入正確的數字");
        return;
    }

    orders.push({ name, price });
    saveOrdersToStorage();
    renderOrders();

    // 清空輸入框
    inputName.value = "";
    inputPrice.value = "";
    inputName.focus();
}

function handleOrderListClick(e) {
    const btn = e.target.closest(".order-item-btn");
    if (!btn) return;

    const index = parseInt(btn.dataset.index, 10);
    if (isNaN(index)) return;

    orders.splice(index, 1);
    saveOrdersToStorage();
    renderOrders();
}

function handleClear() {
    if (!orders.length) return;
    const sure = confirm("確定要清空全部團訂嗎？");
    if (!sure) return;

    orders = [];
    saveOrdersToStorage();
    renderOrders();
}

// ====== 初始化 ======
function init() {
    // 綁定事件
    categoryButtons.forEach((btn) =>
        btn.addEventListener("click", handleCategoryClick)
    );
    btnRandom.addEventListener("click", handleRandomClick);

    orderForm.addEventListener("submit", handleAddOrder);
    orderListEl.addEventListener("click", handleOrderListClick);
    btnClear.addEventListener("click", handleClear);

    // 載入 localStorage
    loadOrdersFromStorage();
    renderOrders();
}

init();