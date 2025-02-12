package api

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// Основной обработчик /api/documents/:id/lines
func RegisterDocumentLinesRoutes(r *gin.Engine, db *sql.DB) {
	// Получение списка строк документа (GET /api/documents/:id/lines)
	r.GET("/api/documents/:id/lines", func(c *gin.Context) {
		docID := c.Param("id")

		docIDInt, err := strconv.Atoi(docID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат ID документа"})
			return
		}

		query := `SELECT id, nomenclature_id, quantity, price, amount FROM document_lines WHERE document_id = $1`
		rows, err := db.Query(query, docIDInt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения строк: " + err.Error()})
			return
		}
		defer rows.Close()

		var lines []map[string]interface{}
		for rows.Next() {
			var line struct {
				ID             int
				NomenclatureID int
				Quantity       float64
				Price          float64
				Amount         float64
			}
			if err := rows.Scan(&line.ID, &line.NomenclatureID, &line.Quantity, &line.Price, &line.Amount); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обработки данных: " + err.Error()})
				return
			}

			lines = append(lines, gin.H{
				"id":              line.ID,
				"nomenclature_id": line.NomenclatureID,
				"quantity":        line.Quantity,
				"price":           line.Price,
				"amount":          line.Amount,
			})
		}

		c.JSON(http.StatusOK, lines)
	})

	// // Добавление строки в документ (POST /api/documents/:id/lines)
	// r.POST("/api/documents/:id/lines", func(c *gin.Context) {
	// 	docID := c.Param("id")

	// 	docIDInt, err := strconv.Atoi(docID)
	// 	if err != nil {
	// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат ID документа"})
	// 		return
	// 	}

	// 	var input struct {
	// 		NomenclatureID int     `json:"nomenclature_id"`
	// 		Quantity       float64 `json:"quantity"`
	// 		Price          float64 `json:"price"`
	// 	}

	// 	if err := c.BindJSON(&input); err != nil {
	// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
	// 		return
	// 	}

	// 	query := `INSERT INTO document_lines (document_id, nomenclature_id, quantity, price)
	// 			  VALUES ($1, $2, $3, $4) RETURNING id`
	// 	var lineID int
	// 	err = db.QueryRow(query, docIDInt, input.NomenclatureID, input.Quantity, input.Price).Scan(&lineID)
	// 	if err != nil {
	// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка добавления строки: " + err.Error()})
	// 		return
	// 	}

	// 	c.JSON(http.StatusOK, gin.H{"message": "Строка добавлена", "line_id": lineID})
	// })

	// Добавление строк в документ (POST /api/documents/:id/lines)
	r.POST("/api/documents/:id/lines", func(c *gin.Context) {
		docID := c.Param("id")

		docIDInt, err := strconv.Atoi(docID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат ID документа"})
			return
		}

		// Ожидаем массив строк документа
		var input []struct {
			NomenclatureID int     `json:"nomenclature_id"`
			Quantity       float64 `json:"quantity"`
			Price          float64 `json:"price"`
		}

		if err := c.BindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		// Если массив пуст - ошибка
		if len(input) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Данные не переданы"})
			return
		}

		// Начинаем транзакцию
		tx, err := db.Begin()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания транзакции: " + err.Error()})
			return
		}

		// Готовим батч-запрос
		query := `INSERT INTO document_lines (document_id, nomenclature_id, quantity, price) VALUES `
		values := []interface{}{}
		placeholders := []string{}

		for i, line := range input {
			idx := i * 4 // Номера аргументов для запроса ($1, $2, ...)
			placeholders = append(placeholders, fmt.Sprintf("($%d, $%d, $%d, $%d)", idx+1, idx+2, idx+3, idx+4))
			values = append(values, docIDInt, line.NomenclatureID, line.Quantity, line.Price)
		}

		// Объединяем строку запроса
		fullQuery := query + strings.Join(placeholders, ", ")
		_, err = tx.Exec(fullQuery, values...)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка добавления строк: " + err.Error()})
			return
		}

		// Фиксируем транзакцию
		if err := tx.Commit(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка подтверждения транзакции: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Строки успешно добавлены"})
	})

	// Обновление строки документа (PUT /api/documents/:id/lines/:line_id)
	r.PUT("/api/documents/:id/lines/:line_id", func(c *gin.Context) {
		docID := c.Param("id")
		lineID := c.Param("line_id")

		docIDInt, err := strconv.Atoi(docID)
		lineIDInt, err := strconv.Atoi(lineID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат ID"})
			return
		}

		var input struct {
			Quantity float64 `json:"quantity"`
			Price    float64 `json:"price"`
		}

		if err := c.BindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		query := `UPDATE document_lines SET quantity = $1, price = $2 WHERE id = $3 AND document_id = $4`
		res, err := db.Exec(query, input.Quantity, input.Price, lineIDInt, docIDInt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обновления строки: " + err.Error()})
			return
		}

		rowsAffected, _ := res.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Строка не найдена"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Строка обновлена"})
	})

	// Удаление строки документа (DELETE /api/documents/:id/lines/:line_id)
	r.DELETE("/api/documents/:id/lines/:line_id", func(c *gin.Context) {
		docID := c.Param("id")
		lineID := c.Param("line_id")

		docIDInt, err := strconv.Atoi(docID)
		lineIDInt, err := strconv.Atoi(lineID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат ID"})
			return
		}

		query := `DELETE FROM document_lines WHERE id = $1 AND document_id = $2`
		res, err := db.Exec(query, lineIDInt, docIDInt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка удаления строки: " + err.Error()})
			return
		}

		rowsAffected, _ := res.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Строка не найдена"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Строка удалена"})
	})
}
