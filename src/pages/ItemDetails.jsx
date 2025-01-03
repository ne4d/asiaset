import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ItemDetails() {
  const { id } = useParams(); // Получаем id из URL
  const [item, setItem] = useState(null); // Состояние для данных товара
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [error, setError] = useState(null); // Состояние для ошибок

  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const MAX_FILE_SIZE_MB = 10; // Максимальный размер файла в MB

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const response = await fetch(`/api/nomenklatura/details/${id}`);
        if (!response.ok) {
          throw new Error('Ошибка загрузки данных');
        }
        const data = await response.json();
        setItem(data);
        setDescription(data.description || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        alert(`Размер файла не должен превышать ${MAX_FILE_SIZE_MB} MB.`);
        e.target.value = null;
        return;
      }
      setImageFile(file);
    }
  };

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
      setItem(data);
      alert('Данные успешно сохранены!');
    } catch (err) {
      alert(`Ошибка при сохранении данных: ${err.message}`);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Ошибка: {error}</div>;
  }

  return (
    <div style={{ display: 'flex', gap: '20px', margin: '20px' }}>
      <div style={{ width: '50%', textAlign: 'center' }}>
        <h3>Изображение</h3>
        {item?.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            style={{ maxWidth: '100%', maxHeight: '300px', border: '1px solid #ccc' }}
          />
        ) : (
          <p>Добавьте изображение</p>
        )}
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      <div style={{ width: '50%' }}>
        <h3>Описание</h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: '100%',
            height: '200px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
          placeholder="Введите описание товара"
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
