package api

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RegisterNomenklaturaGroupsRoutes(r *gin.Engine, db *sql.DB) {

	//--------------------------------------------------------------------
	// API: Чтение списка групп
	//--------------------------------------------------------------------
	r.GET("/api/nomenklatura_groups", func(c *gin.Context) {
		rows, err := db.Query("SELECT id, name FROM nomenklatura_groups ORDER BY id")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var records []map[string]interface{}
		for rows.Next() {
			var (
				id   int
				name string
			)
			if err := rows.Scan(&id, &name); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			records = append(records, gin.H{
				"id":   id,
				"name": name,
			})
		}
		c.JSON(http.StatusOK, records)
	})

	//--------------------------------------------------------------------
	// API: Создание новой группы (POST /api/nomenklatura_groups)
	//--------------------------------------------------------------------
	r.POST("/api/nomenklatura_groups", func(c *gin.Context) {
		var input struct {
			Name string `json:"name"`
		}
		if err := c.BindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		// Проверяем, существует ли запись с таким именем
		var exists bool
		err := db.QueryRow("SELECT EXISTS (SELECT 1 FROM nomenklatura_groups WHERE name = $1)", input.Name).Scan(&exists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка проверки уникальности: " + err.Error()})
			return
		}
		if exists {
			c.JSON(http.StatusConflict, gin.H{"error": "Запись с таким именем уже существует"})
			return
		}

		var newID int
		err = db.QueryRow("INSERT INTO nomenklatura_groups (name) VALUES ($1) RETURNING id", input.Name).Scan(&newID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Запись успешно добавлена", "id": newID})
	})

	//--------------------------------------------------------------------
	// API: Удаление группы
	//--------------------------------------------------------------------
	r.DELETE("/api/nomenklatura_groups/:id", func(c *gin.Context) {
		id := c.Param("id")
		_, err := db.Exec("DELETE FROM nomenklatura_groups WHERE id = $1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Запись успешно удалена", "id": id})
	})

	//--------------------------------------------------------------------
	// API: Обновление группы (PUT /api/nomenklatura_groups/:id)
	//--------------------------------------------------------------------
	r.PUT("/api/nomenklatura_groups/:id", func(c *gin.Context) {
		id := c.Param("id")
		var input struct {
			Name string `json:"name"`
		}
		if err := c.BindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		// Проверяем, есть ли такая запись
		var exists bool
		err := db.QueryRow("SELECT EXISTS (SELECT 1 FROM nomenklatura_groups WHERE id = $1)", id).Scan(&exists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка проверки существования записи: " + err.Error()})
			return
		}
		if !exists {
			c.JSON(http.StatusNotFound, gin.H{"error": "Запись с указанным ID не найдена"})
			return
		}

		// Проверяем, нет ли другой группы с таким же именем
		err = db.QueryRow(
			"SELECT EXISTS (SELECT 1 FROM nomenklatura_groups WHERE name = $1 AND id != $2)",
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

		// Обновляем
		_, err = db.Exec("UPDATE nomenklatura_groups SET name = $1 WHERE id = $2", input.Name, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Запись успешно обновлена", "id": id})
	})
}
