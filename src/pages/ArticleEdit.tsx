import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase";
import { useAuth } from "../contexts";
import { FaImage, FaSave, FaTimes, FaPlus, FaTags, FaTag, FaCheck, FaEye, FaEyeSlash, FaTrash, FaExchangeAlt } from "react-icons/fa";

// Enhanced interface to represent an article
interface Article {
  id?: string;
  title: string;
  content: string;
  author: string;
  imageUrl?: string;
  published: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  tags?: string[];
  slug?: string;
  preview?: string;
  readCount?: number;
  readBy?: string[];
  feedback?: ArticleFeedback[];
  date?: string;
  galleryImages?: string[]; // Add support for multiple images
  coverStyle?: string; // Add styling options
}

// Interface for article feedback
interface ArticleFeedback {
  userId: string;
  userName: string;
  comment: string;
  rating: number;
  createdAt: Timestamp;
}

const ArticleEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: _user } = useAuth();
  const isNewArticle = !id;

  const [article, setArticle] = useState<Partial<Article>>({
    title: "",
    content: "",
    author: "",
    imageUrl: "",
    published: true,
    tags: [],
    preview: "",
    readCount: 0,
    readBy: [],
    feedback: [],
    galleryImages: [],
    coverStyle: "standard" // Default style
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [generatePreview, setGeneratePreview] = useState(true);
  
  // New states for enhanced image management
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [showGalleryUpload, setShowGalleryUpload] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      // Don't fetch if creating a new article
      if (isNewArticle) {
        setLoading(false);
        return;
      }
      
      try {
        if (!id) {
          setError("ID-ul articolului lipsește.");
          return;
        }

        const docRef = doc(db, "articles", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const articleData = docSnap.data() as Article;
          setArticle({
            id,
            ...articleData
          });
          
          // Set image preview if there's an existing image
          if (articleData.imageUrl) {
            setImagePreview(articleData.imageUrl);
          }
          
          // Set gallery previews if they exist
          if (articleData.galleryImages && articleData.galleryImages.length > 0) {
            setGalleryPreviews(articleData.galleryImages);
          }
        } else {
          setError("Articolul nu a fost găsit.");
        }
      } catch (err) {
        console.error("Eroare la încărcarea articolului:", err);
        setError("A apărut o eroare la încărcarea articolului.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, isNewArticle]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setArticle((prev) => {
      // When content changes and generatePreview is true, auto-generate preview
      if (name === "content" && generatePreview) {
        const previewText = value.substring(0, 150) + (value.length > 150 ? "..." : "");
        return { ...prev, [name]: value, preview: previewText };
      }
      
      // For preview field, turn off auto-generation if manually edited
      if (name === "preview") {
        setGeneratePreview(false);
        return { ...prev, [name]: value };
      }
      
      return { ...prev, [name]: value };
    });
  };

  const handleTogglePublished = () => {
    setArticle((prev) => ({ ...prev, published: !prev.published }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !article.tags?.includes(tagInput.trim())) {
      setArticle((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setArticle((prev) => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a temporary URL for preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Handle gallery image selection
  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setGalleryFiles([...galleryFiles, ...files]);
      
      // Create temporary URLs for preview
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setGalleryPreviews([...galleryPreviews, ...newPreviews]);
    }
  };
  
  // Remove image from gallery
  const removeGalleryImage = (index: number) => {
    if (galleryFiles.length > index) {
      // Remove from files array if it's a new file
      setGalleryFiles(galleryFiles.filter((_, i) => i !== index));
    }
    
    // Remove from previews
    setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
    
    // If it's an existing image (from database), also remove from article
    if (article.galleryImages && article.galleryImages.length > index && galleryFiles.length <= index) {
      setArticle(prev => ({
        ...prev,
        galleryImages: prev.galleryImages?.filter((_, i) => i !== index)
      }));
    }
  };
  
  // Use an existing gallery image as the main image
  const useAsMainImage = (imageUrl: string) => {
    setArticle(prev => ({
      ...prev,
      imageUrl
    }));
    setImagePreview(imageUrl);
    setImageFile(null);
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) {
      return article.imageUrl || "";
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Generate a unique filename using timestamp and original filename
      const timestamp = new Date().getTime();
      const fileName = `articles/${timestamp}_${imageFile.name}`;
      const storageRef = ref(storage, fileName);
      
      // Upload the image
      const uploadTask = uploadBytes(storageRef, imageFile);
      
      // Wait for upload to complete
      await uploadTask;
      setUploadProgress(100);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Eroare la încărcarea imaginii:", error);
      throw new Error("Încărcarea imaginii a eșuat");
    } finally {
      setIsUploading(false);
    }
  };
  
  // Upload gallery images
  const uploadGalleryImages = async (): Promise<string[]> => {
    if (galleryFiles.length === 0) {
      return article.galleryImages || [];
    }
    
    setUploadingGallery(true);
    const uploadedUrls: string[] = [];
    
    try {
      // Upload each gallery image
      for (const file of galleryFiles) {
        const timestamp = new Date().getTime();
        const fileName = `articles/gallery/${timestamp}_${file.name}`;
        const storageRef = ref(storage, fileName);
        
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        uploadedUrls.push(downloadURL);
      }
      
      // Combine with existing gallery images that weren't replaced
      const existingImages = article.galleryImages || [];
      return [...existingImages, ...uploadedUrls];
    } catch (error) {
      console.error("Eroare la încărcarea imaginilor pentru galerie:", error);
      throw new Error("Încărcarea imaginilor pentru galerie a eșuat");
    } finally {
      setUploadingGallery(false);
    }
  };

  // Delete an image from storage
  const deleteImageFromStorage = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extract path from URL
      const urlParts = imageUrl.split("?")[0].split("/o/")[1];
      if (!urlParts) return false;
      
      const decodedPath = decodeURIComponent(urlParts);
      const imageRef = ref(storage, decodedPath);
      
      await deleteObject(imageRef);
      return true;
    } catch (error) {
      console.error("Eroare la ștergerea imaginii din storage:", error);
      return false;
    }
  };
  
  // Handle cover style change
  const handleCoverStyleChange = (style: string) => {
    setArticle(prev => ({
      ...prev,
      coverStyle: style
    }));
  };

  const formatCurrentDate = (): string => {
    const now = new Date();
    return now.toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      if (!article.title || !article.content) {
        setError("Titlul și conținutul sunt obligatorii.");
        return;
      }

      // Upload main image if there's a new one
      let imageUrl = article.imageUrl || "";
      if (imageFile) {
        try {
          imageUrl = await uploadImage();
        } catch (err) {
          setError("Eroare la încărcarea imaginii. Vă rugăm încercați din nou.");
          return;
        }
      }
      
      // Upload gallery images if there are new ones
      let galleryImages = article.galleryImages || [];
      if (galleryFiles.length > 0) {
        try {
          const newGalleryUrls = await uploadGalleryImages();
          galleryImages = [...(article.galleryImages || []), ...newGalleryUrls];
        } catch (err) {
          setError("Eroare la încărcarea imaginilor pentru galerie. Vă rugăm încercați din nou.");
          return;
        }
      }

      const updatedArticle = {
        title: article.title.trim(),
        content: article.content.trim(),
        author: article.author?.trim() || "Admin",
        imageUrl: imageUrl,
        published: article.published,
        tags: article.tags || [],
        preview: article.preview || article.content.substring(0, 150) + (article.content.length > 150 ? "..." : ""),
        date: article.date || formatCurrentDate(),
        readCount: article.readCount || 0,
        readBy: article.readBy || [],
        feedback: article.feedback || [],
        galleryImages: galleryImages,
        coverStyle: article.coverStyle || "standard",
        updatedAt: Timestamp.now()
      };

      if (isNewArticle) {
        // Creating a new article
        const articlesRef = collection(db, "articles");
        const newArticleData = {
          ...updatedArticle,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        await addDoc(articlesRef, newArticleData);
        setSuccess(true);
        setTimeout(() => navigate("/admin/articles"), 2000);
      } else {
        // Updating an existing article
        const docRef = doc(db, "articles", id!);
        await updateDoc(docRef, updatedArticle);

        setSuccess(true);
        setTimeout(() => navigate("/admin/articles"), 2000);
      }
    } catch (err: any) {
      console.error(`Eroare la ${isNewArticle ? "crearea" : "actualizarea"} articolului:`, err);
      if (err.code === "permission-denied") {
        setError(`Nu ai permisiunea de a ${isNewArticle ? "crea" : "actualiza"} acest articol.`);
      } else {
        setError(`A apărut o eroare la ${isNewArticle ? "crearea" : "actualizarea"} articolului.`);
      }
    }
  };

  // Clear main image
  const clearMainImage = async () => {
    // If there's an existing image URL and it's in Firebase storage, attempt to delete it
    if (article.imageUrl && article.imageUrl.includes("firebasestorage.googleapis.com")) {
      await deleteImageFromStorage(article.imageUrl);
    }
    
    setImagePreview("");
    setImageFile(null);
    setArticle(prev => ({
      ...prev,
      imageUrl: ""
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">
          {isNewArticle ? "Adaugă Articol Nou" : "Editare Articol"}
        </h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md">
            <div className="flex items-center">
              <FaTimes className="text-red-500 mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded shadow-md">
            <div className="flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              <p>Articolul a fost {isNewArticle ? "creat" : "actualizat"} cu succes!</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  Titlu
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={article.title}
                  onChange={handleInputChange}
                  className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
                  Conținut
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={article.content}
                  onChange={handleInputChange}
                  rows={12}
                  className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="preview">
                  Text previzualizare
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    {generatePreview ? "(generare automată)" : "(personalizat)"}
                  </span>
                </label>
                <textarea
                  id="preview"
                  name="preview"
                  value={article.preview}
                  onChange={handleInputChange}
                  rows={3}
                  className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
                <div className="mt-1 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratePreview(!generatePreview);
                      if (!generatePreview) {
                        // Reset preview to auto-generated when switching back
                        setArticle(prev => ({
                          ...prev,
                          preview: prev.content?.substring(0, 150) + (prev.content && prev.content.length > 150 ? "..." : "")
                        }));
                      }
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {generatePreview ? "Dezactivează generarea automată" : "Activează generarea automată"}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="author">
                    Autor
                  </label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={article.author}
                    onChange={handleInputChange}
                    className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                    Data articolului
                  </label>
                  <input
                    type="text"
                    id="date"
                    name="date"
                    value={article.date || formatCurrentDate()}
                    onChange={handleInputChange}
                    className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ex: 15 Aprilie 2023"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format recomandat: zi luna an (ex: 15 Aprilie 2023)
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center">
                  <FaTags className="mr-1" /> Etichete (Tags)
                </label>
                <div className="flex mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="shadow-sm appearance-none border border-gray-300 rounded-l-md w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Adaugă un tag"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-md flex items-center transition-colors"
                  >
                    <FaPlus className="mr-1" /> Adaugă
                  </button>
                </div>
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full flex items-center shadow-sm"
                      >
                        <FaTag className="mr-1" /> {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-blue-800 hover:text-red-600 focus:outline-none"
                        >
                          <FaTimes />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:col-span-1 bg-gray-50 p-4 rounded-lg shadow-inner">
              <div className="sticky top-20">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Imagine copertă</h3>
                
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <label htmlFor="imageUpload" className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center transition-colors">
                      <FaImage className="mr-2" /> Încarcă imagine
                    </label>
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    {article.imageUrl && (
                      <button
                        type="button"
                        onClick={clearMainImage}
                        className="ml-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition-colors"
                        title="Șterge imaginea"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {imageFile ? imageFile.name : (article.imageUrl ? "Imagine încărcată" : "Nicio imagine selectată")}
                  </p>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">
                      URL imagine (alternativ)
                    </label>
                    <input
                      type="text"
                      id="imageUrl"
                      name="imageUrl"
                      value={article.imageUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {isUploading && uploadProgress !== null && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 mb-2">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                
                {(imagePreview || article.imageUrl) && (
                  <div className="mb-6 border rounded-lg overflow-hidden shadow-md">
                    <img
                      src={imagePreview || article.imageUrl}
                      alt="Preview"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
                
                <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Stil afișare</h3>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div 
                    onClick={() => handleCoverStyleChange("standard")}
                    className={`border rounded p-2 cursor-pointer text-center ${article.coverStyle === "standard" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-100"}`}
                  >
                    <div className="h-12 bg-gray-200 mb-2 rounded flex items-center justify-center text-xs text-gray-500">Imagine sus</div>
                    <p className="text-sm">Standard</p>
                  </div>
                  
                  <div 
                    onClick={() => handleCoverStyleChange("side")}
                    className={`border rounded p-2 cursor-pointer text-center ${article.coverStyle === "side" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-100"}`}
                  >
                    <div className="h-12 bg-gray-200 mb-2 rounded flex items-center justify-center text-xs text-gray-500">Imagine lateral</div>
                    <p className="text-sm">Lateral</p>
                  </div>
                  
                  <div 
                    onClick={() => handleCoverStyleChange("fullwidth")}
                    className={`border rounded p-2 cursor-pointer text-center ${article.coverStyle === "fullwidth" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-100"}`}
                  >
                    <div className="h-12 bg-gray-200 mb-2 rounded flex items-center justify-center text-xs text-gray-500">Full width</div>
                    <p className="text-sm">Lățime completă</p>
                  </div>
                  
                  <div 
                    onClick={() => handleCoverStyleChange("overlay")}
                    className={`border rounded p-2 cursor-pointer text-center ${article.coverStyle === "overlay" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-100"}`}
                  >
                    <div className="h-12 bg-gray-200 mb-2 rounded flex items-center justify-center text-xs text-gray-500">Text peste imagine</div>
                    <p className="text-sm">Overlay</p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex items-center cursor-pointer">
                    <div className={`w-10 h-6 rounded-full flex items-center transition-all duration-300 p-1 ${article.published ? "bg-green-500" : "bg-gray-300"}`}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow transition-all duration-300 transform ${article.published ? "translate-x-4" : ""}`} />
                    </div>
                    <div className="ml-3 flex items-center">
                      {article.published ? 
                        <><FaEye className="text-green-600 mr-1" /> <span className="text-gray-700">Publicat</span></> : 
                        <><FaEyeSlash className="text-gray-600 mr-1" /> <span className="text-gray-700">Ascuns</span></>
                      }
                      <input
                        type="checkbox"
                        checked={article.published}
                        onChange={handleTogglePublished}
                        className="hidden"
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Gallery Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-700">Galerie imagini</h3>
              <button
                type="button"
                onClick={() => setShowGalleryUpload(!showGalleryUpload)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center transition-colors"
              >
                {showGalleryUpload ? (
                  <><FaTimes className="mr-2" /> Închide</> 
                ) : (
                  <><FaPlus className="mr-2" /> Adaugă imagini</>
                )}
              </button>
            </div>
            
            {showGalleryUpload && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <label htmlFor="galleryUpload" className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center transition-colors">
                    <FaImage className="mr-2" /> Selectează imagini
                  </label>
                  <input
                    type="file"
                    id="galleryUpload"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryImageChange}
                    className="hidden"
                  />
                  <span className="ml-3 text-sm text-gray-600">
                    {galleryFiles.length > 0 ? `${galleryFiles.length} fișiere selectate` : "Niciun fișier selectat"}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  Adaugă imagini suplimentare pentru articol. Acestea vor fi afișate într-o galerie sub conținutul principal.
                </p>
              </div>
            )}
            
            {galleryPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {galleryPreviews.map((preview, index) => (
                  <div key={index} className="relative group border rounded-lg overflow-hidden shadow-sm">
                    <img 
                      src={preview} 
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        title="Șterge imaginea"
                      >
                        <FaTrash />
                      </button>
                      <button
                        type="button"
                        onClick={() => useAsMainImage(preview)}
                        className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors ml-2"
                        title="Folosește ca imagine principală"
                      >
                        <FaExchangeAlt />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
            <button
              type="button"
              onClick={() => navigate("/admin/articles")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md flex items-center transition-colors shadow-md"
              disabled={isUploading || uploadingGallery}
            >
              <FaTimes className="mr-2" /> Anulează
            </button>
            
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-md flex items-center transition-colors shadow-md"
              disabled={isUploading || uploadingGallery}
            >
              {isUploading || uploadingGallery ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Se încarcă...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  {isNewArticle ? "Creează Articol" : "Salvează Modificările"}
                </>
              )}
            </button>
          </div>
          
          {!isNewArticle && article.readCount !== undefined && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Statistici articol</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 shadow-sm">
                  <p className="text-sm text-gray-700">Număr de citiri: <span className="font-bold">{article.readCount}</span></p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-100 shadow-sm">
                  <p className="text-sm text-gray-700">Feedback-uri primite: <span className="font-bold">{article.feedback?.length || 0}</span></p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100 shadow-sm">
                  <p className="text-sm text-gray-700">Ultima actualizare: <span className="font-bold">{article.updatedAt ? new Date(article.updatedAt.toDate()).toLocaleDateString("ro-RO") : "N/A"}</span></p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ArticleEdit;