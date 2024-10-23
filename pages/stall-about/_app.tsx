import '../../styles/global.css'; 
import '../../styles/globals.css';
import Head from 'next/head';
import { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Silkscreen&display=swap" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
