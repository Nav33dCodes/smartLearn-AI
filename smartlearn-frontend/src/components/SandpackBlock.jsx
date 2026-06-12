import React from 'react';
import { Sandpack } from "@codesandbox/sandpack-react";

export default function SandpackBlock({ code, language }) {
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
    <div className="w-full rounded-2xl overflow-hidden shadow-2xl my-6 border border-white/10 bg-[#09090b]">
      <Sandpack
        template={template}
        theme="dark"
        files={{
          [mainFile]: code
        }}
        options={{
          showNavigator: true,
          showTabs: true,
          closableTabs: false,
          editorHeight: 500,
          wrapContent: true,
        }}
      />
    </div>
  );
}
