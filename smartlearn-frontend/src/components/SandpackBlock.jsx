import React from 'react';
import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackCodeEditor, 
  SandpackPreview 
} from "@codesandbox/sandpack-react";

export default function SandpackBlock({ code, language, viewMode = "preview" }) {
  // Infer template based on language or hints in the code
  let template = "vanilla";
  if (language === 'react' || language === 'jsx' || code.includes('import React')) {
    template = "react";
  } else if (language === 'vue') {
    template = "vue";
  } else if (language === 'typescript' || language === 'tsx') {
    template = "react-ts";
  }

  // Determine main file based on template
  let mainFile = "/src/index.js";
  if (template === "react") mainFile = "/App.js";
  else if (template === "react-ts") mainFile = "/App.tsx";
  else if (template === "vue") mainFile = "/src/App.vue";
  else if (language === "html") mainFile = "/index.html";
  else if (language === "css") mainFile = "/src/styles.css";

  // Construct robust file system
  const files = {
    [mainFile]: { code, active: true }
  };

  // If AI generates raw JS, ensure the HTML root exists and hide it from the user's tabs
  if (template === "vanilla" && mainFile === "/src/index.js") {
    files["/index.html"] = {
      code: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <title>App</title>\n</head>\n<body>\n  <div id="app"></div>\n  <script src="/src/index.js"></script>\n</body>\n</html>`,
      hidden: true
    };
    files["/src/styles.css"] = {
      code: `body { font-family: sans-serif; }`,
      hidden: true
    };
  }

  return (
    <div className="w-full h-full bg-[#09090b]">
      <SandpackProvider
        template={template}
        theme="dark"
        files={files}
        options={{
          visibleFiles: [mainFile],
          activeFile: mainFile
        }}
      >
        <SandpackLayout style={{ border: 'none', height: 'calc(100vh - 56px)', minHeight: 'calc(100vh - 56px)', background: 'transparent' }}>
          {viewMode === "code" && (
            <SandpackCodeEditor 
              showTabs={true} 
              showLineNumbers={true}
              style={{ height: "calc(100vh - 56px)", minHeight: "calc(100vh - 56px)" }} 
            />
          )}
          {viewMode === "preview" && (
            <SandpackPreview 
              showNavigator={true} 
              showOpenInCodeSandbox={false}
              style={{ height: "calc(100vh - 56px)", minHeight: "calc(100vh - 56px)", flexGrow: 1 }} 
            />
          )}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
