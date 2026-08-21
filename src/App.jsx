import { useState, useRef } from "react";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("오늘도 화이팅!");
  const [fontSize, setFontSize] = useState(40);
  const [textColor, setTextColor] = useState("#ffffff");
  const [aspectRatio, setAspectRatio] = useState("1:1");

  const [templates, setTemplates] = useState(() => {
    const savedTemplates = localStorage.getItem("meme-templates");

    return savedTemplates ? JSON.parse(savedTemplates) : [];
  });

  const [editingTemplateId, setEditingTemplateId] = useState(null);

  const [templateName, setTemplateName] = useState("");

  const [textPosition, setTextPosition] = useState({
    x: 50,
    y: 42,
  });

  const [textWidth, setTextWidth] = useState(70);

  const previewRef = useRef(null);
  const draggingRef = useRef(false);
  const resizingRef = useRef(false);

  const wrapText = (ctx, text, maxWidth) => {
    const lines = [];

    // 직접 입력한 줄바꿈도 유지
    const paragraphs = text.split("\n");

    paragraphs.forEach((paragraph) => {
      let currentLine = "";

      for (const char of paragraph) {
        const testLine = currentLine + char;
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = char;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }

      // 빈 줄 유지
      if (paragraph === "") {
        lines.push("");
      }
    });

    return lines;
  };

  const [isTextSelected, setIsTextSelected] = useState(false);

  const saveTemplate = () => {
    if (!templateName.trim()) {
      alert("템플릿 이름을 입력해주세요.");
      return;
    }

    const templateData = {
      name: templateName.trim(),
      image,
      aspectRatio,
      text,
      fontSize,
      textColor,
      textPosition,
      textWidth,
    };

    let updatedTemplates;

    if (editingTemplateId) {
      updatedTemplates = templates.map((template) =>
        template.id === editingTemplateId
          ? {
              ...template,
              ...templateData,
            }
          : template,
      );
    } else {
      updatedTemplates = [
        ...templates,
        {
          id: Date.now(),
          ...templateData,
        },
      ];
    }

    setTemplates(updatedTemplates);

    localStorage.setItem("meme-templates", JSON.stringify(updatedTemplates));

    setTemplateName("");
    setEditingTemplateId(null);

    alert(
      editingTemplateId
        ? "템플릿이 수정되었습니다."
        : "템플릿이 저장되었습니다.",
    );
  };

  const loadTemplate = (template) => {
  if (template.image) {
    setImage(template.image);
  }

  setAspectRatio(template.aspectRatio || "1:1");
  setText(template.text || "");
  setFontSize(template.fontSize || 40);
  setTextColor(template.textColor || "#ffffff");
  setTemplateName(template.name);

  setTextPosition(
    template.textPosition || {
      x: 50,
      y: 50,
    }
  );

  setTextWidth(template.textWidth || 70);

  // ★ 현재 불러온 템플릿을 수정 대상으로 지정
  setEditingTemplateId(template.id);

  alert(`"${template.name}" 템플릿을 불러왔습니다.`);
};

const deleteTemplate = (id) => {
  const updatedTemplates = templates.filter(
    (template) => template.id !== id
  );

  setTemplates(updatedTemplates);

  localStorage.setItem(
    "meme-templates",
    JSON.stringify(updatedTemplates)
  );

  if (editingTemplateId === id) {
    setEditingTemplateId(null);
    setTemplateName("");
  }
};

