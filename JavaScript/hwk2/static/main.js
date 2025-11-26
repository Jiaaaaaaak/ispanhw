var map = L.map('map').setView([25.0339145, 121.5412233], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.control.scale().addTo(map);

// L.marker([25.0339145, 121.5412233]).addTo(map)
//     .bindPopup('自訂訊息<br>可以放 HTML')
//     .openPopup();

let markers = [];
let rangeCircle = null;
// let userCircle = null;
// let firstLocate = true;

function updateCenterCircle() {
    let center = map.getCenter();

    // 第一次建立
    if (!rangeCircle) {
        rangeCircle = L.circle(center, {
            radius: 500,
            color: "#3388f5",
            fillColor: "#3388ff",
            fillOpacity: 0.2
        }).addTo(map);
    } else {
        rangeCircle.setLatLng(center);
    }

    loadYouBike(center);
};

async function loadYouBike(centerPoint) {
    console.log("更新地圖中心附近站點");
    const resp = await fetch("http://localhost:5000/youbike");
    const data = await resp.json();


    markers.forEach(m => map.removeLayer(m));
    markers = [];


    let count = 0;

    data.forEach(station => {
        const lat = station.latitude;
        const lng = station.longitude;

        // ⭐ 計算與使用者距離（公尺）
        const dist = map.distance(centerPoint, [lat, lng]);

        // ⭐ 只顯示 500 公尺內的站點
        if (dist <= 500) {

            const icon = L.icon({
                iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                iconSize: [30, 30]
            })


            const marker = L.marker([lat, lng], { icon }).addTo(map);

            marker.bindPopup(`
                <b>${station.sna}</b><br>
                距離：${Math.round(dist)} 公尺<br>
                可借數量：${station.available_rent_bikes}<br>
                可還數量：${station.available_return_bikes}<br>
                更新時間：${station.updateTime}
            `);

            markers.push(marker);
            count++;
        }
    });
    // 更新畫面顯示站數
    document.getElementById("countBox").innerText =
        `500 公尺內站點：${count}`;
}



// 當地圖移動完時 → 更新圈圈 & 站點
map.on("moveend", updateCenterCircle);

// 定位按鈕（按一下 → 重新跳回使用者位置）
// =================================================
document.getElementById("locateBtn").addEventListener("click", function () {
    map.locate({ setView: true, maxZoom: 17 });
});


map.on("locationfound", function (e) {
    map.setView(e.latlng, 16);
    updateCenterCircle(); // 以使用者位置為地圖中心進行第一次定位
});




// 找不到使用者時
map.on("locationerror", function () {
    alert("定位失敗，請允許 GPS 或手動操作地圖。");
});


//---------------------------------------------
// 首次地圖顯示 → 手動執行一次更新
//---------------------------------------------
updateCenterCircle();



