import requests
from bs4 import BeautifulSoup
import json
import os
import re
from urllib.parse import quote_plus


#  Momo 

def search_momo(keyword: str):
    encoded_keyword = quote_plus(keyword)
    
    url = f"https://m.momoshop.com.tw/search/api/search/v3?searchText={encoded_keyword}"

    headers = {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
        "Accept": "application/json",
        "Referer": "https://m.momoshop.com.tw/"
    }

    try:
        resp = requests.get(url, headers=headers, timeout=10)
        print("\n=== [Momo 回傳內容前 300 字] ===")
        print(resp.text[:300])
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print("[Momo] JSON 解析失敗：", e)
        return None

    items = data.get("content", {}).get("prods", [])
    if not items:
        print("[Momo] 找不到商品")
        return None

    item = items[0]

    product_name = item.get("goodsName", "")
    price = item.get("price", 0)
    goodsCode = item.get("goodsCode", "")
    image = item.get("picS", "")
    if image.startswith("//"):
        image = "https:" + image

    product_url = f"https://www.momoshop.com.tw/goods/GoodsDetail.jsp?i_code={goodsCode}"

    return {
        "product_name": product_name,
        "price": price,
        "image": image,
        "url": product_url,
        "source": "Momo"
    }


# PChome 

def search_pchome(keyword: str):
    """
    使用 PChome 的搜尋 API，抓第一個搜尋結果：
    回傳 dict 或 None
    """
    encoded = quote_plus(keyword)
    url = f"https://ecshweb.pchome.com.tw/search/v3.3/all/results?q={encoded}&page=1&sort=sale/dc"

    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    try:
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        print("[PChome] 連線失敗：", e)
        return None

    try:
        data = resp.json()
    except Exception as e:
        print("[PChome] JSON 解析失敗：", e)
        return None

    if data.get("totalRows", 0) == 0:
        print("[PChome] 找不到任何商品")
        return None

    # 第一筆商品
    item = data["prods"][0]

    product_name = item.get("name", "").strip()
    price = item.get("price", 0)

    # 圖片路徑要補完整
    pic_path = item.get("picB") or item.get("picS") or ""
    if pic_path and not pic_path.startswith("http"):
        image = "https://cs-a.ecimg.tw" + pic_path
    else:
        image = pic_path

    # 商品連結
    prod_id = item.get("Id")
    if prod_id:
        product_url = f"https://24h.pchome.com.tw/prod/{prod_id}"
    else:
        product_url = ""

    return {
        "product_name": product_name,
        "price": price,
        "image": image,
        "url": product_url,
        "source": "PChome"
    }


# =========================
# 3. 主函式：整合兩家結果
# =========================
def search_product(keyword: str):
    """
    主入口：
    - 同時搜尋 Momo & PChome
    - 收集結果後，挑價格最低的一個
    - 存成 results/<keyword>.json
    - 若都沒有找到，回傳 "無此商品"
    """
    results = []

    momo_result = search_momo(keyword)
    if momo_result:
        results.append(momo_result)

    pchome_result = search_pchome(keyword)
    if pchome_result:
        results.append(pchome_result)

    if not results:
        print("兩家都找不到商品")
        return "無此商品"

    # 依價格排序，選最便宜的一個
    best = sorted(results, key=lambda x: x["price"])[0]

    # 準備存 JSON 的資料夾
    os.makedirs("results", exist_ok=True)

    # 檔名可以稍微處理一下，避免空白或奇怪字元
    safe_name = keyword.replace(" ", "_")
    filepath = os.path.join("results", f"{safe_name}.json")

    try:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(best, f, ensure_ascii=False, indent=4)
        print(f"已將結果寫入：{filepath}")
    except Exception as e:
        print("寫入 JSON 檔案失敗：", e)

    return best


# =========================
# 4. 測試區（直接執行這支檔案時才會跑）
# =========================
if __name__ == "__main__":
    # 這裡可以先自己測試
    keyword = input("請輸入要搜尋的商品名稱：")
    result = search_product(keyword)
    print("搜尋結果：")
    print(result)