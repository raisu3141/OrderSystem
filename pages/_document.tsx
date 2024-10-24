import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* ここにカスタムフォントのリンクを追加 */}
        <link
          href="https://fonts.googleapis.com/css2?family=Silkscreen&display=swap"
          rel="stylesheet"
        />
      </Head> 
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
