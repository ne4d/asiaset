package api

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RegisterCounterpartiesRoutes(r *gin.Engine, db *sql.DB) {
	//--------------------------------------------------------------------
	// API: Чтение списка контрагентов
	//--------------------------------------------------------------------
	r.GET("/api/counterparties", func(c *gin.Context) {
		rows, err := db.Query("SELECT id, name, phone, address, is_customer, is_supplier FROM counterparties ORDER BY id")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var records []map[string]interface{}
		for rows.Next() {
			var (
				id          int
				name        string
				phone       *string
				address     *string
				is_customer bool
				is_supplier bool
			)
			// if err := rows.Scan(&id, &name); err != nil {
			if err := rows.Scan(&id, &name, &phone, &address, &is_customer, &is_supplier); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			var role string
			if is_customer {
				role = "customer"
			} else if is_supplier {
				role = "supplier"
			}

			records = append(records, gin.H{
				"id":      id,
				"name":    name,
				"phone":   phone,
				"address": address,
				// "is_customer": is_customer,
				// "is_supplier": is_supplier,
				"role": role,
			})
		}
		c.JSON(http.StatusOK, records)
	})

	//--------------------------------------------------------------------
	// API: Создание нового контрагента (POST /api/counterparties)
	//--------------------------------------------------------------------
	r.POST("/api/counterparties", func(c *gin.Context) {
		var input struct {
			Name string `json:"name"`
		}
		if err := c.BindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		// Проверяем, существует ли запись с таким именем
		var exists bool
		err := db.QueryRow("SELECT EXISTS (SELECT 1 FROM counterparties WHERE name = $1)", input.Name).Scan(&exists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка проверки уникальности: " + err.Error()})
			return
		}
		if exists {
			c.JSON(http.StatusConflict, gin.H{"error": "Запись с таким именем уже существует"})
			return
		}

		var newID int
		err = db.QueryRow("INSERT INTO counterparties (name) VALUES ($1) RETURNING id", input.Name).Scan(&newID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Запись успешно добавлена", "id": newID})
	})

	//--------------------------------------------------------------------
	// API: Удаление контрагента
	//--------------------------------------------------------------------
	r.DELETE("/api/counterparties/:id", func(c *gin.Context) {
		id := c.Param("id")
		_, err := db.Exec("DELETE FROM counterparties WHERE id = $1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Запись успешно удалена", "id": id})
	})

	// Маршрут для изменения записи по ID
	r.PUT("/api/counterparties/:id", func(c *gin.Context) {
		id := c.Param("id")
		var input struct {
			Name    string `json:"name"`
			Phone   string `json:"phone"`
			Address string `json:"address"`
			Role    string `json:"role"` // "customer" | "supplier"
		}

		if err := c.BindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		// Проверяем, существует ли запись с указанным ID
		var exists bool
		err := db.QueryRow("SELECT EXISTS (SELECT 1 FROM counterparties WHERE id = $1)", id).Scan(&exists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка проверки существования записи: " + err.Error()})
			return
		}

		if !exists {
			c.JSON(http.StatusNotFound, gin.H{"error": "Запись с указанным ID не найдена"})
			return
		}

		// Проверяем, существует ли другая запись с таким же именем
		err = db.QueryRow(
			"SELECT EXISTS (SELECT 1 FROM counterparties WHERE name = $1 AND id != $2)",
			input.Name, id,
		).Scan(&exists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка проверки уникальности: " + err.Error()})
			return
		}

		if exists {
			c.JSON(http.StatusConflict, gin.H{"error": "Запись с таким именем уже существует"})
			return
		}

		var is_customer bool = false
		var is_supplier bool = false

		if input.Role == "supplier" {
			is_supplier = true
		} else if input.Role == "customer" {
			is_customer = true
		}
		// Выполняем обновление записи
		_, err = db.Exec("UPDATE counterparties SET name = $1, address = $2, phone = $3, is_supplier = $4, is_customer = $5 WHERE id = $6", input.Name, input.Address, input.Phone, is_supplier, is_customer, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Запись успешно обновлена", "id": id})
	})
}
