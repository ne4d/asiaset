
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from "prop-types";
import '../css/materialoutlinedbutton.css';
import '../css/cssonlyresponcivetables_v2.css';
import '../css/notifications.css'; // уведомления
import '../css/overItems.css';
import '../css/threedotsloading.css'; // загрузка

Dropdown.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string),
  selected: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

Dropdown.defaultProps = {
  options: [],
  selected: "",
};

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

// Компонент Dropdown
// v3
function Dropdown({ options, selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false); // Управление видимостью списка
  const [searchValue, setSearchValue] = useState(selected || ""); // Текущий текст

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (value) => {
    onChange(value); // Устанавливаем выбранное значение
    setSearchValue(value); // Устанавливаем текст в поле ввода
    setIsOpen(false); // Закрываем список
  };

  const handleFocus = () => {
    setIsOpen(true); // Открываем список при фокусе
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false); // Закрываем список при потере фокуса
    }, 200);
  };

  const handleClear = () => {
    setSearchValue(""); // Очищаем текстовое поле
    onChange(null); // Устанавливаем значение null для группы
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        value={searchValue}
        onClick={handleFocus} // Открываем список при клике
        onFocus={handleFocus} // Открываем список при фокусе
        onBlur={handleBlur} // Закрываем список при потере фокуса
        onChange={(e) => setSearchValue(e.target.value)} // Обновляем текст
        placeholder="Выберите группу"
        className="form-control"
        style={{
          height: 28,
        }}
      />
      {isOpen && filteredOptions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            maxHeight: "150px",
            overflowY: "auto",
            backgroundColor: "white",
            border: "1px solid #ccc",
            zIndex: 1000,
            marginTop: "5px",
          }}
        >
          {filteredOptions.map((option, index) => (
            <div
              key={index}
              onClick={() => handleSelect(option)} // Выбор значения
              style={{
                padding: "8px",
                cursor: "pointer",
                borderBottom: "1px solid #f0f0f0",
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "#f5f5f5")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "transparent")
              }
            >
              {option}
            </div>
          ))}
        </div>
      )}
      {searchValue && (
        <button
          onClick={handleClear}
          style={{
            position: "absolute",
            top: "50%",
            right: "5px",
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
            {/* <rect width="24" height="24" fill="white"></rect> */}
            <rect width="24" height="24"></rect>
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
  );
}

// модальное окно подтверждения удаления
function ConfirmationModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null; // Не отображаем модальное окно, если оно закрыто

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "5px",
          textAlign: "center",
          marginLeft: "15px",
          marginRight: "15px",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "0px", }}>
          <thead>
            <tr>
              <th
                colSpan="2"
                style={{
                  padding: "10px",
                  borderBottom: "1px solid #ddd",
                  fontSize: "16px",
                }}
              >
                {message}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  padding: "10px",
                  borderTop: "1px solid #ddd",
                }}
              >
                <button
                  onClick={onConfirm}
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginTop: "10px",
                    width: "70%",
                    maxWidth: "200px",
                    minWidth: "150px",
                  }}
                >
                  Да
                </button>
              </td>
              <td
                style={{
                  padding: "10px",
                  borderTop: "1px solid #ddd",
                }}
              >
                <button
                  onClick={onClose}
                  style={{
                    backgroundColor: "#f44336",
                    color: "white",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginTop: "10px",
                    width: "70%",
                    maxWidth: "200px",
                    minWidth: "150px",
                  }}
                >
                  Нет
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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

  // Функция для загрузки данных
  const fetchNomenklatura = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/nomenklatura');
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
    fetchNomenklatura();
    toggleTableVisibility(false);
    toggleProductVisibility(true);
  };

  const [editRowId, setEditRowId] = useState(null); // ID строки, которая редактируется
  const [editValue, setEditValue] = useState(""); // Значение для редактирования
  const [hoverRowId, setHoverRowId] = useState(null); // ID строки, на которую наведена мышь

  const [editMeasurementValue, setEditMeasurementValue] = useState("");
  const [editGroupValue, setEditGroupValue] = useState("");

  // const handleEditClick = (id, currentValue) => {
  const handleEditClick = (id, currentValue, currentMeasurement, currentGroup) => {
    setEditRowId(id); // Устанавливаем редактируемую строку
    setEditValue(currentValue); // Подставляем текущее значение
    if (isTableProductVisible) {
      setEditMeasurementValue(currentMeasurement); // Устанавливаем текущее значение измерения
      setSelectedGroup(currentGroup); // Устанавливаем текущее значение группы
    }
  };

  // функция удаления текста в поле поиска
  const handleCancelClick = () => {
    setEditRowId(null); // Отменяем редактирование
    setEditValue(""); // Очищаем значение
  };

  // блок сохранения редактируемой записи
  const handleSaveClick = async (id) => {
    if (isTableGroupVisible) {
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
    } else if (isTableProductVisible) {

      // v4
      try {
        const currentGroup = groups.find((group) => group.id === id);

        // Устанавливаем значения по умолчанию, если они не указаны
        const updatedMeasurement = editMeasurementValue.trim() || currentGroup.measurement;
        const updatedGroup = selectedGroup; // Значение может быть null

        // Проверяем, изменились ли данные
        if (
          currentGroup.name === editValue &&
          currentGroup.measurement === updatedMeasurement &&
          currentGroup.group === updatedGroup
        ) {
          addNotification("info", "", "Изменений не найдено.");
          setEditRowId(null);
          setEditValue("");
          setEditMeasurementValue("");
          setSelectedGroup("");
          return;
        }

        // Отправляем запрос на сервер
        const response = await fetch(`/api/nomenklatura/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editValue,
            measurement: updatedMeasurement,
            group: updatedGroup, // Может быть null
          }),
        });

        if (!response.ok) {
          throw new Error(`Ошибка при обновлении: ${response.statusText}`);
        }

        // Обновляем локальное состояние
        setGroups((prevGroups) =>
          prevGroups.map((group) =>
            group.id === id
              ? { ...group, name: editValue, measurement: updatedMeasurement, group: updatedGroup }
              : group
          )
        );

        // Показываем уведомление и сбрасываем состояние редактирования
        addNotification("success", "", "Товар успешно обновлен.");
        setEditRowId(null);
        setEditValue("");
        setEditMeasurementValue("");
        setSelectedGroup("");
      } catch (error) {
        console.error("Ошибка сохранения:", error);
        addNotification("error", "", "Не удалось обновить запись. Попробуйте ещё раз.");
      }
    }
  };

  // блок удаления записи
  // v2
  const handleDeleteClick = (id) => {
    const group = groups.find((group) => group.id === id);
    setRowToDelete(group); // Сохраняем данные удаляемой строки
    setIsModalOpen(true); // Открываем модальное окно
  };

  const confirmDelete = async () => {
    const id = rowToDelete.id;
    try {
      const url = isTableGroupVisible
        ? `/api/nomenklatura_groups/${id}`
        : `/api/nomenklatura/${id}`;
      const response = await fetch(url, { method: "DELETE" });

      if (!response.ok) {
        throw new Error(`Ошибка при удалении: ${response.statusText}`);
      }

      setGroups((prevGroups) => prevGroups.filter((group) => group.id !== id));
      addNotification("success", "", "Запись успешно удалена.");
    } catch (error) {
      console.error("Ошибка удаления:", error);
      addNotification("error", "", "Не удалось удалить запись. Попробуйте ещё раз.");
    } finally {
      setIsModalOpen(false); // Закрываем окно
    }
  };

  // блок создания новой записи
  const [newRecordName, setNewRecordName] = useState(""); // Состояние для новой записи

  const handleAddClick = async () => {
    if (isTableGroupVisible) {
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

      // v2
    } else if (isTableProductVisible) {
      // Проверяем, что имя товара не пустое
      if (!newRecordName.trim()) {
        addNotification("error", "", "Название товара не может быть пустым");
        return;
      }

      // Устанавливаем значение измерения по умолчанию, если оно не задано
      const measurementValue = editMeasurementValue.trim() || "шт";

      try {
        const response = await fetch("/api/nomenklatura", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newRecordName,
            measurement: measurementValue
          }),
        });

        if (!response.ok) {
          if (response.status === 409) {
            addNotification("warning", "", "Такая номенклатура уже существует.");
          } else {
            throw new Error("Ошибка добавления записи");
          }
          return; // Прекращаем выполнение в случае ошибки
        }

        const data = await response.json();

        if (data && data.id) {
          setGroups((prevGroups) => [
            ...prevGroups,
            { id: data.id, name: newRecordName, measurement: measurementValue },
          ]);
          addNotification("success", "", "Товар успешно добавлен.");
          setNewRecordName(""); // Очистить поле ввода
          setEditMeasurementValue(""); // Сбросить измерение
        } else {
          throw new Error("Неверный ответ от сервера");
        }
      } catch (err) {
        console.error("Ошибка при добавлении записи:", err);
        addNotification("error", "", "Не удалось добавить запись. Попробуйте ещё раз.");
      }
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
  // const handleSuccess = () => {
  //   addNotification("success", "Успех!", "Ваш запрос выполнен успешно.");
  // };

  // const handleError = () => {
  //   addNotification("error", "Ошибка!", "Ваш запрос завершился с ошибкой.");
  // };

  // const handleInfo = () => {
  //   addNotification("info", "Информация", "Проверьте новые функции.");
  // };

  // const handleWarning = () => {
  //   addNotification("warning", "Предупреждение!", "Батарея почти разряжена.");
  // };


  // блок управления значениями группы
  const [groupOptions, setGroupOptions] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(""); // Текущее выбранное значение группы

  useEffect(() => {
    const fetchGroupOptions = async () => {
      try {
        const response = await fetch('/api/nomenklatura_groups');
        const data = await response.json();
        setGroupOptions(data.map((group) => group.name)); // Только `name`
      } catch (err) {
        console.error("Ошибка загрузки групп:", err);
      }
    };

    fetchGroupOptions();
  }, []);

  // блок сортировки
  // Состояние сортировки
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "ascending" });

  // v2
  const sortedAndFilteredGroups = useMemo(() => {
    let filtered = groups.filter((group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!sortConfig.key) return filtered; // Если нет сортировки, возвращаем отфильтрованные данные

    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Сравнение чисел и строк
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "ascending" ? aValue - bValue : bValue - aValue;
      } else {
        return sortConfig.direction === "ascending"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      }
    });

    return filtered;
  }, [groups, searchTerm, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prevConfig) => {
      const newDirection =
        prevConfig.key === key && prevConfig.direction === "ascending"
          ? "descending"
          : "ascending";
      return { key, direction: newDirection };
    });
  };

  // переменные модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

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

      {/* рендер модального окна */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        message={`Вы уверены, что хотите удалить "${rowToDelete?.name}"?`}
      />

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
              <div className='add-group-width'>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск по имени группы"
                  className="form-control"
                  style={{
                    width: "100%",
                    paddingLeft: "40px", // Увеличиваем отступ для текста
                    // backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none"><g><rect width="24" height="24" fill="white"></rect><circle cx="10.5" cy="10.5" r="6.5" stroke="%23595c5f" stroke-linejoin="round"></circle><path d="M19.6464 20.3536C19.8417 20.5488 20.1583 20.5488 20.3536 20.3536C20.5488 20.1583 20.5488 19.8417 20.3536 19.6464L19.6464 20.3536ZM20.3536 19.6464L15.3536 14.6464L14.6464 15.3536L19.6464 20.3536L20.3536 19.6464Z" fill="%23595c5f"></path></g></svg>')`,
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none"><g><rect width="24" height="24"></rect><circle cx="10.5" cy="10.5" r="6.5" stroke="%23595c5f" stroke-linejoin="round"></circle><path d="M19.6464 20.3536C19.8417 20.5488 20.1583 20.5488 20.3536 20.3536C20.5488 20.1583 20.5488 19.8417 20.3536 19.6464L19.6464 20.3536ZM20.3536 19.6464L15.3536 14.6464L14.6464 15.3536L19.6464 20.3536L20.3536 19.6464Z" fill="%23595c5f"></path></g></svg>')`,
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
                      // top: "50%",
                      top: "127px",
                      // right: "10px",
                      right: "15px",
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
                      {/* <rect width="24" height="24" fill="white"></rect> */}
                      <rect width="24" height="24"></rect>
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
              {/* v2 */}
              <div className='add-group-width'>
                <input
                  type="text"
                  value={newRecordName}
                  onChange={(e) => setNewRecordName(e.target.value)}
                  placeholder="Добавить группу"
                  className="form-control"
                  style={{
                    width: "100%",
                    paddingRight: "40px", // Увеличиваем отступ для кнопки очистки
                  }}
                />
                {newRecordName && (
                  <button
                    onClick={() => setNewRecordName("")} // Очищаем текст при нажатии
                    style={{
                      position: "absolute",
                      // top: "50%",
                      top: "175px",
                      // right: "55px",
                      right: "65px",
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
                      {/* <rect width="24" height="24" fill="white"></rect> */}
                      <rect width="24" height="24"></rect>
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
                  <th className="col-code3" onClick={() => handleSort("id")}>
                    Код
                    {sortConfig.key === "id" && (
                      <span>{sortConfig.direction === "ascending" ? " ▲" : " ▼"}</span>
                    )}
                  </th>

                  <th className="col-name3" onClick={() => handleSort("name")}>
                    Имя группы
                    {sortConfig.key === "name" && (
                      <span>{sortConfig.direction === "ascending" ? " ▲" : " ▼"}</span>
                    )}
                  </th>
                  <th className='col-actions3'></th>
                </thead>
                <tbody>
                  {/* Строки с данными */}
                  {sortedAndFilteredGroups.map((group) => (
                    <tr
                      key={group.id}
                      onMouseEnter={() => setHoverRowId(group.id)} // При наведении сохраняем ID строки
                      onMouseLeave={() => setHoverRowId(null)} // При уходе сбрасываем
                    >
                      <td td className='col-code3, black, fnt'>{group.id}</td>
                      <td td className='col-name3, black'>
                        {editRowId === group.id ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="form-control"
                            style={{
                              height: 28
                            }}
                          />
                        ) : (
                          <span className='fnt'>{group.name}</span>
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
      {isTableProductVisible && ( // Условное отображение таблицы
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
              <div className='add-group-width'>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск по имени товара"
                  className="form-control"
                  style={{
                    width: "100%",
                    paddingLeft: "40px", // Увеличиваем отступ для текста
                    // backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none"><g><rect width="24" height="24" fill="white"></rect><circle cx="10.5" cy="10.5" r="6.5" stroke="%23595c5f" stroke-linejoin="round"></circle><path d="M19.6464 20.3536C19.8417 20.5488 20.1583 20.5488 20.3536 20.3536C20.5488 20.1583 20.5488 19.8417 20.3536 19.6464L19.6464 20.3536ZM20.3536 19.6464L15.3536 14.6464L14.6464 15.3536L19.6464 20.3536L20.3536 19.6464Z" fill="%23595c5f"></path></g></svg>')`,
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none"><g><rect width="24" height="24"></rect><circle cx="10.5" cy="10.5" r="6.5" stroke="%23595c5f" stroke-linejoin="round"></circle><path d="M19.6464 20.3536C19.8417 20.5488 20.1583 20.5488 20.3536 20.3536C20.5488 20.1583 20.5488 19.8417 20.3536 19.6464L19.6464 20.3536ZM20.3536 19.6464L15.3536 14.6464L14.6464 15.3536L19.6464 20.3536L20.3536 19.6464Z" fill="%23595c5f"></path></g></svg>')`,
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
                      // top: "50%",
                      top: "127px",
                      // right: "10px",
                      right: "15px",
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
                      {/* <rect width="24" height="24" fill="white"></rect> */}
                      <rect width="24" height="24"></rect>
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
              {/* v2 */}
              <div className='add-group-width'>
                <input
                  type="text"
                  value={newRecordName}
                  onChange={(e) => setNewRecordName(e.target.value)}
                  placeholder="Добавить товар"
                  className="form-control"
                  style={{
                    width: "100%",
                    paddingRight: "40px", // Увеличиваем отступ для кнопки очистки
                  }}
                />
                {newRecordName && (
                  <button
                    onClick={() => setNewRecordName("")} // Очищаем текст при нажатии
                    style={{
                      position: "absolute",
                      // top: "50%",
                      top: "175px",
                      // right: "55px",
                      right: "65px",
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
                      {/* <rect width="24" height="24" fill="white"></rect> */}
                      <rect width="24" height="24"></rect>
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
                    <th className="col-code5" onClick={() => handleSort("id")}>
                      Код
                      {sortConfig.key === "id" && (
                        <span>{sortConfig.direction === "ascending" ? " ▲" : " ▼"}</span>
                      )}
                    </th>
                    <th className="col-name5" onClick={() => handleSort("name")}>
                      Имя товара
                      {sortConfig.key === "name" && (
                        <span>{sortConfig.direction === "ascending" ? " ▲" : " ▼"}</span>
                      )}
                    </th>
                    <th className="col-grp5" onClick={() => handleSort("group")}>
                      Группа
                      {sortConfig.key === "group" && (
                        <span>{sortConfig.direction === "ascending" ? " ▲" : " ▼"}</span>
                      )}
                    </th>
                    <th className="col-meas5" onClick={() => handleSort("measurement")}>
                      Ед.
                      {sortConfig.key === "measurement" && (
                        <span>{sortConfig.direction === "ascending" ? " ▲" : " ▼"}</span>
                      )}
                    </th>
                    <th className='col-actions5'></th>
                  </tr>
                </thead>
                <tbody>
                  {/* Строки с данными */}
                  {sortedAndFilteredGroups.map((group) => (
                    <tr
                      key={group.id}
                      onMouseEnter={() => setHoverRowId(group.id)} // При наведении сохраняем ID строки
                      onMouseLeave={() => setHoverRowId(null)} // При уходе сбрасываем
                    >
                      <td className='col-code, black, fnt'>{group.id}</td>
                      <td className='col-name, black'>
                        {editRowId === group.id ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="form-control"
                            style={{
                              // paddingTop: 0,
                              height: 28
                            }}
                          />
                        ) : (
                          <Link to={`/item/${group.id}`} className="item-link">
                            <span className='fnt'>{group.name}</span>
                          </Link>
                        )}
                      </td>
                      {/* v2 */}
                      <td>
                        {editRowId === group.id ? (
                          <Dropdown
                            options={groupOptions} // Список строк
                            selected={selectedGroup} // Текущее значение
                            onChange={(value) => setSelectedGroup(value)} // Устанавливаем строку в состояние
                          />
                        ) : (
                          <span>{group.group}</span>
                        )}
                      </td>

                      {/* <td style={{ borderRight: "none" }}> */}
                      <td className='black'>
                        {editRowId === group.id ? (
                          <select
                            value={editMeasurementValue} // Связываем с состоянием
                            onChange={(e) => setEditMeasurementValue(e.target.value)}
                            className="form-select"
                            style={{
                              paddingTop: 0,
                              height: 28,
                            }}
                          >
                            <option value="шт">шт</option>
                            <option value="кор">кор</option>
                            <option value="упк">упк</option>
                          </select>
                        ) : (
                          <span>{group.measurement}</span>
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
                              onClick={() => handleEditClick(group.id, group.name, group.measurement, group.group)}
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
