import React from "react";
import { FaArrowLeft, FaArrowRight, FaHeart, FaCartPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import bookData from "../utility/data.json";

const HomePage = () => {
  const scrollRef = React.useRef();
  const navigate = useNavigate();

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleAddToCart = (book) => {
    console.log("Added to cart:", book.title);
    // Add cart logic here (e.g., context or redux)
  };

  const handleAddToWishlist = (book) => {
    console.log("Added to wishlist:", book.title);
    // Add wishlist logic here
  };

  return (
    <div className="relative w-full bg-[#fefcf8] py-10 overflow-hidden">
      {/* Left and Right Arrows */}
      <button
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10"
        onClick={() => scroll("left")}
      >
        <FaArrowLeft />
      </button>
      <button
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10"
        onClick={() => scroll("right")}
      >
        <FaArrowRight />
      </button>

      {/* Scrollable Cards */}
      <div
        className="flex overflow-x-auto scroll-smooth gap-10 px-6 snap-x snap-mandatory"
        ref={scrollRef}
      >
        {bookData.map((item, index) => (
          <div
            key={index}
            className="min-w-full flex items-center justify-between snap-center"
          >
            {/* Text Section */}
            <div className="w-1/2 px-10">
              <h1 className="text-5xl font-serif font-bold mb-6">
                {item.title}
              </h1>
              <p className="text-gray-600 mb-6">{item.description}</p>
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => handleAddToCart(item)}
                  className="px-4 py-2 bg-orange-400 text-white rounded hover:bg-orange-500 transition"
                >
                  <FaCartPlus className="inline mr-2" />
                  Add to Cart
                </button>
                <button
                  onClick={() => handleAddToWishlist(item)}
                  className="px-4 py-2 bg-pink-300 text-white rounded hover:bg-pink-400 transition"
                >
                  <FaHeart className="inline mr-2" />
                  Wishlist
                </button>
              </div>
              <button className="px-6 py-2 border border-orange-400 text-orange-400 font-semibold flex items-center gap-2 hover:bg-orange-100 transition">
                READ MORE <FaArrowRight />
              </button>
            </div>

            {/* Image Section */}
            <div className="w-1/2 flex justify-center">
              <div className="w-[350px] h-[500px] bg-white shadow-md relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <p className="text-right pr-2 text-sm text-gray-500 absolute bottom-2 right-2">
                  - {item.author}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Banner or Section */}
      <div className="bg-gray-200 h-40 mt-10">
        <img src="div1.png" alt="" className="w-full h-full object-cover" />
      </div>

      {/* Quote Section */}
      <div className="bg-gray-200 py-8">
        <div className="font-serif text-3xl text-center p-4">
          {"''"} QUOTE OF THE DAY {"''"}
        </div>
        <div className="text-center text-xl px-6">
          “The more that you read, the more things you will know. The more that
          you learn, the more places you’ll go.”
        </div>
      </div>

      {/* Product Section */}
      <div className="px-10 py-12">
        <h2 className="text-3xl font-semibold mb-8 font-serif">Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {bookData.slice(0, 6).map((product, index) => (
            <div
              key={index}
              className="bg-white shadow-lg p-4 rounded-xl transition hover:shadow-xl"
            >
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-60 object-cover rounded-md mb-4"
              />
              <h3 className="text-xl font-bold mb-1">{product.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.author}</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 bg-orange-400 text-white py-2 rounded hover:bg-orange-500"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => handleAddToWishlist(product)}
                  className="flex-1 bg-pink-400 text-white py-2 rounded hover:bg-pink-500"
                >
                  Wishlist
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* More Products Button */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigate("/featured")}
            className="px-6 py-3 bg-orange-500 text-white rounded-md text-lg hover:bg-orange-600 transition" /* include stdio.h conio.h and oops concepts */
          >
            More Products →
          </button>
          <button
            onClick={() => navigate("/download")}
            className="px-6 bg-orange-500 text-white rounded-md text-lg hover: bg-orange-600 transition "
          >
            check out our latest trends on our app
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
