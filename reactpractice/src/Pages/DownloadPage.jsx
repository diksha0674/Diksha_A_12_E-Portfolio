import React from "react";
import { FaAndroid, FaApple } from "react-icons/fa";
import bookData from "../utility/data.json";

const DownloadPage = () => {
  return (
    <div className="download-page" style={{ padding: "2rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>
        📚 Download Books & App
      </h1>

      <div
        className="book-list"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "2rem",
          justifyContent: "center",
        }}
      >
        {bookData.map((book, index) => (
          <div
            key={index}
            className="book-card"
            style={{
              border: "1px solid #ddd",
              padding: "1rem",
              borderRadius: "10px",
              maxWidth: "250px",
              textAlign: "center",
            }}
          >
            {book.cover && (
              <img
                src={book.cover}
                alt={book["Book name"]}
                style={{ width: "100%", height: "auto", borderRadius: "8px" }}
              />
            )}
            <h3 style={{ marginTop: "1rem" }}>{book["Book name"]}</h3>
            <p>
              <strong>Author:</strong> {book["Author name"]}
            </p>
            <p style={{ fontSize: "14px", color: "#666" }}>
              {book.description || "No description available."}
            </p>

            <a
              href={book.pdf || "#"}
              download
              style={{
                display: "inline-block",
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#4CAF50",
                color: "#fff",
                borderRadius: "5px",
                textDecoration: "none",
              }}
            >
              📥 Download PDF
            </a>
          </div>
        ))}
      </div>

      <div
        className="app-download"
        style={{ textAlign: "center", marginTop: "4rem" }}
      >
        <h2>📲 Get Our Mobile App</h2>
        <p>Read your favorite books on the go!</p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            marginTop: "1rem",
          }}
        >
          <a
            href="https://play.google.com/store/apps/details?id=your.app.id"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "0.8rem 1.2rem",
              backgroundColor: "#3DDC84",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FaAndroid size={24} /> Android
          </a>
          <a
            href="https://apps.apple.com/app/id0000000000"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "0.8rem 1.2rem",
              backgroundColor: "#000",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FaApple size={24} /> iOS
          </a>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
