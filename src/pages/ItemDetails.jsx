import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Функция сжатия изображения
const compressImage = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxSize = 1024; // Максимальный размер для сжатия
                let width = img.width;
                let height = img.height;

                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height *= maxSize / width;
                        width = maxSize;
                    } else {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
            };
            img.onerror = () => reject(new Error('Ошибка загрузки изображения'));
            img.src = event.target.result;
        };
        reader.onerror = () => reject(new Error('Ошибка чтения файла'));
        reader.readAsDataURL(file);
    });
};

function ItemDetails() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);

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

    const handleImageUpload = async () => {
        if (!imageFile) {
            alert('Выберите изображение перед загрузкой');
            return;
        }

        try {
            let fileToUpload = imageFile;

            // Сжимаем изображение, если оно больше 1 MB
            if (imageFile.size > 1 * 1024 * 1024) {
                fileToUpload = await compressImage(imageFile);
            }

            const formData = new FormData();
            formData.append('image', fileToUpload);

            const response = await fetch(`/api/nomenklatura/details/${id}/update-image`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Ошибка загрузки изображения');
            }

            const data = await response.json();
            setItem((prevItem) => ({ ...prevItem, image_url: data.image_url }));
            alert('Изображение успешно загружено!');
        } catch (err) {
            alert(`Ошибка при загрузке изображения: ${err.message}`);
        }
    };

    const handleDescriptionUpdate = async () => {
        try {
            const response = await fetch(`/api/nomenklatura/details/${id}/update-description`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description }),
            });

            if (!response.ok) {
                throw new Error('Ошибка обновления описания');
            }

            alert('Описание успешно обновлено!');
        } catch (err) {
            alert(`Ошибка при обновлении описания: ${err.message}`);
        }
    };

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>Ошибка: {error}</div>;
    }

    return (
        // <div style={{ display: 'flex', gap: '20px', margin: '20px' }}>
        // <div style={{ gap: '20px', margin: '20px' }}>
        <div style={{ display: 'grid', margin: '20px' }}>
            {/* Блок управления изображением */}
            <div style={{ textAlign: 'center', border: '1px solid #ccc', padding: '20px' }}>
                {/* <h3>Изображение</h3> */}
                {item?.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        style={{ maxWidth: '100%', maxHeight: '300px' }}
                    />
                ) : (
                    <div style={{ fontSize: '16px', color: '#aaa' }}>NO IMAGE</div>
                )} 
            {/* <div style={{ gap: '20px', margin: '20px' }}> */}
            <div style={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'space-evenly', backgroundColor: 'black'}}>
                {/* Иконка для выбора файла */}
                <label style={{ cursor: 'pointer' }}>
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ width: '40px', height: '40px' }}
                    >
                        <g id="SVGRepo_iconCarrier">
                            <rect width="24" height="24"></rect>
                            <path
                                d="M4 9V6.47214C4 6.16165 4.07229 5.85542 4.21115 5.57771L5 4H10L11 6H21C21.5523 6 22 6.44772 22 7V9V18C22 19.1046 21.1046 20 20 20H18"
                                // stroke="#000000"
                                stroke="#ffffff"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            ></path>
                            <path
                                d="M17.2362 9H2.30925C1.64988 9 1.17099 9.62698 1.34449 10.2631L3.59806 18.5262C3.83537 19.3964 4.62569 20 5.52759 20H19.6908C20.3501 20 20.829 19.373 20.6555 18.7369L18.201 9.73688C18.0823 9.30182 17.6872 9 17.2362 9Z"
                                // stroke="#000000"
                                stroke="#ffffff"
                            ></path>
                        </g>
                    </svg>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        style={{ display: 'none' }}
                    />
                </label>

                {/* Иконка для загрузки файла */}
                <svg
                    onClick={handleImageUpload}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        width: '40px',
                        height: '40px',
                        cursor: 'pointer',
                        //   backgroundColor: '#4CAF50',
                        borderRadius: '50%',
                        padding: '5px',
                    }}
                >
                    <g id="SVGRepo_iconCarrier">
                        <rect width="24" height="24"></rect>
                        <path
                            d="M5 12V18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V12"
                            // stroke="#000000"
                            stroke="#ffffff"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        ></path>
                        <path
                            d="M12 3L12 15M12 15L16 11M12 15L8 11"
                            // stroke="#000000"
                            stroke="#ffffff"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        ></path>
                    </g>
                </svg>
            </div></div>


            {/* Блок управления описанием */}
            <div style={{ marginTop: '10px' }}>
                {/* <h3>Описание</h3> */}
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
                    onClick={handleDescriptionUpdate}
                    style={{
                        marginTop: '10px',
                        // marginRight: '0px',
                        padding: '10px 20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Обновить
                </button>
            </div>
        </div>
    );
}

export default ItemDetails;
