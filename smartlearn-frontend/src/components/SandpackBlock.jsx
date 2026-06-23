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
  } else if (language === 'html' || language === 'css') {
    template = "static";
  }

  // Determine main file based on template
  let mainFile = "/index.js";
  if (template === "react") mainFile = "/App.js";
  else if (template === "react-ts") mainFile = "/App.tsx";
  else if (template === "vue") mainFile = "/src/App.vue";
  else if (language === "html") mainFile = "/index.html";
  else if (language === "css") mainFile = "/styles.css";

  // Construct robust file system
  const files = {
    [mainFile]: { code, active: true }
  };

  // If AI generates raw JS, ensure the HTML root exists and hide it from the user's tabs
  if (template === "vanilla" && mainFile === "/index.js") {
    files["/index.html"] = {
      code: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <title>App</title>\n</head>\n<body>\n  <div id="app"></div>\n  <script src="/index.js"></script>\n</body>\n</html>`,
      hidden: true
    };
    files["/styles.css"] = {
      code: `body { font-family: sans-serif; margin: 0; padding: 16px; color: #fff; background: #09090b; }`,
      hidden: true
    };
  }

  // Generative UI Engine: Inject Tailwind Play CDN and dependencies for React templates
  if (template === "react" || template === "react-ts") {
    files["/public/index.html"] = {
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>App</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { darkMode: 'class' }
  </script>
  <style>
    body { background-color: #09090b; color: #ffffff; margin: 0; padding: 16px; }
  </style>
</head>
<body class="dark">
  <div id="root"></div>
</body>
</html>`,
      hidden: true
    };
  }

  return (
    <div className="w-full h-full bg-[#09090b]">
      <SandpackProvider
        template={template}
        theme="dark"
        files={files}
        customSetup={{
          dependencies: {
            "lucide-react": "latest",
            "recharts": "latest",
            "framer-motion": "latest",
            "react-is": "latest",
            "prop-types": "latest"
          }
        }}
        options={{
          visibleFiles: [mainFile],
          activeFile: mainFile,
          externalResources: ["https://cdn.tailwindcss.com"]
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
