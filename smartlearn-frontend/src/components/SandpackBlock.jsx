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
  let mainFile = "/index.js";
  if (template === "react") mainFile = "/App.js";
  else if (template === "react-ts") mainFile = "/App.tsx";
  else if (template === "vue") mainFile = "/src/App.vue";

  return (
    <div className="w-full h-full bg-[#09090b]">
      <SandpackProvider
        template={template}
        theme="dark"
        files={{
          [mainFile]: code
        }}
      >
        <SandpackLayout style={{ border: 'none', height: '100%', minHeight: '100%', background: 'transparent' }}>
          {viewMode === "code" && (
            <SandpackCodeEditor 
              showTabs={true} 
              showLineNumbers={true}
              style={{ height: "100%", minHeight: "100%" }} 
            />
          )}
          {viewMode === "preview" && (
            <SandpackPreview 
              showNavigator={true} 
              showOpenInCodeSandbox={false}
              style={{ height: "100%", minHeight: "100%", flexGrow: 1 }} 
            />
          )}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