const exportTemplates = () => {
  if (templates.length === 0) {
    alert("내보낼 템플릿이 없습니다.");
    return;
  }

  const json = JSON.stringify(templates, null, 2);

  const blob = new Blob([json], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "meme-templates.json";

  link.click();

  URL.revokeObjectURL(url);
};

const importTemplates = (event) => {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const importedData = JSON.parse(reader.result);

      if (!Array.isArray(importedData)) {
        throw new Error("템플릿 형식이 올바르지 않습니다.");
      }

      const isValid = importedData.every((template) => {
        return (
          template &&
          typeof template.name === "string" &&
          typeof template.aspectRatio === "string" &&
          typeof template.text === "string" &&
          typeof template.fontSize === "number" &&
          typeof template.textColor === "string" &&
          template.textPosition &&
          typeof template.textPosition.x === "number" &&
          typeof template.textPosition.y === "number" &&
          typeof template.textWidth === "number"
        );
      });

      if (!isValid) {
        throw new Error("필수 템플릿 항목이 없습니다.");
      }

      setTemplates(importedData);

      localStorage.setItem(
        "meme-templates",
        JSON.stringify(importedData)
      );

      alert("템플릿을 가져왔습니다.");
    } catch (error) {
      alert(
        `JSON 파일을 가져올 수 없습니다.\n${error.message}`
      );
    }
  };

  reader.readAsText(file);

  // 같은 파일을 다시 선택할 수 있도록 초기화
  event.target.value = "";
};

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (file.type !== "image/png" && file.type !== "image/jpeg") {
      alert("PNG 또는 JPEG 파일만 사용할 수 있습니다.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleDownload = (format) => {
    if (!image) {
      alert("먼저 이미지를 업로드해주세요.");
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const sizes = {
      "1:1": { width: 1080, height: 1080 },
      "4:5": { width: 1080, height: 1350 },
      "9:16": { width: 1080, height: 1920 },
    };

    const { width, height } = sizes[aspectRatio];

    canvas.width = width;
    canvas.height = height;

    const backgroundImage = new Image();

    backgroundImage.onload = () => {
      const preview = previewRef.current;
      const textElement = preview.querySelector(".preview-text");

      if (!textElement) return;

      const previewRect = preview.getBoundingClientRect();
      const textRect = textElement.getBoundingClientRect();

      // 미리보기와 다운로드 Canvas의 크기 비율
      const scaleX = width / previewRect.width;
      const scaleY = height / previewRect.height;

      // =========================
      // 1. 이미지
      // =========================

      const imageRatio = backgroundImage.width / backgroundImage.height;

      const canvasRatio = width / height;

      let drawWidth;
      let drawHeight;
      let drawX;
      let drawY;

      if (imageRatio > canvasRatio) {
        drawHeight = height;
        drawWidth = height * imageRatio;
        drawX = (width - drawWidth) / 2;
        drawY = 0;
      } else {
        drawWidth = width;
        drawHeight = width / imageRatio;
        drawX = 0;
        drawY = (height - drawHeight) / 2;
      }

      ctx.drawImage(backgroundImage, drawX, drawY, drawWidth, drawHeight);

      // =========================
      // 2. 실제 브라우저 줄바꿈 가져오기
      // =========================

      const textNode = textElement.firstChild;

      if (!textNode || !text) {
        // 문구가 비어 있으면 텍스트 없이 이미지만 다운로드
        const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";

        const extension = format === "jpeg" ? "jpg" : "png";

        const link = document.createElement("a");

        link.download = `meme-${aspectRatio.replace(":", "-")}.${extension}`;

        link.href = canvas.toDataURL(mimeType, 0.95);

        link.click();

        return;
      }
      const lines = [];
      let currentLine = "";
      let previousTop = null;

      for (let i = 0; i < textNode.textContent.length; i++) {
        const char = textNode.textContent[i];

        const range = document.createRange();
        range.setStart(textNode, i);
        range.setEnd(textNode, i + 1);

        const rects = range.getClientRects();

        if (char === "\n") {
          lines.push(currentLine);
          currentLine = "";
          previousTop = null;
          continue;
        }

        if (rects.length === 0) {
          currentLine += char;
          continue;
        }

        const charRect = rects[0];

        if (previousTop !== null && Math.abs(charRect.top - previousTop) > 2) {
          lines.push(currentLine);
          currentLine = "";
        }

        currentLine += char;
        previousTop = charRect.top;
      }

      if (currentLine) {
        lines.push(currentLine);
      }

      // =========================
      // 3. 실제 미리보기 글자 스타일
      // =========================

      const computedStyle = window.getComputedStyle(textElement);

      const previewFontSize = parseFloat(computedStyle.fontSize);

      const previewLineHeight = parseFloat(computedStyle.lineHeight);

      const fontSizePx = previewFontSize * scaleX;

      const lineHeightPx = previewLineHeight * scaleY;

      ctx.fillStyle = computedStyle.color;
      ctx.font = `${computedStyle.fontWeight} ${fontSizePx}px Arial`;

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // =========================
      // 4. 미리보기 텍스트 중심 위치
      // =========================

      const textCenterX =
        (textRect.left - previewRect.left + textRect.width / 2) * scaleX;

      const textCenterY =
        (textRect.top - previewRect.top + textRect.height / 2) * scaleY;

      const totalHeight = lines.length * lineHeightPx;

      // =========================
      // 5. 텍스트 그리기
      // =========================

      lines.forEach((line, index) => {
        const lineY =
          textCenterY -
          totalHeight / 2 +
          index * lineHeightPx +
          lineHeightPx / 2;

        ctx.fillText(line, textCenterX, lineY);
      });

      // =========================
      // 6. 다운로드
      // =========================

      const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";

      const extension = format === "jpeg" ? "jpg" : "png";

      const link = document.createElement("a");

      link.download = `meme-${aspectRatio.replace(":", "-")}.${extension}`;

      link.href = canvas.toDataURL(mimeType, 0.95);

      link.click();
    };

    backgroundImage.src = image;
  };

  const handleTextMouseDown = (event) => {
    setIsTextSelected(true);

    if (resizingRef.current) return;

    event.preventDefault();

    draggingRef.current = true;

    const preview = previewRef.current;
    const rect = preview.getBoundingClientRect();

    const startMouseX = event.clientX;
    const startMouseY = event.clientY;

    const startX = textPosition.x;
    const startY = textPosition.y;

    const handleMouseMove = (moveEvent) => {
      if (!draggingRef.current) return;

      const deltaX = ((moveEvent.clientX - startMouseX) / rect.width) * 100;

      const deltaY = ((moveEvent.clientY - startMouseY) / rect.height) * 100;

      setTextPosition({
        x: Math.min(100, Math.max(0, startX + deltaX)),
        y: Math.min(100, Math.max(0, startY + deltaY)),
      });
    };

    const handleMouseUp = () => {
      draggingRef.current = false;

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleResizeMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();

    resizingRef.current = true;

    const preview = previewRef.current;
    const rect = preview.getBoundingClientRect();

    const startMouseX = event.clientX;
    const startWidth = textWidth;

    const handleMouseMove = (moveEvent) => {
      const deltaX = ((moveEvent.clientX - startMouseX) / rect.width) * 100;

      const newWidth = Math.min(95, Math.max(20, startWidth + deltaX));

      setTextWidth(newWidth);
    };

    const handleMouseUp = () => {
      resizingRef.current = false;

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
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

<div className="control-group">
  <label>템플릿</label>

  <input
    type="text"
    placeholder="템플릿 이름"
    value={templateName}
    onChange={(e) => setTemplateName(e.target.value)}
  />

  <button
    className="template-save-button"
    onClick={saveTemplate}
  >
    {editingTemplateId
      ? "템플릿 수정"
      : "템플릿 저장"}
  </button>

 <div className="template-list">
  <label>저장된 템플릿</label>

<button
  type="button"
  onClick={exportTemplates}
>
  JSON 내보내기
</button>

<label className="json-import-button">
  JSON 가져오기

  <input
    type="file"
    accept=".json,application/json"
    onChange={importTemplates}
    hidden
  />
</label>

  {templates.length === 0 ? (
    <p className="empty-template">
      저장된 템플릿이 없습니다.
    </p>
  ) : (
    templates.map((template) => (
      <div
        className="template-item"
        key={template.id}
      >
        {/* 템플릿 이름 */}
        <span>{template.name}</span>

        {/* 버튼 */}
        <div className="template-actions">
          <button
            type="button"
            onClick={() => loadTemplate(template)}
          >
            불러오기
          </button>

          <button
            type="button"
            onClick={() => deleteTemplate(template.id)}
          >
            삭제
          </button>
        </div>
      </div>
    ))
  )}
</div>
</div>
        </section>

        <section className="preview-section">
          <h2>미리보기</h2>

          <div
            ref={previewRef}
            className={`preview ratio-${aspectRatio.replace(":", "-")}`}
            onClick={() => setIsTextSelected(false)}
          >
            {image && (
              <img
                src={image}
                alt="업로드한 이미지"
                className="preview-image"
              />
            )}

            {!image && (
              <span className="empty-preview">이미지를 업로드해주세요</span>
            )}

            <div
              className={`text-box ${isTextSelected ? "selected" : ""}`}
              style={{
                left: `${textPosition.x}%`,
                top: `${textPosition.y}%`,
                width: `${textWidth}%`,
                transform: "translate(-50%, -50%)",
              }}
              onMouseDown={handleTextMouseDown}
              onClick={(e) => {
                e.stopPropagation();
                setIsTextSelected(true);
              }}
            >
              <div
                className="preview-text"
                style={{
                  fontSize: `${fontSize}px`,
                  color: textColor,
                }}
              >
                {text}
              </div>

              <div
                className="resize-handle"
                onMouseDown={handleResizeMouseDown}
              />
            </div>
          </div>

          <div className="download-buttons">
            <button
              className="download-button"
              onClick={() => handleDownload("png")}
            >
              PNG 다운로드
            </button>

            <button
              className="download-button"
              onClick={() => handleDownload("jpeg")}
            >
              JPEG 다운로드
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
