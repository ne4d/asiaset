import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import '../css/materialoutlinedbutton.css';
import '../css/cssonlyresponcivetables_v2.css';
import '../css/notifications.css';
import '../css/overItems.css';
import '../css/threedotsloading.css';

//
// Компонент уведомления
//
function Notification({ type, title, message, onClose }) {
  return (
    <div className={`notification notification-${type}`}>
      <button className="notification-close" onClick={onClose} />
      <div className="notification-title">{title}</div>
      <div className="notification-message">{message}</div>
    </div>
  );
}

//
// Модальное окно подтверждения удаления
//
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
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 0 }}>
          <thead>
            <tr>
              <th
                colSpan="2"
                style={{
                  padding: "10px",
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

//
// Основной компонент для отображения списка документов
//
function DocumentList() {
  // Состояние для документов
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Фильтр по типу документа (например, income, sale, write_off и т.д.)
  const [docTypeFilter, setDocTypeFilter] = useState("income"); // по умолчанию "Поставка"

  // Состояния для редактирования и добавления
  const [editRowId, setEditRowId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [newDocumentName, setNewDocumentName] = useState("");

  // Уведомления
  const [notifications, setNotifications] = useState([]);
  const [notificationQueue, setNotificationQueue] = useState([]);
  const MAX_NOTIFICATIONS = 3;

  // Поиск и сортировка
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "ascending" });

  // Модальное окно для удаления
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [isTableNotEmpty, setIsTableNotEmpty] = useState(false);

  // Массив типов документов
  const documentTypes = [
    { type: "income", label: "Поставка" },
    { type: "sale", label: "Продажа" },
    { type: "write_off", label: "Списание" },
    { type: "transfer", label: "Перемещение" },
    { type: "customer_return", label: "Возврат от клиента" },
    { type: "supplier_return", label: "Возврат поставщику" },
    { type: "adjustment_in", label: "Корректировка прихода" },
    { type: "adjustment_out", label: "Корректировка расхода" },
  ];

  // Функция загрузки документов через API с фильтром по типу
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/documents?type=${docTypeFilter}`);
      if (!response.ok) {
        throw new Error("Ошибка загрузки данных");
      }
      const data = await response.json();
      setIsTableNotEmpty(Array.isArray(data) && data.length > 0);
      setDocuments(data || []);
    } catch (err) {
      setError(err.message);
      setIsTableNotEmpty(false);
      addNotification("error", "", "База данных недоступна");
    } finally {
      setLoading(false);
    }
  };

  // Загружаем документы при изменении выбранного типа
  useEffect(() => {
    fetchDocuments();
  }, [docTypeFilter]);

  // Функции уведомлений
  const addNotification = (type, title, message) => {
    const id = Date.now();
    if (notifications.length < MAX_NOTIFICATIONS) {
      setNotifications(prev => [...prev, { id, type, title, message }]);
      setTimeout(() => removeNotification(id), 3000);
    } else {
      setNotificationQueue(prev => [...prev, { id, type, title, message }]);
    }
  };

  const removeNotification = id => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    if (notifications.length < MAX_NOTIFICATIONS && notificationQueue.length > 0) {
      const [nextNotification, ...restQueue] = notificationQueue;
      setNotificationQueue(restQueue);
      setNotifications(prev => [...prev, nextNotification]);
      setTimeout(() => removeNotification(nextNotification.id), 3000);
    }
  }, [notifications, notificationQueue]);

  // Функция добавления нового документа
  const handleAddClick = async () => {
    if (!newDocumentName.trim()) {
      addNotification("error", "", "Название документа не может быть пустым");
      return;
    }
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDocumentName,
          doc_type: docTypeFilter,
          // можно добавить дополнительные поля, например дату, номер документа и т.д.
        }),
      });
      if (!response.ok) {
        if (response.status === 409) {
          addNotification("warning", "", "Документ с таким именем уже существует.");
        } else {
          throw new Error("Ошибка добавления записи");
        }
      } else {
        const data = await response.json();
        addNotification("success", "", "Документ успешно добавлен.");
        setNewDocumentName("");
        fetchDocuments();
      }
    } catch (err) {
      console.error("Ошибка при добавлении записи:", err);
      addNotification("error", "", "Не удалось добавить запись. Попробуйте ещё раз.");
    }
  };

  // Редактирование: переход в режим редактирования
  const handleEditClick = (id, currentName) => {
    setEditRowId(id);
    setEditValue(currentName);
  };

  const handleCancelClick = () => {
    setEditRowId(null);
    setEditValue("");
  };

  // Сохранение изменений
  const handleSaveClick = async (id) => {
    const current = documents.find(doc => doc.id === id);
    if (!current) return;
    if (current.name === editValue.trim()) {
      addNotification("info", "", "Изменений не найдено.");
      handleCancelClick();
      return;
    }
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editValue.trim(),
          doc_type: docTypeFilter,
          // можно передать дополнительные поля
        }),
      });
      if (!response.ok) {
        throw new Error("Ошибка при обновлении");
      }
      addNotification("success", "", "Документ успешно обновлён.");
      fetchDocuments();
      handleCancelClick();
    } catch (err) {
      console.error("Ошибка при обновлении:", err);
      addNotification("error", "", "Не удалось обновить запись. Попробуйте ещё раз.");
    }
  };

  // Удаление
  const handleDeleteClick = (id) => {
    const item = documents.find(doc => doc.id === id);
    setRowToDelete(item);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!rowToDelete) return;
    try {
      const response = await fetch(`/api/documents/${rowToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Ошибка при удалении");
      }
      addNotification("success", "", "Документ успешно удалён.");
      fetchDocuments();
    } catch (err) {
      console.error("Ошибка удаления:", err);
      addNotification("error", "", "Не удалось удалить запись. Попробуйте ещё раз.");
    } finally {
      setIsModalOpen(false);
      setRowToDelete(null);
    }
  };

  // Сортировка и фильтрация документов
  const sortedAndFilteredDocuments = useMemo(() => {
  let filtered = documents.filter(doc =>
    (doc.name || "").toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  if (!sortConfig.key) return filtered;

  filtered.sort((a, b) => {
    const aVal = a[sortConfig.key] || "";
    const bVal = b[sortConfig.key] || "";
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortConfig.direction === "ascending" ? aVal - bVal : bVal - aVal;
    } else {
      return sortConfig.direction === "ascending"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    }
  });

  return filtered;
}, [documents, searchTerm, sortConfig]);

