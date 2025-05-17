import React, { useState, useEffect } from "react";
import { FaStar, FaRegStar, FaCheck } from "react-icons/fa";
import { Product, ProductReview } from "../types";
import { Link } from "react-router-dom";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { UserProfile } from "../types/common";
import logger from "../utils/logger";

const componentLogger = logger.createLogger("ProductReviews");

// Using the existing ProductReview type from ../types instead of creating a separate UserRating type
type UserRating = ProductReview;

interface ProductRatings {
  average: number;
  count: number;
  userRatings?: UserRating[];
}

interface ProductReviewsProps {
  product: Product;
  currentUser: UserProfile | null; // More specific type
  userHasOrdered: boolean;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ 
  product, 
  currentUser,
  userHasOrdered
}) => {
  const [newReview, setNewReview] = useState<{ rating: number; comment: string }>({
    rating: 5,
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isDemoProduct, setIsDemoProduct] = useState(false);
  const [productRatings, setProductRatings] = useState<ProductRatings>(product.ratings || { average: 0, count: 0 });

  useEffect(() => {
    if (product.id === "dulceata-afine") {
      setIsDemoProduct(true);
      
      if (!product.ratings || product.ratings.count === 0) {
        setProductRatings({
          average: 4.7,
          count: 12,
          userRatings: product.ratings?.userRatings || []
        });
      }
    }
  }, [product.id, product.ratings, currentUser]);

  const canReview = userHasOrdered || isDemoProduct;

  const hasUserReviewed = productRatings?.userRatings?.some(
    (review) => review.userId === currentUser?.uid
  );

  const handleRatingClick = (rating: number) => {
    setNewReview((prev) => ({ ...prev, rating }));
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewReview((prev) => ({ ...prev, comment: e.target.value }));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setSubmitError("Trebuie să fii autentificat pentru a adăuga o recenzie.");
      return;
    }

    if (!canReview) {
      setSubmitError("Doar clienții care au cumpărat acest produs pot lăsa o recenzie.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const productRef = doc(db, "products", product.id);
      const productSnap = await getDoc(productRef);

      let productData;

      if (!productSnap.exists()) {
        await setDoc(productRef, {
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          inStock: product.inStock,
          ratings: { count: 0, average: 0, userRatings: [] }
        });
        
        const newProductSnap = await getDoc(productRef);
        if (newProductSnap.exists()) {
          productData = newProductSnap.data();
        } else {
          throw new Error("Nu s-a putut crea produsul în baza de date");
        }
      } else {
        productData = productSnap.data();
      }

      const currentRatings = productData.ratings || { count: 0, average: 0, userRatings: [] };
      
      const userRatingIndex = currentRatings.userRatings?.findIndex(
        (r: UserRating) => r.userId === currentUser.uid
      );

      let newRatings;

      if (userRatingIndex >= 0) {
        const updatedUserRatings = [...currentRatings.userRatings];
        updatedUserRatings[userRatingIndex] = {
          ...updatedUserRatings[userRatingIndex],
          rating: newReview.rating,
          comment: newReview.comment,
          date: new Date().toISOString()
        };

        const sum = updatedUserRatings.reduce((acc: number, curr: UserRating) => acc + curr.rating, 0);
        const newAverage = sum / updatedUserRatings.length;

        newRatings = {
          count: currentRatings.count,
          average: newAverage,
          userRatings: updatedUserRatings,
        };
      } else {
        const newCount = currentRatings.count + 1;
        const newSum = currentRatings.average * currentRatings.count + newReview.rating;
        const newAverage = newSum / newCount;

        newRatings = {
          count: newCount,
          average: newAverage,
          userRatings: [
            ...(currentRatings.userRatings || []),
            { 
              userId: currentUser.uid, 
              userName: currentUser.displayName || "Utilizator",
              rating: newReview.rating, 
              comment: newReview.comment,
              date: new Date().toISOString(),
              verified: true
            },
          ],
        };
      }

      await updateDoc(productRef, { ratings: newRatings });
      
      setProductRatings(newRatings);
      
      setSubmitSuccess(true);
      setNewReview({ rating: 5, comment: "" });
      
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      componentLogger.error("Error submitting review:", error);
      setSubmitError("A apărut o eroare la trimiterea recenziei.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRatings = productRatings || { count: 0, average: 0, userRatings: [] };

  return (
    <div className="reviews-container">
      <h2 className="section-heading text-xl font-bold">Recenzii clienți</h2>
      
      {displayRatings.count > 0 ? (
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <div className="mr-2 bg-blue-50 px-3 py-2 rounded-md">
              <span className="text-2xl font-bold text-blue-600">{displayRatings.average.toFixed(1)}</span>
              <span className="text-blue-600">/5</span>
            </div>
            <div>
              <div className="flex product-rating-stars">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={index} style={{ display: "inline-block" }}>
                    {index < Math.round(displayRatings.average || 0) ? (
                      <FaStar style={{ color: "#FFB900" }} />
                    ) : (
                      <FaRegStar style={{ color: "#d1d5db" }} />
                    )}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                {displayRatings.count || 0} {(displayRatings.count || 0) === 1 ? "recenzie" : "recenzii"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 bg-gray-50 p-6 rounded-lg border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-gray-700 font-medium mb-2">Acest produs nu are încă recenzii.</p>
            <p className="text-sm text-gray-500">Fii primul care evaluează acest produs!</p>
          </div>
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <FaRegStar key={i} className="text-gray-300 text-xl mx-0.5" />
            ))}
          </div>
        </div>
      )}
      
      {displayRatings.userRatings && displayRatings.userRatings.length > 0 && (
        <div className="space-y-6 mb-8">
          {displayRatings.userRatings.map((review, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center mb-2">
                <div className="flex product-rating-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ display: "inline-block" }}>
                      {i < review.rating ? (
                        <FaStar style={{ color: "#FFB900" }} />
                      ) : (
                        <FaRegStar style={{ color: "#d1d5db" }} />
                      )}
                    </span>
                  ))}
                </div>
                <span className="ml-2 text-gray-600 text-sm">
                  {new Date(review.date).toLocaleDateString("ro-RO")}
                </span>
                <span className="ml-2 text-gray-700 font-medium">
                  {review.userName || "Utilizator"}
                </span>
                {review.verified && (
                  <span className="verified-purchase ml-auto" style={{
                    display: "inline-flex", 
                    alignItems: "center",
                    backgroundColor: "#ecfdf5",
                    color: "#059669",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "9999px",
                    fontSize: "0.75rem"
                  }}>
                    <FaCheck style={{marginRight: "0.25rem"}} /> Achiziție verificată
                  </span>
                )}
              </div>
              {review.comment && <p className="text-gray-700">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
      
      {currentUser ? (
        canReview ? (
          hasUserReviewed ? (
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Ai evaluat deja acest produs</h3>
              <p className="text-sm text-gray-600 mb-3">
                Poți actualiza recenzia ta în formularul de mai jos.
              </p>
              <form onSubmit={handleSubmitReview} className="mt-4">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Evaluare
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingClick(rating)}
                        className="text-2xl focus:outline-none"
                      >
                        {rating <= newReview.rating ? (
                          <FaStar className="text-yellow-400" />
                        ) : (
                          <FaRegStar className="text-gray-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
                    Comentariu (opțional)
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    value={newReview.comment}
                    onChange={handleCommentChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Scrie-ți părerea despre acest produs..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Se trimite..." : "Actualizează recenzia"}
                </button>
                {submitError && (
                  <p className="text-red-600 mt-2">{submitError}</p>
                )}
                {submitSuccess && (
                  <p className="text-green-600 mt-2 flex items-center">
                    <FaCheck className="mr-1" /> Recenzia a fost actualizată cu succes!
                  </p>
                )}
              </form>
            </div>
          ) : (
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Adaugă o recenzie</h3>
              <p className="text-sm text-gray-600 mb-3">
                Spune-ne părerea ta despre produsul cumpărat.
              </p>
              <form onSubmit={handleSubmitReview} className="mt-4">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Evaluare
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingClick(rating)}
                        className="text-2xl focus:outline-none"
                      >
                        {rating <= newReview.rating ? (
                          <FaStar className="text-yellow-400" />
                        ) : (
                          <FaRegStar className="text-gray-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">
                    Comentariu (opțional)
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    value={newReview.comment}
                    onChange={handleCommentChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Scrie-ți părerea despre acest produs..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Se trimite..." : "Trimite recenzia"}
                </button>
                {submitError && (
                  <p className="text-red-600 mt-2">{submitError}</p>
                )}
                {submitSuccess && (
                  <p className="text-green-600 mt-2 flex items-center">
                    <FaCheck className="mr-1" /> Recenzia a fost adăugată cu succes!
                  </p>
                )}
              </form>
            </div>
          )
        ) : (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Ai cumpărat acest produs?</h3>
            <p className="text-sm text-gray-600 mb-3">
              Doar clienții care au cumpărat acest produs pot lăsa o recenzie.
            </p>
          </div>
        )
      ) : (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700">
            <Link to="/login" className="text-blue-600 hover:underline">Conectează-te</Link> pentru a putea adăuga o recenzie după ce achiziționezi produsul.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;