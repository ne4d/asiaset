package api

import (
	"database/sql"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func RegisterLocationsRoutes(r *gin.Engine, db *sql.DB) {
	// GET /api/locations?type=storage|salespoint|...
	r.GET("/api/locations", func(c *gin.Context) {
		// Считываем ?type=...
		filterType := c.Query("type") // например: "storage", "salespoint", ...

		// Строим запрос
		// Если filterType не пуст, добавим WHERE type = ...
		// Иначе вернём все записи
		baseQuery := "SELECT id, name, address, type FROM locations"
		var rows *sql.Rows
		var err error

		if strings.TrimSpace(filterType) == "" {
			// Без фильтра
			rows, err = db.Query(baseQuery)
		} else {
			// С фильтром
			query := baseQuery + " WHERE type = $1"
			rows, err = db.Query(query, filterType)
		}

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var records []map[string]interface{}
		for rows.Next() {
			var (
				id    int
				name  string
				addr  string
				ltype string
			)
			if err := rows.Scan(&id, &name, &addr, &ltype); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			records = append(records, gin.H{
				"id":      id,
				"name":    name,
				"address": addr,
				"type":    ltype,
			})
		}

		c.JSON(http.StatusOK, records)
	})

	// POST /api/locations
	r.POST("/api/locations", func(c *gin.Context) {
		var input struct {
			Name    string `json:"name"`
			Address string `json:"address"`
			Type    string `json:"type"`
		}
		if err := c.BindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		// Проверка на допустимые значения type (storage/salespoint/...)
		// if input.Type != "storage" && input.Type != "salespoint" {
		//     c.JSON(http.StatusBadRequest, gin.H{"error": "Недопустимый тип"})
		//     return
		// }

		query := "INSERT INTO locations (name, address, type) VALUES ($1, $2, $3) RETURNING id"
		var newID int
		err := db.QueryRow(query, input.Name, input.Address, input.Type).Scan(&newID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Запись успешно добавлена", "id": newID})
	})

	// PUT /api/locations/:id
	r.PUT("/api/locations/:id", func(c *gin.Context) {
		id := c.Param("id")
		var input struct {
			Name    string `json:"name"`
			Address string `json:"address"`
			Type    string `json:"type"` // если хотим давать менять тип
		}
		if err := c.BindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		query := "UPDATE locations SET name=$1, address=$2, type=$3 WHERE id=$4"
		res, err := db.Exec(query, input.Name, input.Address, input.Type, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		rowsAffected, _ := res.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Запись не найдена (или не изменена)"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Запись успешно обновлена"})
	})

	// DELETE /api/locations/:id
	r.DELETE("/api/locations/:id", func(c *gin.Context) {
		id := c.Param("id")
		res, err := db.Exec("DELETE FROM locations WHERE id=$1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		rowsAffected, _ := res.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Запись не найдена"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Запись успешно удалена"})
	})
}
