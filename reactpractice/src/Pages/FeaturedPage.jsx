import React from "react";

const FeaturedPage = () => {
  const featuredBooks = [
    {
      title: "The White Tiger",
      author: "Aravind Adiga",
      description:
        "A gripping story of ambition and social mobility in modern India.",
    },
    {
      title: "The God of Small Things",
      author: "Arundhati Roy",
      description:
        "A beautifully written novel exploring love, caste, and family secrets.",
    },
    {
      title: "Train to Pakistan",
      author: "Khushwant Singh",
      description:
        "A powerful depiction of Partition and its impact on human lives.",
    },
  ];

  return (
    <div className="p-8 bg-[#fefcf8] min-h-screen">
      <h1 className="text-3xl font-serif font-bold text-center mb-8">
        Featured Books
      </h1>

      <div className="space-y-6 max-w-3xl mx-auto">
        {featuredBooks.map((book, index) => (
          <div
            key={index}
            className="border border-gray-200 p-4 rounded shadow-sm bg-white"
          >
            <h2 className="text-xl font-semibold text-orange-600">
              {book.title}
            </h2>
            <p className="text-sm text-gray-500">by {book.author}</p>
            <p className="mt-2 text-gray-700">{book.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedPage;
/*react8 react page this and that i want to want to study we are */
