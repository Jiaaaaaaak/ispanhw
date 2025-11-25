var map = L.map('map').setView([25.0339145, 121.5412233], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.marker([25.0339145, 121.5412233]).addTo(map)
    .bindPopup('自訂訊息<br>可以放 HTML')
    .openPopup();

let markers = [];

async function loadYouBike() {
    console.log("重新載入資料");


    const resp = await fetch("http://localhost:5000/youbike");
    const data = await resp.json();


    markers.forEach(m => map.removeLayer(m));
    markers = [];

    data.forEach(station => {
        const lat = station.latitude;
        const lng = station.longitude;

        const icon = L.icon({
            iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
            iconSize: [32, 32],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(map);

        // 設定 popup 內容
        marker.bindPopup(`
            <b>${station.sna}</b><br>
            可借：${station.available_rent_bikes}<br>
            可還：${station.available_return_bikes}<br>
            更新時間：${station.mday}
        `);

        markers.push(marker);
    });


}

// 先載入一次
loadYouBike();

// 每 1 分鐘更新一次（60000 ms）
setInterval(loadYouBike, 60000);



