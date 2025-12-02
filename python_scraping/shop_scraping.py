import requests
import json
import re

def search_costco(keyword, max_items=5):
    url="https://www.costco.com.tw/rest/v2/taiwan/products/search"


    params ={
        "fields":"FULL",
        "query":keyword,
        "pagesize":max_items,
        "lang":"zh_TW",
        "curr":"TWD"
    }

    headers = {"User-Agent":"Mozilla/5.0"}

    r = requests.get(url, params=params, headers=headers, timeout=10)
    r.raise_for_status()

    data = r.json()

    products = data.get("products") or data.get("results") or []

    if not products:
        return "查無此商品"
    

    results = []

    for p in products:
        name = p.get("name")
        price_info = p.get("price",{})
        price = price_info.get("value")
        
        url_path = p.get("url")
        if url_path and url_path.startswith("/"):
            url_full = "https://www.costco.com.tw" + url_path
        else:
            url_full = url_path

        images = p.get("images", [])
        image_url = None
        if images:
            image_url = images[0].get("url")
            if image_url and image_url.startswith("/"):
                image_url = "https://www.costco.com.tw" + image_url


        if not (name and price and url_full):
            continue
        
        results.append({
            "store":"Costco",
           "name": name,
           "price": price,
           "url": url_full,
           "images":image_url
        })

    return results


def save_json(keyword, data):
    safe_name = re.sub(r'[\\/:*?"<>|]', "_", keyword)
    filename = f"{safe_name}.json"

    payload = {
        "query": keyword,
        "results": data
    }

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"已儲存至 {filename}")
    return filename


def main():
    keyword = input("請輸入要搜尋的商品:").strip()

    if not keyword:
        print("請輸入有效的商品名稱。")
        return
    
    print("搜尋中")

    data = search_costco(keyword)

    if data == "查無此商品":
        print("查無此商品")
    else:
        print(f"5l3l24{len(data)}筆商品:\n")
        for item in data:
            print(item)

    
    save_json(keyword, data)




if __name__ == "__main__":
    main()