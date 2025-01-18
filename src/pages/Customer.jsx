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

// Модальное окно подтверждения удаления
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
          padding: 20,
          borderRadius: 5,
          textAlign: "center",
          marginLeft: "15px",
          marginRight: "15px",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 0 }}>
          <thead>
            <tr>
              <th
                colSpan="2"
                style={{
                  padding: 10,
                  borderBottom: "1px solid #ddd",
                  fontSize: 16,
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
                  padding: 10,
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
                    borderRadius: 5,
                    cursor: "pointer",
                    marginTop: 10,
                    width: "70%",
                    maxWidth: 200,
                    minWidth: 150,
                  }}
                >
                  Да
                </button>
              </td>
              <td
                style={{
                  padding: 10,
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
                    borderRadius: 5,
                    cursor: "pointer",
                    marginTop: 10,
                    width: "70%",
                    maxWidth: 200,
                    minWidth: 150,
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

// Основной компонент - Контрагенты
function Counterparties() {
  const [counterparties, setCounterparties] = useState([]); // Массив контрагентов
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [editRowId, setEditRowId] = useState(null); // ID редактируемой строки
  const [editValue, setEditValue] = useState("");   // Имя контрагента в режиме редактирования
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editisCustomer, setEditisCustomer] = useState("");
  const [editisSupplier, setEditisSupplier] = useState("");
  const [editRole, setEditRole] = useState("customer");


  const [notifications, setNotifications] = useState([]);
  const [notificationQueue, setNotificationQueue] = useState([]);
  const MAX_NOTIFICATIONS = 3;

  // Для поиска/фильтра
  const [searchTerm, setSearchTerm] = useState("");
  // Для сортировки
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "ascending" });

  // Флаг, чтобы отображать "Данных нет"
  const [isTableNotEmpty, setIsTableNotEmpty] = useState(false);

  // ------------------------------------------------------------------
  // Загрузка списка контрагентов (GET /api/counterparties)
  // ------------------------------------------------------------------
  const fetchCounterparties = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/counterparties");
      if (!response.ok) {
        throw new Error("Ошибка загрузки данных");
      }
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setIsTableNotEmpty(true);
      } else {
        setIsTableNotEmpty(false);
      }

      setCounterparties(data || []);
    } catch (err) {
      setError(err.message);
      setIsTableNotEmpty(false);
      addNotification("error", "", "База данных недоступна");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Уведомления
  // ------------------------------------------------------------------
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
  }, [notifications, notificationQueue]);

  // ------------------------------------------------------------------
  // При первом рендере грузим контрагентов
  // ------------------------------------------------------------------
  useEffect(() => {
    fetchCounterparties();
  }, []);

  // ------------------------------------------------------------------
  // Добавление нового контрагента (POST /api/counterparties)
  // ------------------------------------------------------------------
  const [newRecordName, setNewRecordName] = useState("");

  const handleAddClick = async () => {
    if (!newRecordName.trim()) {
      addNotification("error", "", "Имя контрагента не может быть пустым");
      return;
    }
    try {
      const response = await fetch("/api/counterparties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newRecordName }),
      });
      if (!response.ok) {
        if (response.status === 409) {
          addNotification("warning", "", "Такой контрагент уже существует.");
        } else {
          throw new Error("Ошибка добавления записи");
        }
      } else {
        const data = await response.json();
        setCounterparties((prev) => [...prev, { id: data.id, name: newRecordName }]);
        addNotification("success", "", "Контрагент успешно добавлен.");
        setNewRecordName("");
        // Перезагрузим полный список
        fetchCounterparties();
      }
    } catch (err) {
      console.error("Ошибка при добавлении:", err);
      addNotification("error", "", "Не удалось добавить запись. Попробуйте ещё раз.");
    }
  };

  // ------------------------------------------------------------------
  // Редактирование
  // ------------------------------------------------------------------
  // const handleEditClick = (id, currentName, currentAddress, currentPhone, currentIsCustomer, currentIsSupplier) => {
  const handleEditClick = (id, currentName, currentAddress, currentPhone, currentRole) => {
    setEditRowId(id);
    setEditValue(currentName);
    // currentAddress === null ? currentAddress = "" : 
    setEditAddress(currentAddress ?? "");
    // currentPhone === null ? currentPhone = "" : 
    setEditPhone(currentPhone ?? "");
    setEditRole(currentRole || "customer");
  };

  const handleCancelClick = () => {
    setEditRowId(null);
    setEditValue("");
  };

  const handleSaveClick = async (id) => {
    const current = counterparties.find((c) => c.id === id);
    if (!current) return;

    // Если имя не менялось
    // if ((current.name === editValue.trim() && current.address === null && current.phone === null && current.role === editRole) || (current.name === editValue.trim() && current.address === editAddress.trim() && current.phone === editPhone.trim() && current.role === editRole)) {
    if (current.name === editValue.trim() && current.address === editAddress.trim() && current.phone === editPhone.trim() && current.role === editRole) {
      addNotification("info", "", "Изменений не найдено.");
      handleCancelClick();
      return;
    }

    try {
      const response = await fetch(`/api/counterparties/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify({ name: editValue.trim() }),
        body: JSON.stringify({
          name: editValue.trim(),
          phone: editPhone.trim(),
          address: editAddress.trim(),
          role: editRole,  // <-- отправляем значение из <select>
        }),
      });
      if (!response.ok) {
        throw new Error("Ошибка при обновлении");
      }
      await response.json();

      addNotification("success", "", "Контрагент успешно обновлен.");

      // setCounterparties((prev) =>
      //   prev.map((item) => (item.id === id ? { ...item, name: editValue.trim() } : item))
      // ); // обновление без запроса в БД

      // Перезагрузим полный список
      fetchCounterparties();

      handleCancelClick();
    } catch (err) {
      console.error("Ошибка при обновлении:", err);
      addNotification("error", "", "Не удалось обновить запись.");
    }
  };

  // ------------------------------------------------------------------
  // Удаление (DELETE /api/counterparties/:id)
  // ------------------------------------------------------------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const handleDeleteClick = (id) => {
    const toDelete = counterparties.find((c) => c.id === id);
    setRowToDelete(toDelete);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!rowToDelete) return;

    try {
      const response = await fetch(`/api/counterparties/${rowToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Ошибка при удалении");
      }
      addNotification("success", "", "Контрагент успешно удалён.");
      setCounterparties((prev) => prev.filter((c) => c.id !== rowToDelete.id));
    } catch (err) {
      console.error("Ошибка удаления:", err);
      addNotification("error", "", "Не удалось удалить запись.");
    } finally {
      setIsModalOpen(false);
      setRowToDelete(null);

      // Перезагрузим полный список
      fetchCounterparties();
    }
  };

  // ------------------------------------------------------------------
  // Поиск + Сортировка
  // ------------------------------------------------------------------
  const handleSort = (key) => {
    setSortConfig((prev) => {
      const newDir = prev.key === key && prev.direction === "ascending"
        ? "descending"
        : "ascending";
      return { key, direction: newDir };
    });
  };

  const sortedAndFiltered = useMemo(() => {
    let filtered = counterparties.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!sortConfig.key) return filtered;

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
  }, [counterparties, searchTerm, sortConfig]);

  // ------------------------------------------------------------------
  // Рендер
  // ------------------------------------------------------------------
  return (
    <div style={{ alignItems: "center" }}>
      <h2>Справочник контрагентов</h2>

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

      {loading ? (
        <div className="snippet" data-title="dot-spin">
          <div className="stage">
            <div className="dot-spin"></div>
          </div>
        </div>
      ) : (
        <div className="table-container">
          {/* Поиск */}
          <div className="add-group-width">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск по имени контрагента"
              className="form-control"
              style={{
                width: "100%",
                paddingLeft: 40,
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
                  fontSize: 16,
                  color: "black",
                }}
              >
                {/* Иконка очистить */}
                <svg
                  viewBox="0 2 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: 25, height: 25 }}
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

          {/* Добавить нового контрагента */}
          <div className="add-group-width">
            <input
              type="text"
              value={newRecordName}
              onChange={(e) => setNewRecordName(e.target.value)}
              placeholder="Добавить контрагента"
              className="form-control"
              style={{
                width: "100%",
                paddingRight: 40,
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
                  fontSize: 16,
                  color: "black",
                }}
              >
                {/* Иконка очистить */}
                <svg
                  viewBox="0 2 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: 25, height: 25 }}
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
              style={{ paddingLeft: 15 }}
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

          {/* Таблица контрагентов */}
          {!isTableNotEmpty ? (
            <center><p>Данных пока нет</p></center>
          ) : (
            <table className="rtable">
              <thead>
                <tr>
                  <th onClick={() => handleSort("id")}>
                    Код
                    {sortConfig.key === "id" &&
                      (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                  </th>
                  <th onClick={() => handleSort("name")}>
                    Имя контрагента
                    {sortConfig.key === "name" &&
                      (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                  </th>
                  <th onClick={() => handleSort("phone")}>
                    Телефон
                    {sortConfig.key === "phone" &&
                      (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                  </th>
                  <th onClick={() => handleSort("address")}>
                    Адрес
                    {sortConfig.key === "address" &&
                      (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                  </th>
                  <th onClick={() => handleSort("type")}>
                    ?
                    {sortConfig.key === "type" &&
                      (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                  </th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sortedAndFiltered.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>
                      {editRowId === c.id ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="form-control"
                          style={{ height: 28 }}
                        />
                      ) : (
                        // Если захотите ссылку на детальную страницу контрагента - используйте Link
                        <span>{c.name}</span>
                      )}
                    </td>
                    <td>
                      {editRowId === c.id ? (
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="form-control"
                          style={{ height: 28 }}
                        />
                      ) : (
                        // Если захотите ссылку на детальную страницу контрагента - используйте Link
                        <span>{c.phone}</span>
                      )}
                    </td>
                    <td>
                      {editRowId === c.id ? (
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="form-control"
                          style={{ height: 28 }}
                        />
                      ) : (
                        // Если захотите ссылку на детальную страницу контрагента - используйте Link
                        <span>{c.address}</span>
                      )}
                    </td>
                    <td>
                      {editRowId === c.id ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="form-select"
                          style={{ height: 28 }}
                        >
                          <option value="customer">Клиент</option>
                          <option value="supplier">Поставщик</option>
                        </select>
                      ) : (
                        <span>
                          {c.role === "customer"
                            ? "Клиент"
                            : c.role === "supplier"
                              ? "Поставщик"
                              : "нет данных"}
                        </span>
                      )}
                    </td>

                    <td style={{ textAlign: "center" }}>
                      {editRowId === c.id ? (
                        <>
                          <button
                            className="btn-icon btn-success"
                            onClick={() => handleSaveClick(c.id)}
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
                            onClick={() => handleDeleteClick(c.id)}
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
                            onClick={() => handleEditClick(c.id, c.name, c.address, c.phone, c.role)}
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
                              <path d="M6 12H18" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M6 15.5H18" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M6 8.5H18" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" />
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
          {error && <p style={{ color: "red" }}>Ошибка: {error}</p>}
        </div>
      )}
    </div>
  );
}

export default Counterparties;
