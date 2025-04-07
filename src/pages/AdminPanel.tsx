import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Import corect de la fișierul central
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminPanel: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    imageUrl: '',
    capacity: 0,
  });
  const [events, setEvents] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: 0,
    image: '',
    inStock: true,
  });
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [articles, setArticles] = useState<any[]>([]);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [articleData, setArticleData] = useState({
    title: '',
    date: new Date().toISOString().substr(0, 10),
    author: '',
    preview: '',
    content: '',
  });
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  const isAdmin = true;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const eventsRef = collection(db, 'events');
        const snapshot = await getDocs(eventsRef);
        const eventsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsList);
      } catch (err) {
        console.error('Eroare la încărcarea evenimentelor:', err);
        setError('A apărut o eroare la încărcarea evenimentelor.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef);
        const productsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsList);
      } catch (err) {
        console.error('Eroare la încărcarea produselor:', err);
        setError('A apărut o eroare la încărcarea produselor.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const articlesRef = collection(db, 'articles');
        const snapshot = await getDocs(articlesRef);
        const articlesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setArticles(articlesList);
      } catch (err) {
        console.error('Eroare la încărcarea articolelor:', err);
        setError('A apărut o eroare la încărcarea articolelor.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
    fetchProducts();
    fetchArticles();
  }, []);

  const handleAddEvent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const eventsRef = collection(db, 'events');
      const docRef = await addDoc(eventsRef, {
        ...eventData,
        createdAt: new Date().toISOString(),
        registeredUsers: [],
        category: 'custom',
      });
      setMessage(`Eveniment adăugat cu succes! ID: ${docRef.id}`);
    } catch (err: any) {
      console.error("Eroare la adăugarea evenimentului: ", err);
      setError(err.message || "A apărut o eroare la adăugarea evenimentului");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!currentUser) {
      setError('Trebuie să fii autentificat pentru a șterge un eveniment.');
      return;
    }

    if (!window.confirm('Ești sigur că vrei să ștergi acest eveniment?')) {
      return;
    }

    try {
      setIsLoading(true);
      await deleteDoc(doc(db, 'events', eventId));
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
      setMessage('Evenimentul a fost șters cu succes.');
    } catch (err: any) {
      console.error('Eroare la ștergerea evenimentului:', err);
      if (err.code === 'permission-denied') {
        setError('Nu ai permisiunea de a șterge acest eveniment.');
      } else {
        setError('A apărut o eroare la ștergerea evenimentului.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEvent = (event: any) => {
    setEventData({
      title: event.title || '',
      description: event.description || '',
      date: event.date || '',
      time: event.time || '',
      location: event.location || '',
      imageUrl: event.imageUrl || '',
      capacity: event.capacity || 0,
    });
    setEditingEventId(event.id);
    setShowEventForm(true);
    setShowProductForm(false);
    setShowArticleForm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateEvent = async () => {
    if (!editingEventId) return;

    setIsLoading(true);
    setError(null);
    try {
      const eventRef = doc(db, 'events', editingEventId);
      await updateDoc(eventRef, {
        ...eventData,
        updatedAt: new Date().toISOString(),
      });

      setEvents(events.map(event =>
        event.id === editingEventId ? { ...event, ...eventData } : event
      ));

      setMessage('Evenimentul a fost actualizat cu succes!');
      setEventData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        imageUrl: '',
        capacity: 0,
      });
      setEditingEventId(null);
      setShowEventForm(false);
    } catch (err: any) {
      console.error('Eroare la actualizarea evenimentului:', err);
      setError(err.message || 'A apărut o eroare la actualizarea evenimentului.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEventEdit = () => {
    setEventData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      imageUrl: '',
      capacity: 0,
    });
    setEditingEventId(null);
    setShowEventForm(false);
  };

  const handleEditProduct = (product: any) => {
    setProductData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      image: product.image || '',
      inStock: product.inStock !== undefined ? product.inStock : true,
    });
    setEditingProductId(product.id);
    setShowProductForm(true);
    setShowEventForm(false);
    setShowArticleForm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateProduct = async () => {
    if (!editingProductId) return;

    setIsLoading(true);
    setError(null);
    try {
      const productRef = doc(db, 'products', editingProductId);
      await updateDoc(productRef, {
        ...productData,
        updatedAt: new Date().toISOString()
      });
      
      setProducts(products.map(product => 
        product.id === editingProductId ? { ...product, ...productData } : product
      ));
      
      setMessage('Produsul a fost actualizat cu succes!');
      setProductData({ name: '', description: '', price: 0, image: '', inStock: true });
      setEditingProductId(null);
      setShowProductForm(false);
    } catch (err: any) {
      console.error('Eroare la actualizarea produsului:', err);
      setError(err.message || 'Nu ai permisiunea de a actualiza acest produs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProductData({ name: '', description: '', price: 0, image: '', inStock: true });
    setEditingProductId(null);
    setShowProductForm(false);
  };

  const handleEditArticle = (article: any) => {
    setArticleData({
      title: article.title || '',
      date: article.date || new Date().toISOString().substr(0, 10),
      author: article.author || '',
      preview: article.preview || '',
      content: article.content || '',
    });
    setEditingArticleId(article.id);
    setShowArticleForm(true);
    setShowEventForm(false);
    setShowProductForm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateArticle = async () => {
    if (!editingArticleId) return;

    setIsLoading(true);
    setError(null);
    try {
      const articleRef = doc(db, 'articles', editingArticleId);
      await updateDoc(articleRef, {
        ...articleData,
        updatedAt: new Date().toISOString(),
      });

      setArticles(articles.map(article =>
        article.id === editingArticleId ? { ...article, ...articleData } : article
      ));

      setMessage('Articolul a fost actualizat cu succes!');
      setArticleData({
        title: '',
        date: new Date().toISOString().substr(0, 10),
        author: '',
        preview: '',
        content: '',
      });
      setEditingArticleId(null);
      setShowArticleForm(false);
    } catch (err: any) {
      console.error('Eroare la actualizarea articolului:', err);
      setError(err.message || 'A apărut o eroare la actualizarea articolului.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelArticleEdit = () => {
    setArticleData({
      title: '',
      date: new Date().toISOString().substr(0, 10),
      author: '',
      preview: '',
      content: '',
    });
    setEditingArticleId(null);
    setShowArticleForm(false);
  };

  const handleAddArticle = async () => {
    if (!articleData.title.trim()) {
      setError("Titlul scrisorii este obligatoriu");
      return;
    }
    
    if (!articleData.content.trim()) {
      setError("Conținutul scrisorii este obligatoriu");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const safeArticleData = {
        title: articleData.title.trim(),
        date: articleData.date || new Date().toISOString().substr(0, 10),
        author: articleData.author.trim() || 'Autor necunoscut',
        preview: articleData.preview.trim() || articleData.content.substring(0, 100) + '...',
        content: articleData.content.trim(),
        createdAt: new Date().toISOString(),
      };
      
      console.log("Se adaugă articolul:", safeArticleData);
      
      const articlesRef = collection(db, 'articles');
      const docRef = await addDoc(articlesRef, safeArticleData);
      
      console.log("Articol adăugat cu ID:", docRef.id);
      
      const snapshot = await getDocs(articlesRef);
      const articlesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setArticles(articlesList);
      
      setMessage(`Articolul a fost adăugat cu succes! ID: ${docRef.id}`);
      setArticleData({
        title: '',
        date: new Date().toISOString().substr(0, 10),
        author: '',
        preview: '',
        content: '',
      });
      setShowArticleForm(false);
    } catch (err: any) {
      console.error('Eroare la adăugarea articolului:', err);
      setError(err.message || 'A apărut o eroare la adăugarea articolului. Verificați consola pentru detalii.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest articol?')) {
      return;
    }

    try {
      setIsLoading(true);
      await deleteDoc(doc(db, 'articles', articleId));
      setArticles((prevArticles) => prevArticles.filter((article) => article.id !== articleId));
      setMessage('Articolul a fost șters cu succes.');
    } catch (err: any) {
      console.error('Eroare la ștergerea articolului:', err);
      setError('A apărut o eroare la ștergerea articolului.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Se încarcă...</div>;
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Panou de Administrare</h1>

      {message && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={() => {
            setShowEventForm(!showEventForm);
            setShowProductForm(false);
            setShowArticleForm(false);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Adaugă Eveniment
        </button>
        <button
          onClick={() => {
            setShowProductForm(!showProductForm);
            setShowEventForm(false);
            setShowArticleForm(false);
          }}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Adaugă Produs
        </button>
        <button
          onClick={() => {
            setShowArticleForm(!showArticleForm);
            setShowEventForm(false);
            setShowProductForm(false);
          }}
          className="px-6 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
        >
          Adaugă Scrisoare
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4">Lista Evenimentelor</h2>
      {isLoading ? (
        <div className="text-center">Se încarcă evenimentele...</div>
      ) : events.length === 0 ? (
        <div className="text-center text-gray-600">Nu există evenimente disponibile.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{event.description}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditEvent(event)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Editează
                </button>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Șterge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <hr className="my-6 border-t-2 border-gray-300" />

      {showEventForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {editingEventId ? 'Editează Eveniment' : 'Creare Eveniment Nou'}
          </h2>
          <p className="mb-6 text-gray-600">
            Completează formularul de mai jos pentru a {editingEventId ? 'edita' : 'crea'} un eveniment.
          </p>
          
          <form className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Titlu Eveniment</label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Ex: Workshop de dezvoltare personală"
                value={eventData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">Descriere</label>
              <textarea
                id="description"
                name="description"
                placeholder="Descrierea detaliată a evenimentului..."
                value={eventData.description}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-gray-700 font-medium mb-2">Data</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={eventData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="time" className="block text-gray-700 font-medium mb-2">Ora</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={eventData.time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-gray-700 font-medium mb-2">Locație</label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="Ex: Centrul Cultural, București"
                value={eventData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="imageUrl" className="block text-gray-700 font-medium mb-2">URL Imagine</label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                placeholder="Ex: /images/eveniment.jpg"
                value={eventData.imageUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="capacity" className="block text-gray-700 font-medium mb-2">Capacitate (nr. de participanți)</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                min="1"
                value={eventData.capacity}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 bg-white text-gray-900 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </form>
          
          <div className="flex space-x-4 mt-6">
            <button
              onClick={editingEventId ? handleUpdateEvent : handleAddEvent}
              disabled={isLoading}
              className="flex-1 py-3 bg-blue-600 text-white text-lg font-bold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Se procesează...' : editingEventId ? 'Actualizează Eveniment' : 'Creează Eveniment'}
            </button>
            {editingEventId && (
              <button
                onClick={handleCancelEventEdit}
                className="px-6 py-3 bg-gray-300 text-gray-800 text-lg font-bold rounded-md hover:bg-gray-400 transition-colors"
              >
                Anulează
              </button>
            )}
          </div>
        </div>
      )}

      {showProductForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {editingProductId ? 'Editează Produs' : 'Adaugă Produs Nou'}
          </h2>
          <p className="mb-6 text-gray-600">
            Completează formularul de mai jos pentru a {editingProductId ? 'edita' : 'adăuga'} un produs.
          </p>
          
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Nume Produs</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Ex: Miere de Munte"
                value={productData.name}
                onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">Descriere</label>
              <textarea
                id="description"
                name="description"
                placeholder="Descrierea detaliată a produsului..."
                value={productData.description}
                onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="price" className="block text-gray-700 font-medium mb-2">Preț</label>
              <input
                type="number"
                id="price"
                name="price"
                placeholder="Ex: 50"
                value={productData.price}
                onChange={(e) => setProductData({ ...productData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="image" className="block text-gray-700 font-medium mb-2">URL Imagine</label>
              <input
                type="text"
                id="image"
                name="image"
                placeholder="Ex: /images/product.jpg"
                value={productData.image}
                onChange={(e) => setProductData({ ...productData, image: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="inStock" className="block text-gray-700 font-medium mb-2">În Stoc</label>
              <select
                id="inStock"
                name="inStock"
                value={productData.inStock ? 'true' : 'false'}
                onChange={(e) => setProductData({ ...productData, inStock: e.target.value === 'true' })}
                className="w-full px-4 py-3 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="true">Da</option>
                <option value="false">Nu</option>
              </select>
            </div>
          </form>
          
          <div className="flex space-x-4 mt-6">
            <button
              onClick={editingProductId ? handleUpdateProduct : async () => {
                setIsLoading(true);
                setError(null);
                try {
                  const productsRef = collection(db, 'products');
                  await addDoc(productsRef, { ...productData, createdAt: new Date().toISOString() });
                  setMessage('Produsul a fost adăugat cu succes!');
                  setProductData({ name: '', description: '', price: 0, image: '', inStock: true });
                  setShowProductForm(false);
                } catch (err: any) {
                  console.error('Eroare la adăugarea produsului:', err);
                  setError(err.message || 'A apărut o eroare la adăugarea produsului.');
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
              className="flex-1 py-3 bg-blue-600 text-white text-lg font-bold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Se procesează...' : editingProductId ? 'Actualizează Produs' : 'Adaugă Produs'}
            </button>
            
            {editingProductId && (
              <button
                onClick={handleCancelEdit}
                className="px-6 py-3 bg-gray-300 text-gray-800 text-lg font-bold rounded-md hover:bg-gray-400 transition-colors"
              >
                Anulează
              </button>
            )}
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Lista Produselor</h2>
      {isLoading ? (
        <div className="text-center">Se încarcă produsele...</div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-600">Nu există produse disponibile.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 border-b text-left">Imagine</th>
                <th className="py-3 px-4 border-b text-left">Nume</th>
                <th className="py-3 px-4 border-b text-left">Preț</th>
                <th className="py-3 px-4 border-b text-left">Stoc</th>
                <th className="py-3 px-4 border-b text-left">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b">
                    <img
                      src={product.image || '/images/default-product.jpg'}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="py-3 px-4 border-b">{product.name}</td>
                  <td className="py-3 px-4 border-b">{product.price.toFixed(2)} lei</td>
                  <td className="py-3 px-4 border-b">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.inStock ? 'În Stoc' : 'Indisponibil'}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      Editează
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm('Ești sigur că vrei să ștergi acest produs?')) {
                          try {
                            await deleteDoc(doc(db, 'products', product.id));
                            setProducts(products.filter(p => p.id !== product.id));
                            setMessage('Produsul a fost șters cu succes!');
                          } catch (err: any) {
                            console.error('Eroare la ștergerea produsului:', err);
                            setError('Nu ai permisiunea de a șterge acest produs.');
                          }
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Șterge
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showArticleForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {editingArticleId ? 'Editează Scrisoarea' : 'Adaugă Scrisoare Nouă'}
          </h2>
          <p className="mb-6 text-gray-600">
            Completează formularul de mai jos pentru a {editingArticleId ? 'edita' : 'adăuga'} o scrisoare pentru utilizatori.
          </p>
          
          <form className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Titlul Scrisorii</label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Ex: Importanța sănătății mentale în era digitală"
                value={articleData.title}
                onChange={(e) => setArticleData({ ...articleData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-gray-700 font-medium mb-2">Data</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={articleData.date}
                  onChange={(e) => setArticleData({ ...articleData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="author" className="block text-gray-700 font-medium mb-2">Autor</label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  placeholder="Ex: Dr. Ana Popescu"
                  value={articleData.author}
                  onChange={(e) => setArticleData({ ...articleData, author: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="preview" className="block text-gray-700 font-medium mb-2">Previzualizare (scurtă descriere)</label>
              <input
                type="text"
                id="preview"
                name="preview"
                placeholder="O scurtă descriere care va apărea în lista de scrisori..."
                value={articleData.preview}
                onChange={(e) => setArticleData({ ...articleData, preview: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-gray-700 font-medium mb-2">Conținutul Scrisorii</label>
              <textarea
                id="content"
                name="content"
                placeholder="Conținutul complet al scrisorii..."
                value={articleData.content}
                onChange={(e) => setArticleData({ ...articleData, content: e.target.value })}
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 bg-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-2">
                Poți folosi sintaxa Markdown pentru formatare. De exemplu, **text** pentru bold, *text* pentru italic.
              </p>
            </div>
          </form>
          
          <div className="flex space-x-4 mt-6">
            <button
              onClick={editingArticleId ? handleUpdateArticle : handleAddArticle}
              disabled={isLoading}
              className="flex-1 py-3 bg-blue-600 text-white text-lg font-bold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Se procesează...' : editingArticleId ? 'Actualizează Scrisoarea' : 'Adaugă Scrisoarea'}
            </button>
            
            {editingArticleId && (
              <button
                onClick={handleCancelArticleEdit}
                className="px-6 py-3 bg-gray-300 text-gray-800 text-lg font-bold rounded-md hover:bg-gray-400 transition-colors"
              >
                Anulează
              </button>
            )}
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4 mt-8">Lista Scrisorilor</h2>
      {isLoading ? (
        <div className="text-center">Se încarcă scrisorile...</div>
      ) : articles.length === 0 ? (
        <div className="text-center text-gray-600">Nu există scrisori disponibile.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 border-b text-left">Titlu</th>
                <th className="py-3 px-4 border-b text-left">Autor</th>
                <th className="py-3 px-4 border-b text-left">Data</th>
                <th className="py-3 px-4 border-b text-left">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b">{article.title}</td>
                  <td className="py-3 px-4 border-b">{article.author}</td>
                  <td className="py-3 px-4 border-b">{article.date}</td>
                  <td className="py-3 px-4 border-b">
                    <button
                      onClick={() => handleEditArticle(article)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      Editează
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(article.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Șterge
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
