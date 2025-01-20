package api

import (
	"database/sql"

	"github.com/gin-gonic/gin"
)

func RegisterCounterpartiesRoutes(r *gin.Engine, db *sql.DB) {
	// GET /api/counterparties
	r.GET("/api/counterparties", func(c *gin.Context) {
		// ...
	})

	// POST /api/counterparties
	r.POST("/api/counterparties", func(c *gin.Context) {
		// ...
	})

	// PUT /api/counterparties/:id
	r.PUT("/api/counterparties/:id", func(c *gin.Context) {
		// ...
	})

	// DELETE /api/counterparties/:id
	r.DELETE("/api/counterparties/:id", func(c *gin.Context) {
		// ...
	})
}