const handleSort = (key) => {
  setSortConfig(prev => {
    const newDir = (prev.key === key && prev.direction === "ascending") ? "descending" : "ascending";
    return { key, direction: newDir };
  });
};



  return (
    <div style={{ alignItems: "center" }}>
      <h2>Список документов: {documentTypes.find(dt => dt.type === docTypeFilter)?.label}</h2>
      <div style={{ marginTop: 15, marginBottom: 10 }}>
        {documentTypes.map(dt => (
          <button
            key={dt.type}
            className="pure-material-button-outlined"
            onClick={() => setDocTypeFilter(dt.type)}
            style={{ marginRight: 10 }}
          >
            {dt.label}
          </button>
        ))}
      </div>

      <div id="notification-container">
        {notifications.map(n => (
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

      {/* Форма поиска */}
      <div className="add-group-width" style={{ marginBottom: 15 }}>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Поиск по имени документа"
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
              top: 127,
              right: 15,
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              color: "black",
            }}
          >
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

      {/* Форма для добавления нового документа */}
      <div className="add-group-width" style={{ marginBottom: 20, position: "relative" }}>
        <input
          type="text"
          value={newDocumentName}
          onChange={e => setNewDocumentName(e.target.value)}
          placeholder="Добавить документ"
          className="form-control"
          style={{ width: "100%", paddingRight: 40 }}
        />
        {newDocumentName && (
          <button
            onClick={() => setNewDocumentName("")}
            style={{
              position: "absolute",
              top: 175,
              right: 65,
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              color: "black",
            }}
          >
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

      {loading ? (
        <div className="snippet" data-title="dot-spin">
          <div className="stage">
            <div className="dot-spin"></div>
          </div>
        </div>
      ) : (
        <div className="table-container">
          {!isTableNotEmpty ? (
            <center><p>Данных пока нет</p></center>
          ) : (
            <table className="rtable">
              <thead>
                <tr>
                  <th onClick={() => handleSort("id")}>
                    Код {sortConfig.key === "id" && (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                  </th>
                  <th onClick={() => handleSort("name")}>
                    Имя документа {sortConfig.key === "name" && (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                  </th>
                  {/* Можно добавить дополнительные заголовки для других полей */}
                  <th onClick={() => handleSort("doc_date")}>
                    Дата {sortConfig.key === "doc_date" && (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                  </th>
                  <th onClick={() => handleSort("doc_type")}>
                    Тип {sortConfig.key === "doc_type" && (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
                  </th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredDocuments.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>
                      {editRowId === item.id ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="form-control"
                          style={{ height: 28 }}
                        />
                      ) : (
                        <Link
                          to={`/document/${item.id}`}
                          style={{
                            cursor: "pointer",
                            fontSize: "20px",
                            color: "black",
                            textDecoration: "none",
                          }}
                        >
                          <span className="fnt">{item.name}</span>
                        </Link>
                      )}
                    </td>
                    {/* Дополнительные столбцы – например, дата, тип и т.д. */}
                    <td>
                      {/* Здесь можно вывести дату или другое поле */}
                      <span>{item.doc_date || "-"}</span>
                    </td>
                    <td>
                      <span>
                        {item.doc_type === "income" ? "Поставка" :
                         item.doc_type === "sale" ? "Продажа" :
                         item.doc_type === "write_off" ? "Списание" :
                         item.doc_type === "transfer" ? "Перемещение" :
                         item.doc_type === "customer_return" ? "Возврат от клиента" :
                         item.doc_type === "supplier_return" ? "Возврат поставщику" :
                         item.doc_type === "adjustment_in" ? "Корректировка прихода" :
                         item.doc_type === "adjustment_out" ? "Корректировка расхода" :
                         "не указано"}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {editRowId === item.id ? (
                        <>
                          <button className="btn-icon btn-success" onClick={() => handleSaveClick(item.id)}>
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
                          <button className="btn-icon btn-warning" onClick={handleCancelClick}>
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
                          <button className="btn-icon btn-danger" onClick={() => handleDeleteClick(item.id)}>
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
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => handleEditClick(item.id, item.name)}
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
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default DocumentList;
