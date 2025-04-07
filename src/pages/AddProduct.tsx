import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

const AddProduct: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);

  const addDulceataProduct = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const productsRef = collection(db, 'products');
      
      const productData = {
        name: "Dulceață de Afine",
        description: "Imaginează-ți un borcan mic, dar plin de poveste, care te duce direct în copilăria la țară – amintirea dimineților leneșe, când gustul dulce-acrișor al afinelor tocite se împletea cu soarele blând de vară. Dulceața noastră de afine, preparată după o rețetă tradițională, este rezultatul muncii pasionate: afine culese manual, fierbere lentă și dragoste pentru detalii. Fără conservanți, 100% natural, cu un gust intens care îți aduce aminte de zilele când totul era mai simplu și autentic.",
        price: 20,
        image: "/images/AdobeStock_370191089.jpeg",
        inStock: true,
        details: "Cantitate: Borcan de 250g\nIngrediente: Afine proaspete, zahăr natural, un strop de lămâie (pentru aciditate echilibrată)\nProducție: Handmade, local, cu grijă pentru tradiție\nBeneficii: Fără aditivi, gust natural și autentic",
        story: "Afinele sunt culese manual de pe versanții montani, iar procesul de fierbere lentă păstrează savoarea și amintirile unei veri din copilărie. Fiecare borcan este o călătorie în timp, o sărbătoare a gustului autentic.",
        ingredients: ["Afine proaspete", "Zahăr natural", "Un strop de lămâie"],
        weight: "250g",
        createdAt: new Date().toISOString()
      };
      
      const secondProductData = {
        name: "Miere de Munte",
        description: "Miere pură de munte, culeasă din flora zonelor montane protejate. Gustul delicat și parfumat, cu note subtile de flori sălbatice și ierburi alpine, este rezultatul unei strânse colaborări cu apicultorii din zonele montane. Mierea noastră păstrează toate proprietățile naturale benefice pentru sănătate.",
        price: 30,
        image: "/images/AdobeStock_367103665.jpeg",
        inStock: true,
        details: "Cantitate: Borcan de 350g\nVarietate: Miere polifloră de munte\nProducție: Apiarii tradiționale din zone montane nepoluate\nBeneficii: Neprelucrată termic, păstrează toate enzimele și proprietățile naturale",
        story: "Această miere reprezintă esența munților noștri: pură, autentică, sălbatică. Este rezultatul pasiunii apicultorilor locali și a unei naturi încă nepoluate, care oferă nectarul cel mai pur.",
        ingredients: ["Miere de albine 100% naturală"],
        weight: "350g",
        createdAt: new Date().toISOString()
      };
      
      await addDoc(productsRef, productData);
      const docRef = await addDoc(productsRef, secondProductData);
      
      setProductId(docRef.id);
      setSuccess(true);
      console.log("Produse adăugate cu succes!");
    } catch (err: any) {
      console.error("Eroare la adăugarea produselor:", err);
      setError(err.message || "A apărut o eroare la adăugarea produselor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Adaugă Produs Dulceață de Afine</h1>
      
      {!success ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="mb-4">
            Acest buton va adăuga produsul "Dulceață de Afine" direct în baza de date Firestore.
          </p>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Detalii produs:</h2>
            <p><strong>Nume:</strong> Dulceață de Afine</p>
            <p><strong>Preț:</strong> 20 lei</p>
            <p className="mt-2 whitespace-pre-line">
              <strong>Descriere:</strong> Dulceața noastră de afine, preparată după o rețetă tradițională, este rezultatul muncii pasionate: afine culese manual, fierbere lentă și dragoste pentru detalii.
            </p>
            <p><strong>Imagine:</strong> /images/AdobeStock_370191089.jpeg</p>
            <p><strong>În stoc:</strong> Da</p>
          </div>
          
          <button
            onClick={addDulceataProduct}
            disabled={isLoading}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Se procesează..." : "Adaugă Produsul în Firestore"}
          </button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="p-3 bg-green-100 text-green-700 rounded-md mb-4">
            Produsul a fost adăugat cu succes! ID: {productId}
          </div>
          
          <p className="mb-4">
            Acum poți vizualiza produsul în lista de produse.
          </p>
          
          <div className="flex space-x-4">
            <Link 
              to="/products" 
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Vezi toate produsele
            </Link>
            
            {productId && (
              <Link 
                to={`/product/${productId}`} 
                className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Vezi acest produs
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;
