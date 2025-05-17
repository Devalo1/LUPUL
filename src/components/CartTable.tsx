import React from "react";
import { CartItem, useCart } from "../contexts/CartContext";

interface CartTableProps {
  items: CartItem[];
  formatCurrency: (price: number | undefined) => string;
}

const CartTable: React.FC<CartTableProps> = ({ items, formatCurrency }) => {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="p-6">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-blue-50">
            <th className="text-left py-3 px-4 text-blue-800 font-bold">Produs</th>
            <th className="text-center py-3 px-4 text-blue-800 font-bold">Cantitate</th>
            <th className="text-right py-3 px-4 text-blue-800 font-bold">Preț</th>
            <th className="text-right py-3 px-4 text-blue-800 font-bold">Total</th>
            <th className="text-right py-3 px-4 text-blue-800 font-bold">Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="py-4 px-4">
                <div className="flex items-center">
                  <img 
                    src={item.image || "https://via.placeholder.com/80"} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded shadow-sm"
                  />
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-gray-600 text-sm">{formatCurrency(item.price)} / buc</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-center">
                  <button 
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 hover:bg-gray-300 transition-colors"
                  >
                    -
                  </button>
                  <span className="mx-3 text-gray-800 font-medium">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 hover:bg-gray-300 transition-colors"
                  >
                    +
                  </button>
                </div>
              </td>
              <td className="py-4 px-4 text-right text-gray-800 font-medium">{formatCurrency(item.price)}</td>
              <td className="py-4 px-4 text-right font-bold text-gray-900">
                {item.price !== undefined 
                  ? formatCurrency(item.price * item.quantity) 
                  : formatCurrency(undefined)}
              </td>
              <td className="py-4 px-4 text-right">
                <button 
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                  title="Elimină din coș"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CartTable;
