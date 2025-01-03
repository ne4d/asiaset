#!/bin/bash

# Функция для увеличения версии
increment_version() {
  local version=$1
  local major=$(echo $version | cut -d. -f1)
  local minor=$(echo $version | cut -d. -f2)
  local patch=$(echo $version | cut -d. -f3)

  # Увеличиваем версию патча
  patch=$((patch + 1))

  # Формируем новую версию
  echo "$major.$minor.$patch"
}

# 1. Проверяем текущую ветку
current_branch=$(git branch --show-current)
if [ "$current_branch" == "" ]; then
  echo "Ошибка: Вы не находитесь в ветке!"
  exit 1
fi

# 2. Находим последнюю ветку резервной копии
last_backup_branch=$(git branch -r | grep "origin/" | grep -oE "[0-9]+\.[0-9]+\.[0-9]+" | sort -V | tail -n1)
if [ "$last_backup_branch" == "" ]; then
  # Если это первый пуш, начинаем с 0.1.0
  new_branch="0.1.0"
else
  # Увеличиваем версию
  new_branch=$(increment_version "$last_backup_branch")
fi

# 3. Создаём новую ветку
git checkout -b "$new_branch"

# 4. Добавляем все изменения
git add .
git commit -m "Резервная копия проекта: $new_branch"

# 5. Пушим новую ветку на удалённый репозиторий
git push origin "$new_branch"

# 6. Возвращаемся на основную ветку
git checkout "$current_branch"

echo "Резервная копия создана: $new_branch"
