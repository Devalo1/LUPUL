import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Pagină negăsită</h2>
        <p className="mt-2 text-lg text-gray-600">
          Ne pare rău, pagina pe care o cauți nu există sau a fost mutată.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button>
              Înapoi la pagina principală
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
