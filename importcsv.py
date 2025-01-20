# не работает если таблица пустая
import csv
import requests

# Адрес, где запущен ваш сервер Go с Gin
BASE_URL = "http://localhost:8080"

NOMENKLATURA_GROUPS_URL = f"{BASE_URL}/api/nomenklatura_groups"
NOMENKLATURA_URL = f"{BASE_URL}/api/nomenklatura"

# Путь к вашему CSV-файлу
CSV_FILE_PATH = "import.csv"

def main():
    # 1. Считываем все группы
    print("Считываем список групп...")
    response = requests.get(NOMENKLATURA_GROUPS_URL)
    if response.status_code != 200:
        print("Ошибка при получении списка групп:", response.text)
        return
    all_groups = response.json()
    
    # Преобразуем список словарей в dict с ключом = имя группы, значением = id
    groups_dict = {}
    for g in all_groups:
        groups_dict[g["name"]] = g["id"]
    
    print(f"Найдено групп: {len(groups_dict)}")
    
    # 2. Считываем текущую номенклатуру (товары)
    print("Считываем список товаров...")
    response = requests.get(NOMENKLATURA_URL)
    if response.status_code != 200:
        print("Ошибка при получении списка товаров:", response.text)
        return
    all_nomenklatura = response.json()
    
    # Преобразуем список товаров в dict с ключом = имя товара
    nomenklatura_dict = {}
    for item in all_nomenklatura:
        nomenklatura_dict[item["name"]] = item
    
    print(f"Найдено товаров: {len(nomenklatura_dict)}")
    
    # 3. Открываем CSV-файл и идём по строкам
    with open(CSV_FILE_PATH, newline='', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter=';')  # Задайте правильный разделитель, если нужен
        # Если в CSV есть заголовок — пропустите первую строку
        # header = next(reader, None)

        for row in reader:
            if len(row) < 2:
                # Пропустим некорректную строку
                continue
            
            product_name = row[0].strip()
            group_name = row[1].strip()
            
            # Проверяем, есть ли такая группа
            if group_name not in groups_dict:
                print(f"Группа '{group_name}' не найдена в БД, пропускаю товар '{product_name}'")
                continue
            
            group_id = groups_dict[group_name]
            
            # Проверяем, есть ли товар
            if product_name in nomenklatura_dict:
                # Товар есть, нужно обновить group_id
                existing_item = nomenklatura_dict[product_name]
                product_id = existing_item["id"]
                
                # Формируем тело запроса
                payload = {
                    "name": product_name,
                    "measurement": existing_item["measurement"] or "",
                    "group_id": group_id
                }
                
                # Отправляем PUT-запрос
                put_url = f"{NOMENKLATURA_URL}/{product_id}"
                r = requests.put(put_url, json=payload)
                if r.status_code == 200:
                    print(f"[OK] Товар '{product_name}' обновлён, группа -> '{group_name}'")
                else:
                    print(f"[ERROR] Не удалось обновить '{product_name}': {r.text}")
            else:
                # Товара нет, нужно создать
                payload = {
                    "name": product_name,
                    "measurement": "шт",  # при необходимости можно подставить другое значение
                    "group_id": group_id
                }
                r = requests.post(NOMENKLATURA_URL, json=payload)
                if r.status_code == 200:
                    # Успешно создан
                    data = r.json()
                    new_id = data.get("id")
                    print(f"[OK] Товар '{product_name}' создан, группа -> '{group_name}', ID = {new_id}")
                    
                    # Добавим в локальный словарь nomenklatura_dict, чтобы в будущем не пытаться заново создавать
                    nomenklatura_dict[product_name] = {
                        "id": new_id,
                        "name": product_name,
                        "measurement": "",
                        "group_id": group_id,
                        "group_name": group_name
                    }
                else:
                    print(f"[ERROR] Не удалось создать '{product_name}': {r.text}")


if __name__ == "__main__":
    main()
