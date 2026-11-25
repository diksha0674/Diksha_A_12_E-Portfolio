import React from "react";
import data from "../utility/data.json"; // make sure this path is correct

const Popular = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        📚 Popular Books
      </h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {data.map((book) => (
          <div
            key={book.id}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
          >
            <img
              src={book.image}
              alt={book.book_name}
              className="h-72 w-full object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {book.book_name}
              </h2>
              <p className="text-sm text-gray-600 mb-1">
                By: {book.author_name}
              </p>
              <p className="text-xs text-orange-600 mb-2 capitalize">
                Type: {book.type}
              </p>
              <p className="text-sm text-gray-700 mb-2">{book.description}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  Published: {book.published_year}
                </span>
                <span className="font-bold text-orange-500">₹{book.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Popular;
