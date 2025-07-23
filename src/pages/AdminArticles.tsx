import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEyeSlash,
  FaImage,
  FaComments,
  FaCheck,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { isUserAdmin, MAIN_ADMIN_EMAIL } from "../utils/userRoles";

// Enhanced Article interface
interface Article {
  id: string;
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
  feedback?: ArticleFeedback[];
  date?: string;
}

// New interface for article feedback
interface ArticleFeedback {
  userId: string;
  userName: string;
  comment: string;
  rating: number;
  createdAt: Timestamp;
}

const AdminArticles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Default to showing pending articles for admin approval
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "published"
  >("pending");
  // Filter articles based on approval status
  const filteredArticles = articles.filter((article) => {
    if (statusFilter === "pending") return !article.published;
    if (statusFilter === "published") return article.published;
    return true;
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null
  );
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [hasAdminAccess, setHasAdminAccess] = useState<boolean>(false);

  // Verificăm statusul de admin la încărcare
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        setHasAdminAccess(false);
        return;
      }

      // Verificare directă pentru email-ul principal de admin
      if (user.email === MAIN_ADMIN_EMAIL) {
        setHasAdminAccess(true);
        return;
      }

      // Verificare prin contextul auth
      if (isAdmin) {
        setHasAdminAccess(true);
        return;
      }

      // Verificare prin funcția de utilitate
      try {
        const adminStatus = await isUserAdmin(user.email || "");
        setHasAdminAccess(adminStatus);
      } catch (error) {
        console.error("Eroare la verificarea statusului de admin:", error);
        setHasAdminAccess(false);
      }
    };

    checkAdminAccess();
  }, [user, isAdmin]);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const articlesRef = collection(db, "articles");
      const q = query(articlesRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setArticles([]);
      } else {
        const articlesList = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Article
        );

        setArticles(articlesList);
      }
    } catch (err) {
      console.error("Error fetching articles:", err);
      setError("A apărut o eroare la încărcarea articolelor.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddArticle = () => {
    navigate("/admin/articles/add");
  };

  const handleEditArticle = (articleId: string) => {
    navigate(`/admin/articles/edit/${articleId}`);
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (window.confirm("Sunteți sigur că doriți să ștergeți acest articol?")) {
      try {
        // First check if article has an image to delete from storage
        const article = articles.find((a) => a.id === articleId);
        if (article?.imageUrl) {
          try {
            // Extract the image path from the URL
            const imagePath = article.imageUrl
              .split("?")[0]
              .split("/o/")[1]
              .replace(/%2F/g, "/");
            const decodedPath = decodeURIComponent(imagePath);
            const storageRef = ref(storage, decodedPath);
            await deleteObject(storageRef);
            console.log("Image deleted successfully");
          } catch (imageError) {
            console.error("Error deleting image:", imageError);
            // Continue with article deletion even if image deletion fails
          }
        }

        // Delete the article document
        await deleteDoc(doc(db, "articles", articleId));
        setArticles(articles.filter((article) => article.id !== articleId));
        alert("Articolul a fost șters cu succes!");
      } catch (err) {
        console.error("Error deleting article:", err);
        alert("A apărut o eroare la ștergerea articolului.");
      }
    }
  };

  const togglePublishStatus = async (article: Article) => {
    try {
      const articleRef = doc(db, "articles", article.id);
      const newStatus = !article.published;

      await updateDoc(articleRef, {
        published: newStatus,
        updatedAt: Timestamp.now(),
      });

      // Update the local state
      setArticles(
        articles.map((a) =>
          a.id === article.id ? { ...a, published: newStatus } : a
        )
      );

      alert(`Articolul a fost ${newStatus ? "publicat" : "ascuns"} cu succes!`);
    } catch (err) {
      console.error("Error updating article status:", err);
      alert("A apărut o eroare la actualizarea statusului articolului.");
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    articleId: string
  ) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setSelectedArticleId(articleId);
    }
  };

  const uploadImage = async (articleId: string) => {
    if (!imageFile) return null;

    setUploadingImage(true);
    try {
      const storageRef = ref(
        storage,
        `articles/${articleId}/${imageFile.name}`
      );
      await uploadBytes(storageRef, imageFile);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageUpload = async (articleId: string) => {
    if (!imageFile) {
      alert("Selectați o imagine mai întâi!");
      return;
    }

    try {
      const imageUrl = await uploadImage(articleId);
      if (imageUrl) {
        const articleRef = doc(db, "articles", articleId);
        await updateDoc(articleRef, {
          imageUrl,
          updatedAt: Timestamp.now(),
        });

        // Update the local state
        setArticles(
          articles.map((a) => (a.id === articleId ? { ...a, imageUrl } : a))
        );

        setImageFile(null);
        setSelectedArticleId(null);
        alert("Imaginea a fost încărcată cu succes!");
      }
    } catch (err) {
      console.error("Error updating article with image:", err);
      alert("A apărut o eroare la încărcarea imaginii.");
    }
  };

  const viewFeedback = (article: Article) => {
    if (!article.feedback || article.feedback.length === 0) {
      alert("Acest articol nu are feedback de la utilizatori.");
      return;
    }

    // Navigate to a feedback view page or show a modal
    // For now, just show an alert with the feedback count
    alert(
      `Acest articol are ${article.feedback.length} comentarii de la utilizatori.`
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Data necunoscută";

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "Format invalid";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 article-edit-container">
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestionare Articole</h1>
          <div className="flex items-center space-x-2">
            <label htmlFor="statusFilter" className="text-sm">
              Filtrează:
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="all">Toate</option>
              <option value="pending">În așteptare</option>
              <option value="published">Publicate</option>
            </select>
          </div>
          <button
            onClick={handleAddArticle}
            disabled={!hasAdminAccess}
            className={`px-4 py-2 rounded-md transition-colors flex items-center ${
              hasAdminAccess
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <FaPlus className="mr-2" /> Adaugă articol nou
          </button>
        </div>

        {/* Afișăm mesaj de informare despre statusul de admin */}
        {!hasAdminAccess && user && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">
                  <strong>Acces limitat:</strong> Pentru a putea adăuga sau
                  edita articole, aveți nevoie de drepturi de administrator.
                  <br />
                  Email curent: <span className="font-mono">{user.email}</span>
                  <br />
                  Status admin din context:{" "}
                  <span className="font-mono">{isAdmin ? "DA" : "NU"}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  {statusFilter === "all"
                    ? "Nu există articole. Adăugați unul nou pentru a începe."
                    : statusFilter === "pending"
                      ? "Nu există articole în așteptare."
                      : "Nu există articole publicate."}
                </p>
              </div>
            ) : (
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Articol</th>
                    <th className="py-3 px-4 text-left">Autor</th>
                    <th className="py-3 px-4 text-left">Data publicării</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Citiri</th>
                    <th className="py-3 px-4 text-center">Feedback</th>
                    <th className="py-3 px-4 text-right">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredArticles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          {article.imageUrl ? (
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className="w-12 h-12 rounded object-cover mr-3"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center mr-3">
                              <span className="text-gray-500 text-xs">
                                No img
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 flex items-center">
                              {article.title}
                              {!article.published && (
                                <span className="ml-2 px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded-full text-xs">
                                  În așteptare
                                </span>
                              )}
                            </div>
                            {article.tags && article.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {article.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">
                          {article.author}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(article.createdAt)}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => togglePublishStatus(article)}
                          title={
                            article.published
                              ? "Ascunde articol"
                              : "Aprobă articol"
                          }
                          className={`px-2 py-1 text-xs rounded flex items-center justify-center mx-auto ${
                            article.published
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {article.published ? (
                            <>
                              <FaEyeSlash className="mr-1" /> Ascunde
                            </>
                          ) : (
                            <>
                              <FaCheck className="mr-1" /> Aprobă
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm font-medium">
                          {article.readCount || 0}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => viewFeedback(article)}
                          className="text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto"
                        >
                          <FaComments className="mr-1" />
                          <span>{article.feedback?.length || 0}</span>
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          {/* Image upload button */}
                          <div className="relative">
                            <input
                              type="file"
                              id={`image-upload-${article.id}`}
                              accept="image/*"
                              onChange={(e) => handleImageChange(e, article.id)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              aria-label="Încarcă imagine"
                            />
                            <label
                              htmlFor={`image-upload-${article.id}`}
                              className="text-gray-600 hover:text-gray-800 cursor-pointer"
                              title="Încarcă imagine"
                            >
                              <FaImage />
                            </label>
                          </div>

                          {/* Show upload button if an image is selected for this article */}
                          {selectedArticleId === article.id && imageFile && (
                            <button
                              onClick={() => handleImageUpload(article.id)}
                              disabled={uploadingImage}
                              className={`text-blue-600 hover:text-blue-800 ${uploadingImage ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              {uploadingImage ? "Se încarcă..." : "Încarcă"}
                            </button>
                          )}

                          <button
                            onClick={() => handleEditArticle(article.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Editează articol"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(article.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Șterge articol"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminArticles;
