package main

import (
	"database/sql"
	"flag"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/ne4d/asiaset/blob/0.1.21/rest/api"
	// Здесь вы импортируете локальные пакеты с регистрацией маршрутов
	// предположим, в папке api у нас лежат *.go файлы
)

const (
	dbHost     = "localhost"
	dbPort     = "5432"
	dbUser     = "asiaset"
	dbPassword = "123"
	dbName     = "asiaset"
)

func main() {
	// Аргументы командной строки
	timeoutFlag := flag.Int("timeout", 0, "Задержка перед запуском приложения (в секундах)")
	flag.Parse()

	if *timeoutFlag > 0 {
		log.Printf("Задержка перед запуском: %d секунд", *timeoutFlag)
		time.Sleep(time.Duration(*timeoutFlag) * time.Second)
	}

	// Подключаемся к БД
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName,
	)
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Не удалось подключиться к базе данных: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("База данных недоступна: %v", err)
	}
	log.Println("Успешное подключение к базе данных")

	// Создаём роутер Gin
	r := gin.Default()
	// Настройка CORS
	r.Use(cors.Default())

	// --- Регистрируем маршруты из отдельных файлов ---

	api.RegisterNomenklaturaRoutes(r, db)
	api.RegisterNomenklaturaGroupsRoutes(r, db)
	api.RegisterCounterpartiesRoutes(r, db)
	api.RegisterNomenklaturaDetailsRoutes(r, db)
	api.RegisterLocationsRoutes(r, db)
	// ... и т.д.

	// Пример: можно зарегистрировать debug
	r.GET("/debug/routes", func(c *gin.Context) {
		for _, route := range r.Routes() {
			fmt.Printf("Method: %s, Path: %s\n", route.Method, route.Path)
		}
		c.String(http.StatusOK, "Check console for registered routes")
	})

	// Запускаем сервер
	r.Run(":8080")
}
