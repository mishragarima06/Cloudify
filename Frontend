import React, { useState, useEffect } from "react";

export default function CloudifyUI() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const generateOTP = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setTimeLeft(120);
    alert("Your OTP is: " + newOtp);
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const verifyOTP = () => {
    if (otp === generatedOtp && timeLeft > 0) {
      setIsVerified(true);
      alert("Login Successful");
    } else {
      alert("Invalid or Expired OTP");
    }
  };

  const classify = (name) => {
    name = name.toLowerCase();
    if (name.endsWith(".pdf")) return "📄 Document";
    if (name.endsWith(".jpg") || name.endsWith(".png")) return "🖼 Image";
    if (name.endsWith(".xlsx")) return "📊 Spreadsheet";
    if (name.endsWith(".py")) return "💻 Code";
    return "📁 Other";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    addFile(droppedFile);
  };

  const handleUpload = (e) => {
    const selectedFile = e.target.files[0];
    addFile(selectedFile);
  };

  const addFile = (file) => {
    if (!file) return;
    const newFile = {
      name: file.name,
      category: classify(file.name),
      size: (file.size / 1024).toFixed(1) + " KB"
    };
    setFiles([newFile, ...files]);
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f172a", color: "white" }}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <h2>Cloudify</h2>
        <p>My Files</p>
        <p>Shared</p>
        <p>Recent</p>
        <p>Starred</p>
        <p>Trash</p>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "20px" }}>
        <h1>Dashboard</h1>

        {/* Search */}
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchStyle}
        />

        {/* Stats */}
        <div style={{ display: "flex", gap: "20px", margin: "20px 0" }}>
          <div style={cardStyle}>{files.length} Files</div>
          <div style={cardStyle}>1.4GB Used</div>
          <div style={cardStyle}>3 Shared</div>
        </div>

        {/* 2FA */}
        <div>
          <button style={btnStyle} onClick={generateOTP}>Generate OTP</button>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={inputStyle}
          />
          <button style={btnStyle} onClick={verifyOTP}>Verify</button>
          {timeLeft > 0 && <p>OTP expires in: {timeLeft}s</p>}
        </div>

        {/* Upload Box */}
        {isVerified && (
          <div
            style={uploadBox}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <p>⬆️ Drag & Drop files here</p>
            <input type="file" onChange={handleUpload} />
          </div>
        )}

        {/* Files */}
        <h3 style={{ marginTop: "20px" }}>Recent Files</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: "15px" }}>
          {filteredFiles.map((f, index) => (
            <div key={index} style={fileCard}>
              <p><b>{f.name}</b></p>
              <p>{f.category}</p>
              <p>{f.size}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const sidebarStyle = {
  width: "200px",
  background: "#020617",
  padding: "20px"
};

const cardStyle = {
  background: "#1e293b",
  padding: "20px",
  borderRadius: "10px",
  flex: 1,
  textAlign: "center"
};

const fileCard = {
  background: "#1e293b",
  padding: "15px",
  borderRadius: "10px"
};

const btnStyle = {
  background: "#3b82f6",
  border: "none",
  padding: "10px 15px",
  margin: "5px",
  color: "white",
  borderRadius: "5px",
  cursor: "pointer"
};

const inputStyle = {
  padding: "10px",
  margin: "5px",
  borderRadius: "5px",
  border: "none"
};

const searchStyle = {
  padding: "10px",
  width: "100%",
  borderRadius: "8px",
  border: "none",
  marginTop: "10px"
};

const uploadBox = {
  border: "2px dashed #3b82f6",
  padding: "40px",
  textAlign: "center",
  borderRadius: "10px",
  background: "#1e293b",
  marginTop: "20px"
};
