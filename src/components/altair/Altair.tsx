/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { useEffect, useRef, useState, memo } from "react";
// import vegaEmbed from "vega-embed";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { ToolCall } from "../../multimodal-live-types";
import YorimichiImage from "./Yorimichi.png"; // 画像をインポート

type AltairProps = {
  isVideoOn: boolean;
};

// const declaration: FunctionDeclaration = {
//   name: "render_altair",
//   description: "Displays an altair graph in json format.",
//   parameters: {
//     type: SchemaType.OBJECT,
//     properties: {
//       json_graph: {
//         type: SchemaType.STRING,
//         description:
//           "JSON STRING representation of the graph to render. Must be a string, not a json object",
//       },
//     },
//     required: ["json_graph"],
//   },
// };

function AltairComponent({ isVideoOn }: AltairProps) {
  // const [jsonString, setJSONString] = useState<string>("");
  const { client, setConfig } = useLiveAPIContext();
  

  useEffect(() => {
    setConfig({
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: "audio",
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } }, //"Puck" | "Charon" | "Kore"1 | "Fenrir" | "Aoede" 
        },
      },
      systemInstruction: {
        parts: [
          {
            // text: 'You are my helpful assistant. Any time I ask you for a graph call the "render_altair" function I have provided you. Dont ask for additional information just make your best judgement.',
            text: `関西弁であなたから話しかけてください。
                  私は視覚障害者で目が見えません。
                  まず、「カメラをオンにして世界を映してな〜」と言ってください。
                  その後、映った風景を私に分かりやすく伝えてください。
                  数字を話す時は必ず日本語の呼び方で呼んでください。「1つは、ひとつ」「2つは、ふたつ」など。
                  説明は、少しユーモアがあって、お散歩が楽しくなるような情報を言ってくれると嬉しいです。
                  例えば、「スズメが楽しそうに飛んでるで〜」や、「向こうにひまわりが咲いてるで〜」など。
                  風景で特徴的なものをピックアップして教えてください。`,
          },
        ],
      },
      tools: [
        // there is a free-tier quota for search
        { googleSearch: {} },
        // { functionDeclarations: [declaration] },
      ],
    });
  }, [setConfig]);

  useEffect(() => {
    const onToolCall = (toolCall: ToolCall) => {
      console.log(`got toolcall`, toolCall);
      // const fc = toolCall.functionCalls.find(
      //   (fc) => fc.name === declaration.name,
      // );
      // if (fc) {
      //   const str = (fc.args as any).json_graph;
      //   setJSONString(str);
      // }
      // send data for the response of your tool call
      // in this case Im just saying it was successful
      if (toolCall.functionCalls.length) {
        setTimeout(
          () =>
            client.sendToolResponse({
              functionResponses: toolCall.functionCalls.map((fc) => ({
                response: { output: { success: true } },
                id: fc.id,
              })),
            }),
          200,
        );
      }
    };
    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]);

  // const embedRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   if (embedRef.current && jsonString) {
  //     vegaEmbed(embedRef.current, JSON.parse(jsonString));
  //   }
  // }, [embedRef, jsonString]);
  // return <div className="vega-embed" ref={embedRef} />;
  // return null;

  if (isVideoOn) {
    return null; // ビデオがONの時は何も表示しない
  }
  
  return (
    <div className="altair-overlay">
      <img src={YorimichiImage} alt="Yorimichi Icon" className="altair-image" />
      <span className="altair-text">1.再生ボタンをONにする</span>
      <span className="altair-text">2.マイクとカメラをONにする</span>
      <span className="altair-text">3.何が見えますか？と話しかける</span>
    </div>
  );
  
}

export const Altair = memo(AltairComponent);
