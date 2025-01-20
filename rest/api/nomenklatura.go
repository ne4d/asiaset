package api

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RegisterNomenklaturaRoutes(r *gin.Engine, db *sql.DB) {
	//--------------------------------------------------------------------
	// API: Чтение списка номенклатуры (товары)
	//--------------------------------------------------------------------
	// Обязательно возвращаем group_id И group_name
	r.GET("/api/nomenklatura", func(c *gin.Context) {
		query := `
			SELECT 
				n.id, 
				n.name, 
				n.measurement, 
				n.group_id, 
				g.name AS group_name
			FROM 
				nomenklatura n
			LEFT JOIN 
				nomenklatura_groups g ON n.group_id = g.id
			ORDER BY n.id
		`
		rows, err := db.Query(query)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var records []map[string]interface{}
		for rows.Next() {
			var (
				id          int
				name        sql.NullString
				measurement sql.NullString
				groupID     sql.NullInt64
				groupName   sql.NullString
			)
			if err := rows.Scan(&id, &name, &measurement, &groupID, &groupName); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			records = append(records, gin.H{
				"id":          id,
				"name":        name.String,
				"measurement": measurement.String,
				"group_id":    groupID.Int64,    // Если group_id NULL, будет 0
				"group_name":  groupName.String, // Если NULL, будет ""
			})
		}
		c.JSON(http.StatusOK, records)
	})

	//--------------------------------------------------------------------
	// API: Создание новой номенклатуры (POST /api/nomenklatura)
	//--------------------------------------------------------------------
	r.POST("/api/nomenklatura", func(c *gin.Context) {
		var input struct {
			Name        string `json:"name"`
			GroupID     int    `json:"group_id"` // Можно 0, если не задаём
			Measurement string `json:"measurement"`
		}
		if err := c.BindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректный формат данных"})
			return
		}

		// Проверяем на дубликат
		var exists bool
		err := db.QueryRow("SELECT EXISTS (SELECT 1 FROM nomenklatura WHERE name = $1)", input.Name).Scan(&exists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if exists {
			c.JSON(http.StatusConflict, gin.H{"error": "Запись с таким именем уже существует"})
			return
		}

		var newID int
		if input.GroupID == 0 {
			query := "INSERT INTO nomenklatura (name, measurement) VALUES ($1, $2) RETURNING id"
			err = db.QueryRow(query, input.Name, input.Measurement).Scan(&newID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		} else {
			query := "INSERT INTO nomenklatura (name, group_id, measurement) VALUES ($1, $2, $3) RETURNING id"
			err = db.QueryRow(query, input.Name, input.GroupID, input.Measurement).Scan(&newID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}

		c.JSON(http.StatusOK, gin.H{"message": "Запись успешно добавлена", "id": newID})
	})

	//--------------------------------------------------------------------
	// API: Удаление номенклатуры
	//--------------------------------------------------------------------
	r.DELETE("/api/nomenklatura/:id", func(c *gin.Context) {
		id := c.Param("id")
		_, err := db.Exec("DELETE FROM nomenklatura WHERE id = $1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Запись успешно удалена", "id": id})
	})

	//--------------------------------------------------------------------
	// API: Обновление номенклатуры (PUT /api/nomenklatura/:id)
	//--------------------------------------------------------------------
	r.PUT("/api/nomenklatura/:id", func(c *gin.Context) {
		id := c.Param("id")
		var input struct {
			Name        string `json:"name"`
			GroupID     *int   `json:"group_id"` // Может быть null
			Measurement string `json:"measurement"`
		}
		if err := c.BindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Некорректный формат данных"})
			return
		}

		// Можно ещё проверить, существует ли запись, но пропустим (или добавьте при необходимости)

		// Формируем UPDATE
		query := "UPDATE nomenklatura SET name = $1, measurement = $2"
		args := []interface{}{input.Name, input.Measurement}

		if input.GroupID != nil {
			// Если указали group_id
			query += ", group_id = $3 WHERE id = $4"
			args = append(args, *input.GroupID, id)
		} else {
			// Если не указали - устанавливаем в NULL
			query += ", group_id = NULL WHERE id = $3"
			args = append(args, id)
		}

		_, err := db.Exec(query, args...)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обновления записи: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Запись успешно обновлена"})
	})
}
