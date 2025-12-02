// =======================
// 1. 初始化地圖
// =======================
const map = L.map("map").setView([23.7, 121], 7);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let markersLayer = L.layerGroup().addTo(map);


// =======================
// 2. icon - 重新定義為簡單的紅色圓點 (因為擴散改用 L.circle)
// =======================
function createQuakeIcon(mag) {
    // 根據規模調整中心點的大小
    const size = 10 + mag * 3;

    return L.divIcon({
        className: 'simple-quake-icon',
        html: `<div style="
            width:${size}px;
            height:${size}px;
            background:rgba(255, 0, 0, 0.9);
            border-radius:50%;
            border:2px solid white;
        "></div>`,
        iconSize: [size + 4, size + 4], // 加上邊框寬度
        iconAnchor: [(size + 4) / 2, (size + 4) / 2]
    });
}


// =======================
// 3. 抓資料
// =======================
let allQuakes = [];
const perPage = 30;
let currentPage = 1;

function loadEarthquakes() {
    // 請替換為您自己的 CWA 授權碼
    const cwaAuthorization = "CWA-E3E2F173-2244-4E1B-A685-3CB3254320A2";
    fetch(`https://opendata.cwa.gov.tw/api/v1/rest/datastore/E-A0015-001?Authorization=${cwaAuthorization}`)
        .then(res => res.json())
        .then(data => {
            console.log("地震 API 取得資料如下：", data);

            // 過濾掉沒有震央經緯度的資料
            const quakes = data.records.Earthquake.filter(q =>
                q.EarthquakeInfo.Epicenter.EpicenterLatitude &&
                q.EarthquakeInfo.Epicenter.EpicenterLongitude
            );
            allQuakes = quakes;

            renderPage(1);
        })
        .catch(err => console.error("地震資料錯誤", err));
}


// =======================
// 4. 渲染分頁
// =======================
function renderPage(page) {

    currentPage = page;

    const start = (page - 1) * perPage;
    const end = page * perPage;

    const pageData = allQuakes.slice(start, end);

    const tbody = document.getElementById("quake-list");
    tbody.innerHTML = "";

    pageData.forEach(q => {

        const info = q.EarthquakeInfo;
        const magnitude = q.EarthquakeInfo.EarthquakeMagnitude;

        const time = info.OriginTime;
        const loc = info.Epicenter.Location;
        const lat = info.Epicenter.EpicenterLatitude;
        const lng = info.Epicenter.EpicenterLongitude;
        const depth = info.FocalDepth;
        const mag = magnitude.MagnitudeValue; // 使用 MagnitudeValue

        const tr = document.createElement("tr");
        tr.className = "quake-row";

        tr.innerHTML = `
            <td>${time}</td>
            <td>${loc}</td>
            <td><span class="magnitude-tag mag-${Math.floor(mag)}">M ${mag}</span></td>
        `;

        tr.addEventListener("click", () => {
            focusOnQuake({ lat, lng, depth, loc, time, mag });
        });

        tbody.appendChild(tr);
    });

    renderPagination();
}


// =======================
// 5. 分頁按鈕
// =======================
function renderPagination() {
    const totalPages = Math.ceil(allQuakes.length / perPage);

    const paginationDiv = document.getElementById("pagination");
    paginationDiv.innerHTML = `
        <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="renderPage(${currentPage - 1})">上一頁</button>
        <span>第 ${currentPage} / ${totalPages} 頁</span>
        <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="renderPage(${currentPage + 1})">下一頁</button>
    `;
}


// =======================
// 6. 地圖聚焦 (包含 L.circle 擴散動畫)
// =======================
function focusOnQuake(q) {

    // 1. 清除所有舊的圖層，包括標記和舊的擴散圓圈
    markersLayer.clearLayers();

    const { lat, lng, depth, loc, time, mag } = q;

    // 2. 震央 marker (使用新定義的簡單 icon)
    const marker = L.marker([lat, lng], { icon: createQuakeIcon(mag) })
        .addTo(markersLayer)
        .bindPopup(`
            <b>${loc}</b><br>
            時間：${time}<br>
            規模：<span class="magnitude-tag mag-${Math.floor(mag)}">M ${mag}</span><br>
            深度：${depth} km
        `);

    marker.openPopup();

    // 3. 呼叫 L.circle 擴散動畫
    createPulse(lat, lng);

    // 4. 地圖視圖置中並放大
    map.setView([lat, lng], 10);
}


// =======================
// 7. 擴散動畫 Pulse Effect (使用 L.circle)
// =======================
function createPulse(lat, lng) {

    let radius = 200; // 初始半徑 (米)
    const maxRadius = 15000; // 最大擴散半徑 (米)
    let opacity = 0.5; // 初始透明度
    const fadeRate = 0.005; // 每次減少的透明度

    const pulse = L.circle([lat, lng], {
        radius,
        color: "red",
        fillColor: "red",
        fillOpacity: opacity,
        weight: 1
    }).addTo(markersLayer);

    // 將脈衝動畫儲存到地圖實例中，以便之後可以停止，但這裡簡單起見直接使用 markersLayer

    const interval = setInterval(() => {
        // 增大半徑 (每次增加 1.5 公里)
        radius += 500;

        // 減少透明度
        opacity = Math.max(0, opacity - fadeRate);

        pulse.setRadius(radius);
        pulse.setStyle({ fillOpacity: opacity });

        if (radius > maxRadius || opacity <= 0) {
            clearInterval(interval);
            // 動畫結束後移除這個圓圈圖層
            markersLayer.removeLayer(pulse);
        }
    }, 30); // 每 30 毫秒更新一次
}


// =======================
// 8. 啟動
// =======================
loadEarthquakes();