package api

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RegisterLocationsRoutes(r *gin.Engine, db *sql.DB) {

	// API для получения всех записей locations
	r.GET("/api/locations", func(c *gin.Context) {
		rows, err := db.Query("SELECT id, name, address, type FROM locations")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var records []map[string]interface{}
		for rows.Next() {
			var id int
			var name, address, locationType string

			if err := rows.Scan(&id, &name, &address, &locationType); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			records = append(records, gin.H{
				"id":      id,
				"name":    name,
				"address": address,
				"type":    locationType, // Например, "storage" или "salespoint"
			})
		}

		c.JSON(http.StatusOK, records)
	})

	// API для добавления новой записи
	r.POST("/api/locations", func(c *gin.Context) {
		var input struct {
			Name    string `json:"name"`
			Address string `json:"address"`
			Type    string `json:"type"` // storage или salespoint
		}

		if err := c.BindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		// Проверяем, существует ли запись с таким именем и типом
		var exists bool
		err := db.QueryRow("SELECT EXISTS (SELECT 1 FROM locations WHERE name = $1 AND type = $2)", input.Name, input.Type).Scan(&exists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка проверки уникальности: " + err.Error()})
			return
		}

		if exists {
			c.JSON(http.StatusConflict, gin.H{"error": "Запись с таким именем уже существует"})
			return
		}

		// Добавляем запись
		var id int
		err = db.QueryRow("INSERT INTO locations (name, address, type) VALUES ($1, $2, $3) RETURNING id", input.Name, input.Address, input.Type).Scan(&id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Запись успешно добавлена", "id": id})
	})

	// API для обновления записи
	r.PUT("/api/locations/:id", func(c *gin.Context) {
		id := c.Param("id")
		var input struct {
			Name    string `json:"name"`
			Address string `json:"address"`
			Type    string `json:"type"`
		}

		if err := c.BindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		_, err := db.Exec("UPDATE locations SET name = $1, address = $2, type = $3 WHERE id = $4", input.Name, input.Address, input.Type, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обновления записи: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Запись успешно обновлена"})
	})

	// API для удаления записи
	r.DELETE("/api/locations/:id", func(c *gin.Context) {
		id := c.Param("id")
		_, err := db.Exec("DELETE FROM locations WHERE id = $1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка удаления записи"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Запись успешно удалена"})
	})
}
