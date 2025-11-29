// =======================
// 1. 初始化地圖
// =======================
const map = L.map("map").setView([23.7, 121], 7);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
}).addTo(map);

let markersLayer = L.layerGroup().addTo(map);


// =======================
// 2. icon
// =======================
function createQuakeIcon(mag) {
    return L.divIcon({
        className: "",
        html: `<div style="
            width:${10 + mag * 3}px;
            height:${10 + mag * 3}px;
            background:red;
            border-radius:50%;
            border:2px solid white;
        "></div>`,
        iconSize: [20, 20],
    });
}


// =======================
// 3. 抓資料
// =======================
let allQuakes = [];
const perPage = 30;
let currentPage = 1;

function loadEarthquakes() {
    fetch("https://opendata.cwa.gov.tw/api/v1/rest/datastore/E-A0015-001?Authorization=CWA-E3E2F173-2244-4E1B-A685-3CB3254320A2")
        .then(res => res.json())
        .then(data => {
            console.log("地震 API 取得資料如下：", data);

            const quakes = data.records.Earthquake;
            allQuakes = quakes;  // 你的資料不用過濾，直接用

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

        const time = info.OriginTime;
        const loc = info.Epicenter.Location;
        const lat = info.Epicenter.EpicenterLatitude;
        const lng = info.Epicenter.EpicenterLongitude;
        const depth = info.FocalDepth;
        const mag = info.EarthquakeMagnitude.MagnitudeValue;

        const tr = document.createElement("tr");
        tr.className = "quake-row";

        tr.innerHTML = `
            <td>${time}</td>
            <td>${loc}</td>
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

    document.getElementById("pagination").innerHTML = `
        <span class="page-btn" onclick="renderPage(${Math.max(1, currentPage - 1)})">上一頁</span>
        第 ${currentPage} / ${totalPages} 頁
        <span class="page-btn" onclick="renderPage(${Math.min(totalPages, currentPage + 1)})">下一頁</span>
    `;
}


// =======================
// 6. 地圖聚焦
// =======================
function focusOnQuake(q) {

    markersLayer.clearLayers();

    const { lat, lng, depth, loc, time, mag } = q;

    L.marker([lat, lng], { icon: createQuakeIcon(mag) })
        .addTo(markersLayer)
        .bindPopup(`
            <b>${loc}</b><br>
            時間：${time}<br>
            規模：${mag}<br>
            深度：${depth} km
        `)
        .openPopup();

    map.setView([lat, lng], 8);
}


// =======================
// 7. 啟動
// =======================
loadEarthquakes();
