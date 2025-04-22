import React, { useState } from "react";
import Layout from "../components/layout/Layout";
import Button from "../components/common/Button";
import { FaFacebookSquare, FaInstagram, FaYoutube } from "react-icons/fa";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    
    try {
      // This would be replaced with your actual form submission logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setSubmitError("A apărut o eroare la trimiterea mesajului. Vă rugăm încercați din nou.");
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Contactează-ne</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="text-blue-600 mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 15.284 3 8V6a2 2 0 012-2z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Telefon</h3>
                  <p className="text-gray-600">0734 931 703</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-blue-600 mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-gray-600">lupulsicorbul@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-blue-600 mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Adresă</h3>
                  <p className="text-gray-600">Strada 9 Mai, Petroșani</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-blue-600 mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Program vizite</h3>
                  <p className="text-gray-600">Luni - Vineri: 10:00 - 18:00</p>
                  <p className="text-gray-600">Sâmbătă: 10:00 - 14:00</p>
                  <p className="text-gray-600">Duminică: Închis</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">Rețele sociale</h3>
                <div className="flex space-x-4">
                  <a href="https://facebook.com/lupulsicorbul" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    <FaFacebookSquare className="w-7 h-7" />
                  </a>
                  <a href="https://instagram.com/lupulsicorbul" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800">
                    <FaInstagram className="w-7 h-7" />
                  </a>
                  <a href="https://youtube.com/lupulsicorbul" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800">
                    <FaYoutube className="w-7 h-7" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Trimite-ne un mesaj</h2>
            
            {submitSuccess ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <p className="font-medium">Mesaj trimis cu succes!</p>
                <p className="text-sm">Îți mulțumim pentru mesaj. Te vom contacta în curând.</p>
                <button 
                  onClick={() => setSubmitSuccess(false)}
                  className="mt-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                  Trimite alt mesaj
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <p>{submitError}</p>
                  </div>
                )}
                
                <div>
                  <label htmlFor="name" className="block text-gray-700 mb-2">Nume</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-gray-700 mb-2">Subiect</label>
                  <input 
                    type="text" 
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-gray-700 mb-2">Mesaj</label>
                  <textarea 
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  ></textarea>
                </div>
                
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Se trimite..." : "Trimite mesajul"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
