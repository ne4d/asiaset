import React, { useState, useEffect, useMemo } from "react";
import "../css/materialoutlinedbutton.css";
import "../css/cssonlyresponcivetables_v2.css";
import "../css/notifications.css";
import "../css/threedotsloading.css"; // для индикатора загрузки
import "../css/overStorages.css";

function Notification({ type, title, message, onClose }) {
  return (
    <div className={`notification notification-${type}`}>
      <button className="notification-close" onClick={onClose} />
      <div className="notification-title">{title}</div>
      <div className="notification-message">{message}</div>
    </div>
  );
}

function ConfirmationModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw", height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: 20,
          borderRadius: 5,
          textAlign: "center",
          margin: "0 15px",
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
              <td style={{ padding: 10, borderTop: "1px solid #ddd" }}>
                <button
                  onClick={onConfirm}
                  style={{
                    backgroundColor: "#4CAF50", color: "white",
                    padding: "10px 20px", border: "none",
                    borderRadius: 5, cursor: "pointer",
                    marginTop: 10, width: "70%", maxWidth: 200, minWidth: 150
                  }}
                >
                  Да
                </button>
              </td>
              <td style={{ padding: 10, borderTop: "1px solid #ddd" }}>
                <button
                  onClick={onClose}
                  style={{
                    backgroundColor: "#f44336", color: "white",
                    padding: "10px 20px", border: "none",
                    borderRadius: 5, cursor: "pointer",
                    marginTop: 10, width: "70%", maxWidth: 200, minWidth: 150
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

function Locations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  // Флаги режима (true => показываем склады; false => показываем точки продаж)
  const [isStorageMode, setIsStorageMode] = useState(false);
  const [isSalespointMode, setIsSalespointMode] = useState(false);

  // Уведомления
  const [notifications, setNotifications]         = useState([]);
  const [notificationQueue, setNotificationQueue] = useState([]);
  const MAX_NOTIFICATIONS = 3;

  // Поиск/фильтр (по имени на фронте, если хотите)
  const [searchTerm, setSearchTerm] = useState("");

  // Состояние сортировки
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "ascending" });

  // Для редактирования
  const [editRowId, setEditRowId]       = useState(null);
  const [editName, setEditName]         = useState("");
  const [editAddress, setEditAddress]   = useState("");

  // Для добавления
  const [newRecordName, setNewRecordName] = useState("");

  // Модалка удаления
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  // Флаг "не пусто?"
  const [isTableNotEmpty, setIsTableNotEmpty] = useState(false);

  // -----------------------------------------------
  // Уведомления
  // -----------------------------------------------
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
  // Чтобы очередь уведомлений работала
  useEffect(() => {
    if (notifications.length < MAX_NOTIFICATIONS && notificationQueue.length > 0) {
      const [nextNotification, ...restQueue] = notificationQueue;
      setNotificationQueue(restQueue);
      setNotifications((prev) => [...prev, nextNotification]);
      setTimeout(() => removeNotification(nextNotification.id), 3000);
    }
  }, [notifications, notificationQueue]);

  // -----------------------------------------------
  // Загрузка (GET /api/locations?type=...)
  // -----------------------------------------------
  const fetchLocations = async (theType) => {
    setLoading(true);
    setError(null);

    // Формируем URL: /api/locations?type=storage или salespoint
    let url = "/api/locations";
    if (theType) {
      url += `?type=${theType}`; 
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Ошибка загрузки данных");
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setIsTableNotEmpty(true);
      } else {
        setIsTableNotEmpty(false);
      }
      setLocations(data || []);
    } catch (err) {
      setError(err.message);
      setIsTableNotEmpty(false);
      addNotification("error", "", "Не удалось загрузить локации");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------
  // Кнопки «Склады» / «Точки продаж»
  // -----------------------------------------------
  const handleLoadStorages = () => {
    setIsStorageMode(true);
    setIsSalespointMode(false);
    setEditRowId(null);
    // Запрашиваем только type=storage
    fetchLocations("storage");
  };

  const handleLoadSalespoints = () => {
    setIsStorageMode(false);
    setIsSalespointMode(true);
    setEditRowId(null);
    // Запрашиваем только type=salespoint
    fetchLocations("salespoint");
  };

  // -----------------------------------------------
  // Добавление (POST /api/locations)
  // -----------------------------------------------
  const handleAddClick = async () => {
    if (!newRecordName.trim()) {
      addNotification("error", "", "Имя не может быть пустым");
      return;
    }

    let typeValue = "";
    if (isStorageMode) {
      typeValue = "storage";
    } else if (isSalespointMode) {
      typeValue = "salespoint";
    } else {
      addNotification("error", "", "Сначала выберите режим (Склад или Точка продаж)");
      return;
    }

    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newRecordName.trim(),
          address: "",
          type: typeValue,
        }),
      });
      if (!response.ok) {
        if (response.status === 409) {
          addNotification("warning", "", "Такая локация уже существует.");
        } else {
          throw new Error("Ошибка добавления записи");
        }
      } else {
        const data = await response.json();
        addNotification("success", "", "Локация успешно добавлена.");
        setNewRecordName("");
        // Обновим список
        fetchLocations(typeValue);
      }
    } catch (err) {
      console.error("Ошибка при добавлении:", err);
      addNotification("error", "", "Не удалось добавить запись. Попробуйте ещё раз.");
    }
  };

  // -----------------------------------------------
  // Редактирование: заходим в режим
  // -----------------------------------------------
  const handleEditClick = (id, currentName, currentAddr) => {
    setEditRowId(id);
    setEditName(currentName || "");
    setEditAddress(currentAddr || "");
  };

  const handleCancelClick = () => {
    setEditRowId(null);
    setEditName("");
    setEditAddress("");
  };

  // -----------------------------------------------
  // Сохранение (PUT /api/locations/:id)
  // -----------------------------------------------
  const handleSaveClick = async (id) => {
    const current = locations.find((loc) => loc.id === id);
    if (!current) return;

    const newName    = editName.trim();
    const newAddress = editAddress.trim();
    // type оставляем прежний, чтобы не менять склад -> точку
    // (Если хотите дать выбор, можно завести setEditType.)
    const oldType    = current.type;

    // Проверка изменений
    if (
      current.name === newName &&
      (current.address || "") === newAddress
    ) {
      addNotification("info", "", "Изменений не найдено");
      handleCancelClick();
      return;
    }

    try {
      const response = await fetch(`/api/locations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          address: newAddress,
          type: oldType, // оставим как было
        }),
      });
      if (!response.ok) {
        throw new Error("Ошибка при обновлении");
      }
      addNotification("success", "", "Локация успешно обновлена.");
      
      // Обновим список
      if (isStorageMode) {
        fetchLocations("storage");
      } else if (isSalespointMode) {
        fetchLocations("salespoint");
      }
      handleCancelClick();
    } catch (err) {
      console.error("Ошибка при обновлении:", err);
      addNotification("error", "", "Не удалось обновить запись.");
    }
  };

  // -----------------------------------------------
  // Удаление (DELETE /api/locations/:id)
  // -----------------------------------------------
  const handleDeleteClick = (id) => {
    const toDelete = locations.find((loc) => loc.id === id);
    setRowToDelete(toDelete);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!rowToDelete) return;

    try {
      const response = await fetch(`/api/locations/${rowToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Ошибка при удалении");
      }
      addNotification("success", "", "Запись успешно удалена.");
      setLocations((prev) => prev.filter((loc) => loc.id !== rowToDelete.id));
    } catch (err) {
      console.error("Ошибка удаления:", err);
      addNotification("error", "", "Не удалось удалить запись.");
    } finally {
      setIsModalOpen(false);
      setRowToDelete(null);
    }
  };

  // -----------------------------------------------
  // Сортировка (по name, id, address)
  // -----------------------------------------------
  const handleSort = (key) => {
    setSortConfig((prev) => {
      const newDirection =
        prev.key === key && prev.direction === "ascending"
          ? "descending"
          : "ascending";
      return { key, direction: newDirection };
    });
  };

  const sortedAndFiltered = useMemo(() => {
    let filtered = locations.filter((loc) =>
      loc.name.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [locations, searchTerm, sortConfig]);

  // -----------------------------------------------
  // Рендер
  // -----------------------------------------------
  return (
    <div style={{ alignItems: "center" }}>
      <h2>Склады и Точки продаж</h2>
      <div style={{ marginTop: 15, marginBottom: 10 }}>
        <button onClick={handleLoadStorages} className="pure-material-button-outlined">
          Склады
        </button>
        <button onClick={handleLoadSalespoints} className="pure-material-button-outlined">
          Точки продаж
        </button>
      </div>

      {/* Уведомления */}
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

      {/* Модальное окно подтверждения удаления */}
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
              placeholder="Поиск по имени"
              className="form-control"
              style={{
                width: "100%",
                paddingLeft: 40,
                // можно вставить svg иконку поиска...
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
                  position: "absolute", top: 127, right: 15,
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 16,
                  color: "black",
                }}
              >
                {/* иконка очистить */}
                <svg
                  viewBox="0 2 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: 25, height: 25 }}
                >
                  <rect width="24" height="24" />
                  <path d="M7 17L16.8995 7.10051" stroke="#595c5f" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 7.00001L16.8995 16.8995" stroke="#595c5f" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>

          {/* Добавление новой записи */}
          <div className="add-group-width">
            <input
              type="text"
              value={newRecordName}
              onChange={(e) => setNewRecordName(e.target.value)}
              placeholder={
                isStorageMode
                  ? "Добавить склад"
                  : isSalespointMode
                  ? "Добавить точку продаж"
                  : "Сначала нажмите одну из кнопок выше"
              }
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
                  position: "absolute", top: 175, right: 65,
                  transform: "translateY(-50%)",
                  background: "transparent", border: "none",
                  cursor: "pointer", fontSize: 16, color: "black",
                }}
              >
                {/* иконка очистить */}
                <svg
                  viewBox="0 2 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
                  style={{ width: 25, height: 25 }}
                >
                  <rect width="24" height="24" />
                  <path d="M7 17L16.8995 7.10051" stroke="#595c5f" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 7.00001L16.8995 16.8995" stroke="#595c5f" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <button
              className="btn-icon btn-success"
              onClick={handleAddClick}
              title="Добавить запись"
              style={{ paddingLeft: 15 }}
            >
              {/* галочка */}
              <svg
                width="25px" height="25px"
                viewBox="3.5 3 17 17"
                fill="none" xmlns="http://www.w3.org/2000/svg"
                stroke="#000000" strokeWidth="2.4"
              >
                <path
                  d="M5 13.3636L8.03559 16.3204C8.42388 16.6986 9.04279 16.6986 9.43108 16.3204L19 7"
                  stroke="#39bd00" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

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
                    Имя
                    {sortConfig.key === "name" &&
                      (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                  </th>
                  <th onClick={() => handleSort("address")}>
                    Адрес
                    {sortConfig.key === "address" &&
                      (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                  </th>
                  {/* <th>Тип</th> */}
                  <th />
                </tr>
              </thead>
              <tbody>
                {sortedAndFiltered.map((loc) => (
                  <tr key={loc.id}>
                    <td className="col-storage-code4">{loc.id}</td>
                    <td className="col-storage-name4">
                      {editRowId === loc.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="form-control"
                          style={{ height: 28 }}
                        />
                      ) : (
                        <span>{loc.name}</span>
                      )}
                    </td>
                    <td className="col-storage-address4">
                      {editRowId === loc.id ? (
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="form-control"
                          style={{ height: 28 }}
                        />
                      ) : (
                        <span>{loc.address}</span>
                      )}
                    </td>
                    {/* <td>
                      {loc.type === "storage"
                        ? "Склад"
                        : loc.type === "salespoint"
                        ? "Точка продаж"
                        : loc.type}
                    </td> */}
                    <td className="col-storage-actions4">
                      {editRowId === loc.id ? (
                        <>
                          <button
                            className="btn-icon btn-success"
                            onClick={() => handleSaveClick(loc.id)}
                          >
                            {/* галочка */}
                            <svg
                              width="25px" height="25px" viewBox="3.5 3 17 17"
                              fill="none" xmlns="http://www.w3.org/2000/svg"
                              stroke="#000000" strokeWidth="2.4"
                            >
                              <path
                                d="M5 13.3636L8.03559 16.3204C8.42388 16.6986 9.04279 16.6986 9.43108 16.3204L19 7"
                                stroke="#39bd00" strokeLinecap="round" strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          <button
                            className="btn-icon btn-warning"
                            onClick={handleCancelClick}
                          >
                            {/* стрелка назад */}
                            <svg
                              width="25px" height="25px"
                              viewBox="4.5 4.3 15 15"
                              fill="none" xmlns="http://www.w3.org/2000/svg"
                              stroke="#000000" strokeWidth="2.4"
                              transform="rotate(270)"
                            >
                              <path
                                d="M9.5 7L14.5 12L9.5 17"
                                stroke="#000000" strokeLinecap="round" strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          <button
                            className="btn-icon btn-danger"
                            onClick={() => handleDeleteClick(loc.id)}
                          >
                            {/* крестик */}
                            <svg
                              width="25px" height="25px"
                              viewBox="3 3 17 17"
                              fill="none" xmlns="http://www.w3.org/2000/svg"
                              stroke="#000000" strokeWidth="2.4"
                            >
                              <path
                                d="M7 17L16.8995 7.10051"
                                stroke="#ff0000" strokeLinecap="round" strokeLinejoin="round"
                              />
                              <path
                                d="M7 7.00001L16.8995 16.8995"
                                stroke="#ff0000" strokeLinecap="round" strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-icon btn-danger"
                            onClick={() => handleEditClick(loc.id, loc.name, loc.address)}
                          >
                            {/* иконка редактирования */}
                            <svg
                              width="25px" height="25px"
                              viewBox="3 3 18 18"
                              fill="none" xmlns="http://www.w3.org/2000/svg"
                              stroke="#000000" strokeWidth="1.6"
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

export default Locations;
