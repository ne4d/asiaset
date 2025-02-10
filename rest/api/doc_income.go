package api

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

// RegisterDocumentsIncome регистрирует маршруты для работы с документами типа "поступление"
func RegisterDocumentsIncome(r *gin.Engine, db *sql.DB) {
	// GET /api/income_documents
	// Возвращает список документов поступлений. При необходимости можно добавить фильтрацию по, например, supplier_id.
	r.GET("/api/income_documents", func(c *gin.Context) {
		// Например, можно считать дополнительный параметр фильтрации supplier_id:
		supplierID := c.Query("supplier_id")
		baseQuery := `
			SELECT id, document_number, doc_date, supplier_id, total_amount
			FROM income_documents
		`
		var rows *sql.Rows
		var err error

		if supplierID == "" {
			rows, err = db.Query(baseQuery + " ORDER BY id")
		} else {
			// Если передан supplier_id, выбираем документы для конкретного поставщика
			query := baseQuery + " WHERE supplier_id = $1 ORDER BY id"
			rows, err = db.Query(query, supplierID)
		}

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var records []map[string]interface{}
		for rows.Next() {
			var (
				id             int
				documentNumber string
				docDate        sql.NullTime
				supplierIDVal  sql.NullInt64
				totalAmount    float64
			)
			if err := rows.Scan(&id, &documentNumber, &docDate, &supplierIDVal, &totalAmount); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			var dateStr string
			if docDate.Valid {
				dateStr = docDate.Time.Format("2006-01-02 15:04:05")
			}

			records = append(records, gin.H{
				"id":              id,
				"document_number": documentNumber,
				"doc_date":        dateStr,
				"supplier_id":     supplierIDVal.Int64, // если NULL, будет 0
				"total_amount":    totalAmount,
			})
		}
		c.JSON(http.StatusOK, records)
	})

	// POST /api/income_documents
	// Создаёт новый документ поступления.
	r.POST("/api/income_documents", func(c *gin.Context) {
		var input struct {
			DocumentNumber string  `json:"document_number"`
			SupplierID     int     `json:"supplier_id"` // можно использовать 0 или NULL, если не задано
			TotalAmount    float64 `json:"total_amount"`
		}
		if err := c.BindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		// Вставляем запись – для doc_date используется текущее время (NOW())
		var newID int
		query := `
			INSERT INTO income_documents (document_number, supplier_id, total_amount, doc_date)
			VALUES ($1, $2, $3, NOW())
			RETURNING id
		`
		err := db.QueryRow(query, input.DocumentNumber, input.SupplierID, input.TotalAmount).Scan(&newID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Документ успешно добавлен", "id": newID})
	})

	// PUT /api/income_documents/:id
	// Обновляет существующий документ поступления.
	r.PUT("/api/income_documents/:id", func(c *gin.Context) {
		id := c.Param("id")
		var input struct {
			DocumentNumber string  `json:"document_number"`
			SupplierID     int     `json:"supplier_id"`
			TotalAmount    float64 `json:"total_amount"`
		}
		if err := c.BindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		query := `
			UPDATE income_documents
			SET document_number = $1, supplier_id = $2, total_amount = $3
			WHERE id = $4
		`
		res, err := db.Exec(query, input.DocumentNumber, input.SupplierID, input.TotalAmount, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		rowsAffected, _ := res.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Документ не найден или не изменён"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Документ успешно обновлён"})
	})

	// DELETE /api/income_documents/:id
	// Удаляет документ поступления.
	r.DELETE("/api/income_documents/:id", func(c *gin.Context) {
		id := c.Param("id")
		res, err := db.Exec("DELETE FROM income_documents WHERE id = $1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		rowsAffected, _ := res.RowsAffected()
		if rowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Документ не найден"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Документ успешно удалён"})
	})
}
