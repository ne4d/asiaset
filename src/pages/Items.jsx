
import React, { useState, useEffect } from 'react';
import '../css/materialoutlinedbutton.css';
import "../css/table.css";
import '../css/owerflowscctabe.css';
import '../css/threedotsloading.css';
import '../css/notifications.css';

// функция уведомлений
function Notification({ type, title, message, onClose }) {
  return (
    <div className={`notification notification-${type}`}>
      <button className="notification-close" onClick={onClose}>
      </button>
      <div className="notification-title">{title}</div>
      <div className="notification-message">{message}</div>
    </div>
  );
}

// основная функция
function Items() {
  const [groups, setGroups] = useState([]); // Состояние для хранения данных
  const [loading, setLoading] = useState(false); // Состояние загрузки
  const [error, setError] = useState(null); // Состояние для ошибок

  // Создаем состояние для управления видимостью таблицы
  const [isTableGroupVisible, setIsTableGroupVisible] = useState(false);
  const [isTableProductVisible, setIsTableProductVisible] = useState(false);

  // Функция для переключения видимости таблицы
  const toggleTableVisibility = (value) => {
    setIsTableGroupVisible(value); // Меняем состояние на value
  };

  // Функция для переключения видимости таблицы
  const toggleProductVisibility = (value) => {
    setIsTableProductVisible(value); // Меняем состояние на value
  };

  // Функция для загрузки данных
  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/nomenklatura_groups');
      if (!response.ok) {
        throw new Error('Ошибка загрузки данных');
      }
      const data = await response.json();
      setGroups(data); // Сохраняем данные в состоянии
    } catch (err) {
      setError(err.message); // Устанавливаем состояние ошибки
      addNotification("error", "", "База данных недоступна");
    } finally {
      setLoading(false);
    }
  };

  // Обработчик кнопки "Группы"
  const handleLoadGroups = () => {
    fetchGroups();
    toggleTableVisibility(true);
    toggleProductVisibility(false);
  };
  // Обработчик кнопки "Группы"
  const handleLoadProducts = () => {
    toggleTableVisibility(false);
    toggleProductVisibility(true);
  };

  const [editRowId, setEditRowId] = useState(null); // ID строки, которая редактируется
  const [editValue, setEditValue] = useState(""); // Значение для редактирования
  const [hoverRowId, setHoverRowId] = useState(null); // ID строки, на которую наведена мышь

  const handleEditClick = (id, currentValue) => {
    setEditRowId(id); // Устанавливаем редактируемую строку
    setEditValue(currentValue); // Подставляем текущее значение
  };

  // функция удаления текста в поле поиска
  const handleCancelClick = () => {
    setEditRowId(null); // Отменяем редактирование
    setEditValue(""); // Очищаем значение
  };

  // блок сохранения редактируемой записи
  const handleSaveClick = async (id) => {
    try {
      // Получаем текущую группу из состояния
      const currentGroup = groups.find((group) => group.id === id);

      // Проверяем, изменилось ли значение
      if (currentGroup.name === editValue) {
        addNotification("info", "", "Изменений не найдено.");
        setEditRowId(null);
        setEditValue("");
        return; // Выходим из функции, чтобы не отправлять запрос
      }

      const response = await fetch(`/api/nomenklatura_groups/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editValue }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка при обновлении: ${response.statusText}`);
      }

      const data = await response.json();
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.id === id ? { ...group, name: editValue } : group
        )
      );
      addNotification("success", "", "Группа успешно обновлена.");
      setEditRowId(null);
      setEditValue("");
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      addNotification("error", "", "Не удалось обновить запись. Попробуйте ещё раз.");
    }
  };

  // блок удаления записи
  const handleDeleteClick = async (id) => {
    try {
      const response = await fetch(`/api/nomenklatura_groups/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Ошибка при удалении: ${response.statusText}`);
      }

      setGroups((prevGroups) => prevGroups.filter((group) => group.id !== id));
      addNotification("success", "", "Группа успешно удалена.");
    } catch (error) {
      console.error("Ошибка удаления:", error);
      addNotification("error", "", "Не удалось удалить запись. Попробуйте ещё раз.");
    }
  };

  // блок создания новой записи
  const [newRecordName, setNewRecordName] = useState(""); // Состояние для новой записи

  const handleAddClick = async () => {
    if (!newRecordName.trim()) {
      addNotification("error", "", "Название группы не может быть пустым");
      return;
    }

    try {
      const response = await fetch("/api/nomenklatura_groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newRecordName }),
      });

      if (!response.ok) {
        if (response.status === 409) { // Например, если группа уже существует
          addNotification("warning", "", "Такая группа уже существует.");
        } else {
          throw new Error("Ошибка добавления записи");
        }
      } else {
        const data = await response.json();
        setGroups((prevGroups) => [...prevGroups, { id: data.id, name: newRecordName }]);
        addNotification("success", "", "Группа успешно добавлена.");
        setNewRecordName(""); // Очистить поле ввода
      }
    } catch (err) {
      console.error("Ошибка при добавлении записи:", err);
      addNotification("error", "", "Не удалось добавить запись. Попробуйте ещё раз.");
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // блок уведомлений
  const [notifications, setNotifications] = useState([]);
  const [notificationQueue, setNotificationQueue] = useState([]);
  const MAX_NOTIFICATIONS = 3;

  // Функция для добавления уведомления
  const addNotification = (type, title, message) => {
    const id = Date.now(); // Уникальный ID для каждого уведомления

    if (notifications.length < MAX_NOTIFICATIONS) {
      setNotifications((prev) => [...prev, { id, type, title, message }]);

      // Удаляем уведомление через 3 секунды
      setTimeout(() => {
        removeNotification(id);
      }, 3000);
    } else {
      // Если превышен лимит, добавляем уведомление в очередь
      setNotificationQueue((prev) => [...prev, { id, type, title, message }]);
    }
  };

  // Функция для удаления уведомления
  const removeNotification = (id) => {
    setNotifications((prev) => {
      const updated = prev.filter((notif) => notif.id !== id);
      return updated;
    });
  };

  // Используем useEffect для перемещения уведомлений из очереди
  useEffect(() => {
    if (notifications.length < MAX_NOTIFICATIONS && notificationQueue.length > 0) {
      const [nextNotification, ...restQueue] = notificationQueue;
      setNotificationQueue(restQueue);
      setNotifications((prev) => [...prev, nextNotification]);

      // Удаляем уведомление через 3 секунды
      setTimeout(() => {
        removeNotification(nextNotification.id);
      }, 3000);
    }
  }, [notifications, notificationQueue]);

  // Пример использования уведомлений
  const handleSuccess = () => {
    addNotification("success", "Успех!", "Ваш запрос выполнен успешно.");
  };

  const handleError = () => {
    addNotification("error", "Ошибка!", "Ваш запрос завершился с ошибкой.");
  };

  const handleInfo = () => {
    addNotification("info", "Информация", "Проверьте новые функции.");
  };

  const handleWarning = () => {
    addNotification("warning", "Предупреждение!", "Батарея почти разряжена.");
  };

  // блок кода страницы
  return (
    <div style={{ alignItems: "center" }}>
      <h2>Справочник Номенклатур</h2>
      <div style={{ marginTop: "15px", marginBottom: "10px" }}>
        <button onClick={handleLoadGroups} class="pure-material-button-outlined">Группы</button>
        <button onClick={handleLoadProducts} class="pure-material-button-outlined">Товары</button>
      </div>

      {/* Контейнер для уведомлений */}
      <div id="notification-container">
        {notifications.map((notif) => (
          <Notification
            key={notif.id}
            type={notif.type}
            title={notif.title}
            message={notif.message}
            onClose={() => removeNotification(notif.id)}
          />
        ))}
      </div>
      {isTableGroupVisible && ( // Условное отображение таблицы
        <div className="table-container">
          {loading ? (
            <div class="snippet" data-title="dot-spin">
              <div class="stage">
                <div class="dot-spin"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Строка для поиска записи */}
              <div className='add-group-width'
                style={{ position: "relative" }}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск по имени группы"
                  className="form-control"
                  style={{
                    width: "100%",
                    paddingLeft: "40px", // Увеличиваем отступ для текста
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none"><g><rect width="24" height="24" fill="white"></rect><circle cx="10.5" cy="10.5" r="6.5" stroke="%23595c5f" stroke-linejoin="round"></circle><path d="M19.6464 20.3536C19.8417 20.5488 20.1583 20.5488 20.3536 20.3536C20.5488 20.1583 20.5488 19.8417 20.3536 19.6464L19.6464 20.3536ZM20.3536 19.6464L15.3536 14.6464L14.6464 15.3536L19.6464 20.3536L20.3536 19.6464Z" fill="%23595c5f"></path></g></svg>')`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "10px center", // Позиция иконки
                    backgroundSize: "20px 20px", // Размер иконки
                  }}
                />
                {/* Кнопка для очистки поля */}
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")} // Очищаем текст при нажатии
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "10px",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "16px",
                      color: "black",
                    }}
                  >

                    <svg
                      viewBox="0 2 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        width: "25px",
                        height: "25px",
                      }}
                    >
                      <rect width="24" height="24" fill="white"></rect>
                      <path
                        d="M7 17L16.8995 7.10051"
                        stroke="#595c5f"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                      <path
                        d="M7 7.00001L16.8995 16.8995"
                        stroke="#595c5f"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  </button>
                )}
              </div>
              {/* Строка для добавления новой записи */}
              <div className='add-group-width'>
                <input
                  type="text"
                  value={newRecordName}
                  onChange={(e) => setNewRecordName(e.target.value)}
                  placeholder="Добавить группу"
                  className="form-control"/>
                <button
                  className="btn-icon btn-success"
                  onClick={handleAddClick}
                  title="Добавить запись"
                  style={{ paddingLeft: "15px" }}>
                  <svg
                    width="25px"
                    height="25px"
                    viewBox="3.5 3 17 17"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="#000000"
                    strokeWidth="2.4"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M5 13.3636L8.03559 16.3204C8.42388 16.6986 9.04279 16.6986 9.43108 16.3204L19 7" stroke="#39bd00" strokeLinecap="round" strokeLinejoin="round"></path></g></svg>
                </button>
              </div>
              {/* таблица */}
              <table className="rtable">
                <thead>
                  <tr>
                    <th className="col-code">Код</th>
                    <th className="col-name">Имя группы</th>
                    <th className="col-actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {/* Строки с данными */}
                  {filteredGroups.map((group) => (
                    <tr
                      key={group.id}
                      onMouseEnter={() => setHoverRowId(group.id)} // При наведении сохраняем ID строки
                      onMouseLeave={() => setHoverRowId(null)} // При уходе сбрасываем
                  >
                      <td>{group.id}</td>
                      <td>
                        {editRowId === group.id ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="form-control"
                            style={{
                              height: 40
                            }}
                          />
                        ) : (
                          <span>{group.name}</span>
                        )}
                      </td>
                      <td className="col-actions-center">
                        {editRowId === group.id ? (
                          <>
                            {/* Кнопка "Сохранить" */}
                            <button
                              className="btn-icon btn-success"
                              onClick={() => handleSaveClick(group.id)}
                            >
                              <svg
                                width="25px"
                                height="25px"
                                viewBox="3.5 3 17 17"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                stroke="#000000"
                                strokeWidth="2.4"
                              >
                                <path
                                  d="M5 13.3636L8.03559 16.3204C8.42388 16.6986 9.04279 16.6986 9.43108 16.3204L19 7"
                                  stroke="#39bd00"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                              </svg>
                            </button>

                            {/* Кнопка "Отмена" */}
                            <button
                              className="btn-icon btn-warning"
                              onClick={handleCancelClick}
                            >
                              <svg
                                width="25px"
                                height="25px"
                                viewBox="4.5 4.3 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                stroke="#000000"
                                strokeWidth="2.4"
                                transform="rotate(270)"
                              >
                                <path
                                  d="M9.5 7L14.5 12L9.5 17"
                                  stroke="#000000"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                              </svg>
                            </button>
                            {/* Кнопка "Удалить" */}
                            <button
                              className="btn-icon btn-danger"
                              onClick={() => handleDeleteClick(group.id)}
                            >
                              <svg
                                width="25px"
                                height="25px"
                                viewBox="3 3 17 17"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                stroke="#000000"
                                strokeWidth="2.4"
                              >
                                <path
                                  d="M7 17L16.8995 7.10051"
                                  stroke="#ff0000"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                                <path
                                  d="M7 7.00001L16.8995 16.8995"
                                  stroke="#ff0000"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                ></path>
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn-icon btn-danger"
                              onClick={() => handleEditClick(group.id, group.name)}
                            >
                              <svg
                                width="25px"
                                height="25px"
                                viewBox="3 3 18 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                stroke="#000000"
                                strokeWidth="1.6"
                              >
                                <path d="M6 12H18" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M6 15.5H18" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M6 8.5H18" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"></path>                          </svg>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}{error && (
            <>
              <p style={{ color: 'red' }}>Ошибка: {error}</p>
            </>
          )}
        </div>
      )
      } {/*конец скрывающейся таблицы*/}
    </div >
  );
}

export default Items;
