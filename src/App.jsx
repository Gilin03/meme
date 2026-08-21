import { useState } from "react";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("오늘도 화이팅!");
  const [fontSize, setFontSize] = useState(40);
  const [textColor, setTextColor] = useState("#ffffff");
  const [aspectRatio, setAspectRatio] = useState("1:1");

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (file.type !== "image/png" && file.type !== "image/jpeg") {
      alert("PNG 또는 JPEG 파일만 사용할 수 있습니다.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>짤·카드 스튜디오</h1>
        <p>이미지와 문구를 조합해 나만의 카드를 만들어보세요.</p>
      </header>

      <main className="studio">
        <section className="controls">
          <h2>편집</h2>

          <div className="control-group">
            <label>이미지</label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleImageUpload}
            />
          </div>

          <div className="control-group">
            <label>문구</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="control-group">
            <label>글자 크기: {fontSize}px</label>
            <input
              type="range"
              min="10"
              max="100"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
          </div>

          <div className="control-group">
            <label>글자 색상</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
            />
          </div>

          <div className="control-group">
            <label>화면 비율</label>

            <div className="ratio-buttons">
              {["1:1", "4:5", "9:16"].map((ratio) => (
                <button
                  key={ratio}
                  className={aspectRatio === ratio ? "active" : ""}
                  onClick={() => setAspectRatio(ratio)}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="preview-section">
          <h2>미리보기</h2>

          <div className={`preview ratio-${aspectRatio.replace(":", "-")}`}>
            {image && (
              <img
                src={image}
                alt="업로드한 이미지"
                className="preview-image"
              />
            )}

            {!image && (
              <span className="empty-preview">
                이미지를 업로드해주세요
              </span>
            )}

            <div
              className="preview-text"
              style={{
                fontSize: `${fontSize}px`,
                color: textColor,
              }}
            >
              {text}
            </div>
          </div>

          <button className="download-button">이미지 다운로드</button>
        </section>
      </main>
    </div>
  );
}

export default App;