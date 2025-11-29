from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route("/api/delivery")
def api_delivery():
    keyword = request.args.get("keyword", "")
    lat = request.args.get("lat")
    lng = request.args.get("lng")

    if not keyword or not lat or not lng:
        return jsonify({"error": "缺少參數 keyword, lat, lng"}), 400

    # Foodpanda Search API
    url = "https://disco.deliveryhero.io/listing/api/v1/pandora/search"

    params = {
        "query": keyword,
        "latitude": lat,
        "longitude": lng,
        "vertical": "restaurants",
        "search_vertical": "restaurants",
        "language_id": 6,      # 繁中
        "country": "tw",
        "opening_type": "delivery",
        "limit": 30
    }

    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
        "x-disco-client-id": "web",   # ★ 重要！！！！！
    }

    try:
        r = requests.get(url, params=params, headers=headers, timeout=10)
        r.raise_for_status()
        data = r.json()

    except Exception as e:
        return jsonify({"error": "Foodpanda API error", "detail": str(e)})

    # 依照 search API 結構解析
    items = data.get("feed", {}).get("items", [])

    restaurants = []
    for block in items:
        for item in block.get("items", []):
            restaurants.append({
                "name": item.get("name"),
                "rating": item.get("rating"),
                "fee": item.get("delivery_fee"),
                "eta": item.get("eta_range"),
                "image": item.get("hero_image"),
                "link": "https://www.foodpanda.com.tw" + item.get("link", "")
            })

    return jsonify({
        "keyword": keyword,
        "count": len(restaurants),
        "restaurants": restaurants
    })


if __name__ == "__main__":
    app.run(debug=True)