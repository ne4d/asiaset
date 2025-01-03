import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ItemDetails() {
  const { id } = useParams(); // Получаем id из URL
  const [item, setItem] = useState(null); // Состояние для данных товара
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [error, setError] = useState(null); // Состояние для ошибок

  // Поля для редактирования
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    // Загрузка данных о товаре
    const fetchItemDetails = async () => {
      try {
        const response = await fetch(`/api/nomenklatura/details/${id}`);
        if (response.status === 404) {
          // Если данные отсутствуют, создаем пустой объект для редактирования
          setItem(null);
        } else if (!response.ok) {
          throw new Error('Ошибка загрузки данных');
        } else {
          const data = await response.json();
          setItem(data);
          setDescription(data.description || ''); // Устанавливаем описание
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id]);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('description', description);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const response = await fetch(`/api/nomenklatura/details/${id}/update`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка сохранения данных');
      }

      const data = await response.json();
      setItem(data); // Обновляем данные после сохранения
      alert('Данные успешно сохранены!');
    } catch (err) {
      alert('Ошибка при сохранении данных: ' + err.message);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Ошибка: {error}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', margin: '20px' }}>
      {/* Бокс для изображения */}
      <div style={{ width: '50%', textAlign: 'center' }}>
        <h3>Изображение</h3>
        {item?.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            style={{ maxWidth: '100%', maxHeight: '300px', border: '1px solid #ccc' }}
          />
        ) : (
          <>
            <p>Добавьте изображение</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              style={{ marginTop: '10px' }}
            />
          </>
        )}
      </div>

      {/* Поле для описания */}
      <div style={{ width: '50%' }}>
        <h3>Описание</h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Введите описание товара"
          style={{
            width: '100%',
            height: '200px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        <button
          onClick={handleSave}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}

export default ItemDetails;
