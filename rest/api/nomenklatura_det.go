package api

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"log"
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

func generateRandomFileName(extension string) string {
	bytes := make([]byte, 16) // 16 байт для случайного имени
	rand.Read(bytes)
	return hex.EncodeToString(bytes) + extension
}

func RegisterNomenklaturaDetailsRoutes(r *gin.Engine, db *sql.DB) {

	r.GET("/api/nomenklatura/details/:id", func(c *gin.Context) {
		id := c.Param("id")

		var item struct {
			ID   int    `json:"id"`
			Name string `json:"name"`
			// Measurement string `json:"measurement"`
			// Grp         string `json:"grp"`
			ImageURL    string `json:"image_url"`
			Description string `json:"description"`
		}

		var imageURL sql.NullString
		var description sql.NullString

		// err := db.QueryRow("SELECT id, name, measurement, grp, image_url, description FROM nomenklatura WHERE id = $1", id).Scan(
		err := db.QueryRow("SELECT id, name, image_url, description FROM nomenklatura WHERE id = $1", id).Scan(
			// &item.ID, &item.Name, &item.Measurement, &item.Grp, &imageURL, &description,
			&item.ID, &item.Name, &imageURL, &description,
		)

		if err != nil {
			if err == sql.ErrNoRows {
				// Возвращаем пустые данные, если запись не найдена
				c.JSON(http.StatusOK, gin.H{
					"id":   id,
					"name": "",
					// "measurement": "",
					// "grp":         "",
					"image_url":   "",
					"description": "",
				})
				return
			}
			// Возвращаем ошибку, если произошла другая ошибка
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения данных"})
			return
		}

		// Заполняем пустыми строками, если поля NULL
		item.ImageURL = imageURL.String
		if !imageURL.Valid {
			item.ImageURL = ""
		}

		item.Description = description.String
		if !description.Valid {
			item.Description = ""
		}

		// Возвращаем данные, если запись найдена
		c.JSON(http.StatusOK, item)
	})

	// API для обновления изображения
	r.POST("/api/nomenklatura/details/:id/update-image", func(c *gin.Context) {
		id := c.Param("id")
		log.Printf("Получен запрос на обновление изображения: id=%s", id)

		// Проверяем, передан ли файл
		file, err := c.FormFile("image")
		if err != nil {
			if err == http.ErrMissingFile {
				log.Println("Файл не был загружен")
			} else {
				log.Printf("Ошибка при получении файла: %s", err)
			}
			c.JSON(http.StatusBadRequest, gin.H{"error": "Файл не загружен"})
			return
		}

		log.Printf("Файл получен: %s", file.Filename)

		// Получаем расширение файла
		extension := filepath.Ext(file.Filename)
		uniqueFileName := generateRandomFileName(extension)
		log.Printf("Сгенерированное имя файла: %s", uniqueFileName)

		// Путь для сохранения файла
		savePath := filepath.Join("/home/user/project/webcrm/uploads/", uniqueFileName)
		log.Printf("Путь для сохранения файла: %s", savePath)

		// Сохраняем файл
		if err := c.SaveUploadedFile(file, savePath); err != nil {
			log.Printf("Ошибка сохранения файла: %s", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сохранения файла"})
			return
		}

		// Путь для записи в базу данных
		imageUrl := "/uploads/" + uniqueFileName
		log.Printf("URL изображения для записи в базу данных: %s", imageUrl)

		// Обновляем запись в базе данных
		result, err := db.Exec("UPDATE nomenklatura SET image_url = $1 WHERE id = $2", imageUrl, id)
		if err != nil {
			log.Printf("Ошибка обновления записи в базе данных: %s", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обновления записи"})
			return
		}

		rowsAffected, _ := result.RowsAffected()
		log.Printf("Обновлено строк в базе данных: %d", rowsAffected)

		c.JSON(http.StatusOK, gin.H{
			"message":   "Изображение обновлено",
			"image_url": imageUrl,
		})
		log.Println("Изображение успешно обновлено")
	})

	// API для обновления описания
	r.POST("/api/nomenklatura/details/:id/update-description", func(c *gin.Context) {
		id := c.Param("id")
		log.Printf("Получен запрос на обновление описания: id=%s", id)

		// Получаем описание из тела запроса
		var payload struct {
			Description string `json:"description"`
		}
		if err := c.BindJSON(&payload); err != nil {
			log.Printf("Ошибка разбора JSON: %s", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректный формат данных"})
			return
		}

		log.Printf("Описание: %s", payload.Description)

		// Обновляем запись в базе данных
		result, err := db.Exec("UPDATE nomenklatura SET description = $1 WHERE id = $2", payload.Description, id)
		if err != nil {
			log.Printf("Ошибка обновления записи в базе данных: %s", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обновления записи"})
			return
		}

		rowsAffected, _ := result.RowsAffected()
		log.Printf("Обновлено строк в базе данных: %d", rowsAffected)

		c.JSON(http.StatusOK, gin.H{
			"message":     "Описание обновлено",
			"description": payload.Description,
		})
		log.Println("Описание успешно обновлено")
	})

}
