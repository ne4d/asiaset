package api

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// Допустимые типы документов
var validDocTypes = map[string]bool{
	"income":          true,
	"sale":            true,
	"write_off":       true,
	"transfer":        true,
	"customer_return": true,
	"supplier_return": true,
	"adjustment_in":   true,
	"adjustment_out":  true,
}

// Генерация имени документа
func generateDocName(docType, docNumber string) string {
	docTypeNames := map[string]string{
		"income":          "Поставка",
		"sale":            "Продажа",
		"write_off":       "Списание",
		"transfer":        "Перемещение",
		"customer_return": "Возврат от клиента",
		"supplier_return": "Возврат поставщику",
		"adjustment_in":   "Корректировка прихода",
		"adjustment_out":  "Корректировка расхода",
	}
	return fmt.Sprintf("%s №%s от %s", docTypeNames[docType], docNumber, time.Now().Format("02.01.2006"))
}

// Генерация номера документа (ищет последний номер и увеличивает его)
func generateDocNumber(db *sql.DB, docType string) (string, error) {
	var lastNumber string
	query := `SELECT doc_number FROM documents WHERE doc_type = $1 ORDER BY id DESC LIMIT 1`
	err := db.QueryRow(query, docType).Scan(&lastNumber)
	if err != nil {
		if err == sql.ErrNoRows {
			return "000001", nil // Если записей нет, начинаем с "0001"
		}
		return "", err
	}

	var num int
	_, err = fmt.Sscanf(lastNumber, "%04d", &num)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%04d", num+1), nil
}

// Основной обработчик /api/documents
func RegisterDocumentsRoutes(r *gin.Engine, db *sql.DB) {
	// Получение списка документов (GET /api/documents?type=income)
	r.GET("/api/documents", func(c *gin.Context) {
		docTypeFilter := c.Query("type")

		var rows *sql.Rows
		var err error
		query := `SELECT id, doc_type, doc_date, doc_number, from_location_id, to_location_id, counterparty_id, status, comment FROM documents`

		if docTypeFilter != "" {
			if !validDocTypes[docTypeFilter] {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный тип документа"})
				return
			}
			query += " WHERE doc_type = $1 ORDER BY doc_date DESC"
			rows, err = db.Query(query, docTypeFilter)
		} else {
			query += " ORDER BY doc_date DESC"
			rows, err = db.Query(query)
		}

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения данных: " + err.Error()})
			return
		}
		defer rows.Close()

		var documents []map[string]interface{}
		for rows.Next() {
			var doc struct {
				ID             int
				DocType        string
				DocDate        time.Time
				DocNumber      string
				FromLocationID *int
				ToLocationID   *int
				CounterpartyID *int
				Status         string
				Comment        *string
			}
			if err := rows.Scan(&doc.ID, &doc.DocType, &doc.DocDate, &doc.DocNumber, &doc.FromLocationID, &doc.ToLocationID, &doc.CounterpartyID, &doc.Status, &doc.Comment); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обработки данных: " + err.Error()})
				return
			}

			documents = append(documents, gin.H{
				"id":               doc.ID,
				"doc_type":         doc.DocType,
				"doc_date":         doc.DocDate,
				"doc_number":       doc.DocNumber,
				"from_location_id": doc.FromLocationID,
				"to_location_id":   doc.ToLocationID,
				"counterparty_id":  doc.CounterpartyID,
				"status":           doc.Status,
				"comment":          doc.Comment,
			})
		}

		c.JSON(http.StatusOK, documents)
	})

	// Создание документа (POST /api/documents)
	// r.

	// v2
	// Создание документа (POST /api/documents)
	r.POST("/api/documents", func(c *gin.Context) {
		var input struct {
			DocType        string  `json:"doc_type"`
			CounterpartyID *int    `json:"counterparty_id"`
			FromLocationID *int    `json:"from_location_id"`
			ToLocationID   *int    `json:"to_location_id"`
			Comment        *string `json:"comment"`
		}

		if err := c.BindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		if !validDocTypes[input.DocType] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Недопустимый тип документа"})
			return
		}

		// Генерация номера документа
		docNumber, err := generateDocNumber(db, input.DocType)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка генерации номера: " + err.Error()})
			return
		}

		// Генерация имени документа
		docName := generateDocName(input.DocType, docNumber)

		// Вставка нового документа
		query := `
			INSERT INTO documents (doc_type, doc_date, doc_number, name, from_location_id, to_location_id, counterparty_id, status, comment)
			VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft', $8) RETURNING id`
		var docID int
		err = db.QueryRow(query, input.DocType, time.Now(), docNumber, docName, input.FromLocationID, input.ToLocationID, input.CounterpartyID, input.Comment).Scan(&docID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при создании документа: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Документ создан", "id": docID, "doc_number": docNumber, "name": docName})
	})

	// Обновление документа (PUT /api/documents/:id)
	r.PUT("/api/documents/:id", func(c *gin.Context) {
		docID := c.Param("id")
		docIDInt, err := strconv.Atoi(docID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат ID"})
			return
		}

		var input struct {
			DocType        string  `json:"doc_type"`
			CounterpartyID *int    `json:"counterparty_id"`
			FromLocationID *int    `json:"from_location_id"`
			ToLocationID   *int    `json:"to_location_id"`
			Comment        *string `json:"comment"`
			Status         string  `json:"status"`
		}

		if err := c.BindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		if !validDocTypes[input.DocType] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Недопустимый тип документа"})
			return
		}

		query := `
            UPDATE documents 
            SET doc_type = $1, counterparty_id = $2, from_location_id = $3, to_location_id = $4, 
                comment = $5, status = $6, doc_date = $7
            WHERE id = $8`
		_, err = db.Exec(query, input.DocType, input.CounterpartyID, input.FromLocationID,
			input.ToLocationID, input.Comment, input.Status, time.Now(), docIDInt)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обновления документа: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Документ успешно обновлён"})
	})

	// Удаление документа (DELETE /api/documents/:id)
	r.DELETE("/api/documents/:id", func(c *gin.Context) {
		docID := c.Param("id")

		var exists bool
		err := db.QueryRow("SELECT EXISTS (SELECT 1 FROM documents WHERE id = $1)", docID).Scan(&exists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка проверки документа: " + err.Error()})
			return
		}
		if !exists {
			c.JSON(http.StatusNotFound, gin.H{"error": "Документ не найден"})
			return
		}

		_, err = db.Exec("DELETE FROM documents WHERE id = $1", docID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка удаления документа: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Документ успешно удалён"})
	})
}
