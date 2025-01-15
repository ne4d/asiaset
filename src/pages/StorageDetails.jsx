import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function StorageDetails() {
  const { id } = useParams();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(`/api/inventory/${id}`);
        if (!response.ok) {
          throw new Error('Ошибка загрузки остатков');
        }
        const data = await response.json();
        setInventory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [id]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'red' }}>Ошибка: {error}</div>;

  return (
    <div style={{ margin: '20px' }}>
      <h2>Остатки на складе {id}</h2>
      <table className="rtable">
        <thead>
          <tr>
            <th>Товар</th>
            <th>Единицы измерения</th>
            <th>Количество</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.product_id}>
              <td>{item.product_name}</td>
              <td>{item.measurement}</td>
              <td>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StorageDetails;
