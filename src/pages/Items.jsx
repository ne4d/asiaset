import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from "prop-types";
import '../css/materialoutlinedbutton.css';
import '../css/cssonlyresponcivetables_v2.css';
import '../css/notifications.css'; // уведомления
import '../css/overItems.css';
import '../css/threedotsloading.css'; // загрузка

// Notification
function Notification({ type, title, message, onClose }) {
  return (
    <div className={`notification notification-${type}`}>
      <button className="notification-close" onClick={onClose} />
      <div className="notification-title">{title}</div>
      <div className="notification-message">{message}</div>
    </div>
  );
}

// Dropdown (v4), работа с [{value, label}]
Dropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  selected: PropTypes.shape({
    value: PropTypes.number,
    label: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
};

Dropdown.defaultProps = {
  options: [],
  selected: null,
};

function Dropdown({ options, selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(selected ? selected.label : "");

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option);
    setSearchValue(option.label);
    setIsOpen(false);
  };

  const handleFocus = () => setIsOpen(true);
  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
  };

  const handleClear = () => {
    setSearchValue("");
    onChange(null);
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        value={searchValue}
        onClick={handleFocus}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Выберите группу"
        className="form-control"
        style={{ height: 28 }}
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
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option)}
              style={{
                padding: "8px",
                cursor: "pointer",
                borderBottom: "1px solid #f0f0f0",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#f5f5f5")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
            >
              {option.label}
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
            style={{ width: "25px", height: "25px" }}
          >
            <rect width="24" height="24" />
            <path
              d="M7 17L16.8995 7.10051"
              stroke="#595c5f"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 7.00001L16.8995 16.8995"
              stroke="#595c5f"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

// ConfirmationModal
function ConfirmationModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

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
        <table
          style={{ width: "100%", borderCollapse: "collapse", marginBottom: "0px" }}
        >
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

// Основной компонент
function Items() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Видимость таблиц
  const [isTableGroupVisible, setIsTableGroupVisible] = useState(false);
  const [isTableProductVisible, setIsTableProductVisible] = useState(false);

  // Для редактирования
  const [editRowId, setEditRowId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editMeasurementValue, setEditMeasurementValue] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null); // Объект {value, label} или null

  // Для уведомлений
  const [notifications, setNotifications] = useState([]);
  const [notificationQueue, setNotificationQueue] = useState([]);
  const MAX_NOTIFICATIONS = 3;

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "ascending" });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const [isTableNotEmpty, setisTableNotEmpty] = useState(false);

  // ----------------------------------------------------------------
  // Загрузка групп (пока что для вкладки "Группы")
  // ----------------------------------------------------------------
  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/nomenklatura_groups");
      if (!response.ok) {
        throw new Error("Ошибка загрузки данных");
      }
      const data = await response.json();
      // data = [{id, name}, ...]
      
      // Проверяем, что data не null и является массивом
      if (Array.isArray(data) && data.length > 0) {
        setisTableNotEmpty(true); // Если массив не пустой
      } else {
        setisTableNotEmpty(false); // Если массив пустой или data не массив
      }

      // setGroups(data);
      setGroups(data || []); // Сохраняем данные или пустой массив

    } catch (err) {
      setError(err.message);
      setisTableNotEmpty(false); // Устанавливаем false в случае ошибки
      addNotification("error", "", "База данных недоступна");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // Загрузка товаров (номенклатуры) для вкладки "Товары"
  // ----------------------------------------------------------------
  const fetchNomenklatura = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/nomenklatura");
      if (!response.ok) {
        throw new Error("Ошибка загрузки данных");
      }
      const data = await response.json();
      // data = [{ id, name, measurement, group_id, group_name }, ... ]
      
      // Проверяем, что data не null и является массивом
      if (Array.isArray(data) && data.length > 0) {
        setisTableNotEmpty(true); // Если массив не пустой
      } else {
        setisTableNotEmpty(false); // Если массив пустой или data не массив
      }

      // setGroups(data);
      setGroups(data || []); // Сохраняем данные или пустой массив
    } catch (err) {
      setError(err.message);
      setisTableNotEmpty(false); // Устанавливаем false в случае ошибки
      addNotification("error", "", "База данных недоступна");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // Грузим список групп для дропдауна (groupOptions)
  // (можно объединить с fetchGroups, если нужно)
  // ----------------------------------------------------------------
  const [groupOptions, setGroupOptions] = useState([]);

  useEffect(() => {
    const fetchGroupOptions = async () => {
      try {
        const resp = await fetch("/api/nomenklatura_groups");
        if (!resp.ok) throw new Error("Ошибка при загрузке списка групп");
        const data = await resp.json();
        // [{id, name}, ...]

        const mapped = data.map((g) => ({
          value: g.id,
          label: g.name,
        }));
        setGroupOptions(mapped);
      } catch (err) {
        console.error("Ошибка загрузки groupOptions:", err);
      }
    };
    fetchGroupOptions();
  }, []);

  // ----------------------------------------------------------------
  // Клики по кнопкам "Группы" / "Товары"
  // ----------------------------------------------------------------
  const handleLoadGroups = () => {
    fetchGroups();
    setIsTableGroupVisible(true);
    setIsTableProductVisible(false);
    setEditRowId(null);
  };

  const handleLoadProducts = () => {
    fetchNomenklatura();
    setIsTableGroupVisible(false);
    setIsTableProductVisible(true);
    setEditRowId(null);
  };

  // ----------------------------------------------------------------
  // Уведомления
  // ----------------------------------------------------------------
  const addNotification = (type, title, message) => {
    const id = Date.now();
    if (notifications.length < MAX_NOTIFICATIONS) {
      setNotifications((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => removeNotification(id), 3000);
    } else {
      setNotificationQueue((prev) => [...prev, { id, type, title, message }]);
    }
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    if (notifications.length < MAX_NOTIFICATIONS && notificationQueue.length > 0) {
      const [nextNotification, ...restQueue] = notificationQueue;
      setNotificationQueue(restQueue);
      setNotifications((prev) => [...prev, nextNotification]);
      setTimeout(() => removeNotification(nextNotification.id), 3000);
    }
    handleLoadGroups();// загрузка групп при открытии страницы
  }, [notifications, notificationQueue]);

  // ----------------------------------------------------------------
  // Добавление новой записи
  // ----------------------------------------------------------------
  const [newRecordName, setNewRecordName] = useState("");

  const handleAddClick = async () => {
    if (isTableGroupVisible) {
      if (!newRecordName.trim()) {
        addNotification("error", "", "Название группы не может быть пустым");
        return;
      }
      try {
        const resp = await fetch("/api/nomenklatura_groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newRecordName }),
        });
        if (!resp.ok) {
          if (resp.status === 409) {
            addNotification("warning", "", "Такая группа уже существует.");
          } else {
            throw new Error("Ошибка добавления записи");
          }
        } else {
          const data = await resp.json();
          // data.id
          setGroups((prev) => [...prev, { id: data.id, name: newRecordName }]);
          addNotification("success", "", "Группа успешно добавлена.");
          setNewRecordName("");
          handleLoadGroups();
        }
      } catch (err) {
        console.error("Ошибка при добавлении записи:", err);
        addNotification("error", "", "Не удалось добавить запись. Попробуйте ещё раз.");
      }
    } else if (isTableProductVisible) {
      if (!newRecordName.trim()) {
        addNotification("error", "", "Название товара не может быть пустым");
        return;
      }
      const measurementValue = editMeasurementValue.trim() || "шт";

      // Если хотим сразу привязывать к группе, можно использовать selectedGroup
      // Пример: const selectedGroupId = selectedGroup ? selectedGroup.value : 0;

      try {
        const resp = await fetch("/api/nomenklatura", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newRecordName,
            // group_id: selectedGroupId, // если нужно
            measurement: measurementValue,
          }),
        });
        if (!resp.ok) {
          if (resp.status === 409) {
            addNotification("warning", "", "Такая номенклатура уже существует.");
          } else {
            throw new Error("Ошибка добавления записи");
          }
        } else {
          const data = await resp.json();
          if (data && data.id) {
            setGroups((prev) => [
              ...prev,
              {
                id: data.id,
                name: newRecordName,
                measurement: measurementValue,
                // group_id: 0, // или null, если не передавали
                // group_name: "",
              },
            ]);
            addNotification("success", "", "Товар успешно добавлен.");
            setNewRecordName("");
            setEditMeasurementValue("");
            handleLoadProducts();
          } else {
            throw new Error("Неверный ответ от сервера");
          }
        }
      } catch (err) {
        console.error("Ошибка при добавлении записи:", err);
        addNotification("error", "", "Не удалось добавить запись. Попробуйте ещё раз.");
      }
    }
  };

  // ----------------------------------------------------------------
  // Редактирование записи (переход в режим редактирования)
  // ----------------------------------------------------------------
  const handleEditClick = (id, currentName, currentMeasurement, currentGroupId) => {
    setEditRowId(id);
    setEditValue(currentName || "");
    setEditMeasurementValue(currentMeasurement || "");

    if (isTableProductVisible) {
      const foundOption = groupOptions.find((opt) => opt.value === currentGroupId);
      setSelectedGroup(foundOption || null);
    }
  };

  const handleCancelClick = () => {
    setEditRowId(null);
    setEditValue("");
    setEditMeasurementValue("");
    setSelectedGroup(null);
  };

  // ----------------------------------------------------------------
  // Сохранение изменений (PUT)
  // ----------------------------------------------------------------
  const handleSaveClick = async (id) => {
    if (isTableGroupVisible) {
      // Сохранить группу
      try {
        const currentGroup = groups.find((g) => g.id === id);
        if (!currentGroup) return;

        if (currentGroup.name === editValue) {
          addNotification("info", "", "Изменений не найдено.");
          handleCancelClick();
          return;
        }

        const resp = await fetch(`/api/nomenklatura_groups/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: editValue }),
        });
        if (!resp.ok) {
          throw new Error("Ошибка при обновлении");
        }
        const data = await resp.json();
        addNotification("success", "", "Группа успешно обновлена.");

        setGroups((prev) =>
          prev.map((g) => (g.id === id ? { ...g, name: editValue } : g))
        );
        handleCancelClick();
      } catch (err) {
        console.error("Ошибка сохранения:", err);
        addNotification("error", "", "Не удалось обновить запись. Попробуйте ещё раз.");
      }
    } else if (isTableProductVisible) {
      // Сохранить товар
      try {
        const currentItem = groups.find((g) => g.id === id);
        if (!currentItem) return;

        const updatedMeasurement = editMeasurementValue.trim() || currentItem.measurement;
        const updatedGroupId = selectedGroup ? selectedGroup.value : null;

        // Проверка на отсутствие изменений
        if (
          currentItem.name === editValue &&
          currentItem.measurement === updatedMeasurement &&
          currentItem.group_id === updatedGroupId
        ) {
          addNotification("info", "", "Изменений не найдено.");
          handleCancelClick();
          return;
        }

        const resp = await fetch(`/api/nomenklatura/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editValue,
            measurement: updatedMeasurement,
            group_id: updatedGroupId,
          }),
        });
        if (!resp.ok) {
          throw new Error("Ошибка при обновлении");
        }
        addNotification("success", "", "Товар успешно обновлен.");

        // Локально обновим
        setGroups((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  name: editValue,
                  measurement: updatedMeasurement,
                  group_id: updatedGroupId,
                  // нужно ли обновить group_name?
                  group_name: updatedGroupId
                    ? groupOptions.find((opt) => opt.value === updatedGroupId)?.label || ""
                    : "",
                }
              : item
          )
        );
        handleCancelClick();
      } catch (err) {
        console.error("Ошибка сохранения:", err);
        addNotification("error", "", "Не удалось обновить запись. Попробуйте ещё раз.");
      }
    }
  };

  // ----------------------------------------------------------------
  // Удаление записи (DELETE)
  // ----------------------------------------------------------------
  const handleDeleteClick = (id) => {
    const item = groups.find((g) => g.id === id);
    setRowToDelete(item);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!rowToDelete) return;
    const id = rowToDelete.id;
    try {
      const url = isTableGroupVisible
        ? `/api/nomenklatura_groups/${id}`
        : `/api/nomenklatura/${id}`;
      const resp = await fetch(url, { method: "DELETE" });
      if (!resp.ok) {
        throw new Error("Ошибка при удалении");
      }
      addNotification("success", "", "Запись успешно удалена.");
      setGroups((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error("Ошибка удаления:", err);
      addNotification("error", "", "Не удалось удалить запись. Попробуйте ещё раз.");
    } finally {
      setIsModalOpen(false);
      if (isTableGroupVisible) {
        handleLoadGroups();
      } else if (isTableProductVisible) {
        handleLoadProducts();
      }
    }
  };

  // ----------------------------------------------------------------
  // Сортировка + фильтрация
  // ----------------------------------------------------------------
  const handleSort = (key) => {
    setSortConfig((prev) => {
      const newDirection =
        prev.key === key && prev.direction === "ascending"
          ? "descending"
          : "ascending";
      return { key, direction: newDirection };
    });
  };

  const sortedAndFilteredGroups = useMemo(() => {
    let filtered = groups.filter((g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (!sortConfig.key) {
      return filtered;
    }

    filtered.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "ascending" ? aVal - bVal : bVal - aVal;
      } else {
        return sortConfig.direction === "ascending"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      }
    });

    return filtered;
  }, [groups, searchTerm, sortConfig]);

  // ----------------------------------------------------------------
  // Рендер
  // ----------------------------------------------------------------
  return (
    <div style={{ alignItems: "center" }}>
      <h2>Справочник Номенклатур</h2>
      <div style={{ marginTop: "15px", marginBottom: "10px" }}>
        <button onClick={handleLoadGroups} className="pure-material-button-outlined">
          Группы
        </button>
        <button onClick={handleLoadProducts} className="pure-material-button-outlined">
          Товары
        </button>
      </div>

      <div id="notification-container">
        {notifications.map((n) => (
          <Notification
            key={n.id}
            type={n.type}
            title={n.title}
            message={n.message}
            onClose={() => removeNotification(n.id)}
          />
        ))}
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        message={`Вы уверены, что хотите удалить "${rowToDelete?.name}"?`}
      />

      {/* Таблица групп */}
      {isTableGroupVisible && (
        <div className="table-container">
          {loading ? (
            <div className="snippet" data-title="dot-spin">
              <div className="stage">
                <div className="dot-spin"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Поиск */}
              <div className="add-group-width">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск по имени группы"
                  className="form-control"
                  style={{
                    width: "100%",
                    paddingLeft: "40px",
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none"><g><rect width="24" height="24"></rect><circle cx="10.5" cy="10.5" r="6.5" stroke="%23595c5f" stroke-linejoin="round"></circle><path d="M19.6464 20.3536C19.8417 20.5488 20.1583 20.5488 20.3536 20.3536C20.5488 20.1583 20.5488 19.8417 20.3536 19.6464L19.6464 20.3536ZM20.3536 19.6464L15.3536 14.6464L14.6464 15.3536L19.6464 20.3536L20.3536 19.6464Z" fill="%23595c5f"></path></g></svg>')`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "10px center",
                    backgroundSize: "20px 20px",
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    style={{
                      position: "absolute",
                      top: "127px",
                      right: "15px",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "16px",
                      color: "black",
                    }}
                  >
                    {/* Иконка "очистить" */}
                    <svg
                      viewBox="0 2 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ width: "25px", height: "25px" }}
                    >
                      <rect width="24" height="24" />
                      <path
                        d="M7 17L16.8995 7.10051"
                        stroke="#595c5f"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7 7.00001L16.8995 16.8995"
                        stroke="#595c5f"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
              {/* Добавить новую группу */}
              <div className="add-group-width">
                <input
                  type="text"
                  value={newRecordName}
                  onChange={(e) => setNewRecordName(e.target.value)}
                  placeholder="Добавить группу"
                  className="form-control"
                  style={{
                    width: "100%",
                    paddingRight: "40px",
                  }}
                />
                {newRecordName && (
                  <button
                    onClick={() => setNewRecordName("")}
                    style={{
                      position: "absolute",
                      top: "175px",
                      right: "65px",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "16px",
                      color: "black",
                    }}
                  >
                    {/* Иконка "очистить" */}
                    <svg
                      viewBox="0 2 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ width: "25px", height: "25px" }}
                    >
                      <rect width="24" height="24" />
                      <path
                        d="M7 17L16.8995 7.10051"
                        stroke="#595c5f"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7 7.00001L16.8995 16.8995"
                        stroke="#595c5f"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
                <button
                  className="btn-icon btn-success"
                  onClick={handleAddClick}
                  title="Добавить запись"
                  style={{ paddingLeft: "15px" }}
                >
                  {/* Галочка */}
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
                    />
                  </svg>
                </button>
              </div>
              {/* Таблица групп */}
              {!isTableNotEmpty ? (
                    <center><p>Данных пока нет</p></center>
                  ) : (
              <table className="rtable">
                <thead>
                  <tr>
                    <th className="col-code3" onClick={() => handleSort("id")}>
                      Код
                      {sortConfig.key === "id" &&
                        (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                    </th>
                    <th className="col-name3" onClick={() => handleSort("name")}>
                      Имя группы
                      {sortConfig.key === "name" &&
                        (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                    </th>
                    <th className="col-actions3" />
                  </tr>
                </thead>
                <tbody>
                  {sortedAndFilteredGroups.map((g) => (
                    <tr key={g.id}>
                      <td className="col-code3">{g.id}</td>
                      <td className="col-name3">
                        {editRowId === g.id ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="form-control"
                            style={{ height: 28 }}
                          />
                        ) : (
                          <span>{g.name}</span>
                        )}
                      </td>
                      <td className="col-actions-center">
                        {editRowId === g.id ? (
                          <>
                            <button
                              className="btn-icon btn-success"
                              onClick={() => handleSaveClick(g.id)}
                            >
                              {/* Галочка */}
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
                                />
                              </svg>
                            </button>
                            <button
                              className="btn-icon btn-warning"
                              onClick={handleCancelClick}
                            >
                              {/* Стрелка "назад" */}
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
                                />
                              </svg>
                            </button>
                            <button
                              className="btn-icon btn-danger"
                              onClick={() => handleDeleteClick(g.id)}
                            >
                              {/* Крестик */}
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
                                />
                                <path
                                  d="M7 7.00001L16.8995 16.8995"
                                  stroke="#ff0000"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn-icon btn-danger"
                              onClick={() => handleEditClick(g.id, g.name)}
                            >
                              {/* Иконка редактирования (3 полоски) */}
                              <svg
                                width="25px"
                                height="25px"
                                viewBox="3 3 18 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                stroke="#000000"
                                strokeWidth="1.6"
                              >
                                <path
                                  d="M6 12H18"
                                  stroke="#000000"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M6 15.5H18"
                                  stroke="#000000"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M6 8.5H18"
                                  stroke="#000000"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                  )}
            </>
          )}
          {error && (
            <p style={{ color: "red" }}>Ошибка: {error}</p>
          )}
        </div>
      )}

      {/* Таблица товаров */}
      {isTableProductVisible && (
        <div className="table-container">
          {loading ? (
            <div className="snippet" data-title="dot-spin">
              <div className="stage">
                <div className="dot-spin"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Поиск */}
              <div className="add-group-width">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск по имени товара"
                  className="form-control"
                  style={{
                    width: "100%",
                    paddingLeft: "40px",
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none"><g><rect width="24" height="24"></rect><circle cx="10.5" cy="10.5" r="6.5" stroke="%23595c5f" stroke-linejoin="round"></circle><path d="M19.6464 20.3536C19.8417 20.5488 20.1583 20.5488 20.3536 20.3536C20.5488 20.1583 20.5488 19.8417 20.3536 19.6464L19.6464 20.3536ZM20.3536 19.6464L15.3536 14.6464L14.6464 15.3536L19.6464 20.3536L20.3536 19.6464Z" fill="%23595c5f"></path></g></svg>')`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "10px center",
                    backgroundSize: "20px 20px",
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    style={{
                      position: "absolute",
                      top: "127px",
                      right: "15px",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "16px",
                      color: "black",
                    }}
                  >
                    {/* Иконка "очистить" */}
                    <svg
                      viewBox="0 2 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ width: "25px", height: "25px" }}
                    >
                      <rect width="24" height="24" />
                      <path
                        d="M7 17L16.8995 7.10051"
                        stroke="#595c5f"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7 7.00001L16.8995 16.8995"
                        stroke="#595c5f"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
              {/* Добавить новый товар */}
              <div className="add-group-width">
                <input
                  type="text"
                  value={newRecordName}
                  onChange={(e) => setNewRecordName(e.target.value)}
                  placeholder="Добавить товар"
                  className="form-control"
                  style={{
                    width: "100%",
                    paddingRight: "40px",
                  }}
                />
                {newRecordName && (
                  <button
                    onClick={() => setNewRecordName("")}
                    style={{
                      position: "absolute",
                      top: "175px",
                      right: "65px",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "16px",
                      color: "black",
                    }}
                  >
                    {/* Иконка "очистить" */}
                    <svg
                      viewBox="0 2 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ width: "25px", height: "25px" }}
                    >
                      <rect width="24" height="24" />
                      <path
                        d="M7 17L16.8995 7.10051"
                        stroke="#595c5f"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7 7.00001L16.8995 16.8995"
                        stroke="#595c5f"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
                <button
                  className="btn-icon btn-success"
                  onClick={handleAddClick}
                  title="Добавить запись"
                  style={{ paddingLeft: "15px" }}
                >
                  {/* Галочка */}
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
                    />
                  </svg>
                </button>
              </div>
              {/* Таблица товаров */}
              {!isTableNotEmpty ? (
                    <center><p>Данных пока нет</p></center>
                  ) : (
              <table className="rtable">
                <thead>
                  <tr>
                    <th className="col-code5" onClick={() => handleSort("id")}>
                      Код
                      {sortConfig.key === "id" &&
                        (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                    </th>
                    <th className="col-name5" onClick={() => handleSort("name")}>
                      Имя товара
                      {sortConfig.key === "name" &&
                        (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                    </th>
                    <th className="col-grp5" onClick={() => handleSort("group_name")}>
                      Группа
                      {sortConfig.key === "group_name" &&
                        (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                    </th>
                    <th
                      className="col-meas5"
                      onClick={() => handleSort("measurement")}
                    >
                      Ед.
                      {sortConfig.key === "measurement" &&
                        (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                    </th>
                    <th className="col-actions5" />
                  </tr>
                </thead>
                <tbody>
                  {sortedAndFilteredGroups.map((item) => (
                    <tr key={item.id}>
                      {/* <td className="col-code5">{item.id}</td> */}
                      <td className="col-code, black, fnt">{item.id}</td>
                      {/* <td className="col-name5"> */}
                      <td className="col-name, black">
                        {editRowId === item.id ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="form-control"
                            style={{ height: 28 }}
                          />
                        ) : (
                          <Link
                            // to={`/item/${item.id}`}
                            to={`/item/${item.id}`}
                            style={{
                              cursor: "pointer",
                              fontSize: "20px",
                              color: "black",
                              textDecoration: "none",
                            }}
                          >
                            {/* {item.name} */}
                            <span className='fnt'>{item.name}</span>
                          </Link>
                        )}
                      </td>
                      <td className="col-grp5">
                        {editRowId === item.id ? (
                          <Dropdown
                            options={groupOptions}
                            selected={selectedGroup} // {value, label} или null
                            onChange={(option) => setSelectedGroup(option)}
                          />
                        ) : (
                          <span>{item.group_name}</span>
                        )}
                      </td>
                      <td className="col-meas5">
                        {editRowId === item.id ? (
                          <select
                            value={editMeasurementValue}
                            onChange={(e) => setEditMeasurementValue(e.target.value)}
                            className="form-select"
                            style={{ height: 28 }}
                          >
                            <option value="шт">шт</option>
                            <option value="кор">кор</option>
                            <option value="упк">упк</option>
                          </select>
                        ) : (
                          <span>{item.measurement}</span>
                        )}
                      </td>
                      <td className="col-actions-center">
                        {editRowId === item.id ? (
                          <>
                            <button
                              className="btn-icon btn-success"
                              onClick={() => handleSaveClick(item.id)}
                            >
                              {/* Галочка */}
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
                                />
                              </svg>
                            </button>
                            <button
                              className="btn-icon btn-warning"
                              onClick={handleCancelClick}
                            >
                              {/* Стрелка "назад" */}
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
                                />
                              </svg>
                            </button>
                            <button
                              className="btn-icon btn-danger"
                              onClick={() => handleDeleteClick(item.id)}
                            >
                              {/* Крестик */}
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
                                />
                                <path
                                  d="M7 7.00001L16.8995 16.8995"
                                  stroke="#ff0000"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn-icon btn-danger"
                              onClick={() =>
                                handleEditClick(
                                  item.id,
                                  item.name,
                                  item.measurement,
                                  item.group_id // <-- ключевой момент
                                )
                              }
                            >
                              {/* Иконка редактирования */}
                              <svg
                                width="25px"
                                height="25px"
                                viewBox="3 3 18 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                stroke="#000000"
                                strokeWidth="1.6"
                              >
                                <path
                                  d="M6 12H18"
                                  stroke="#000000"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M6 15.5H18"
                                  stroke="#000000"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M6 8.5H18"
                                  stroke="#000000"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                  )}
            </>
          )}
          {error && (
            <p style={{ color: "red" }}>Ошибка: {error}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Items;
