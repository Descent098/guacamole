import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

import { useSession, signIn, signOut } from "next-auth/react";
import ChessBoard from "../components/chessboard/ChessBoard";
import { IMatch } from "../models/Match";
import { useEffect, useState } from "react";
import { Chess } from "chess.js"

// Make the `request` function generic
// to specify the return data type:
function request<T>(
  url: string,
  // `RequestInit` is a type for configuring 
  // a `fetch` request. By default, an empty object.
  config: RequestInit = {}

  // This function is async, it will return a Promise:
): Promise<T> {

  // Inside, we call the `fetch` function with 
  // a URL and config given:
  return fetch(url, config)
    // When got a response call a `json` method on it
    .then((response) => response.json())
    // and return the result data.
    .then((data) => data as T);

  // We also can use some post-response
  // data-transformations in the last `then` clause.
}



const Home: NextPage = () => {
  const { data: session } = useSession();
  const [state, setState] = useState<Chess>();
  useEffect(() => {
    if (!state) {
      request<IMatch>("/api/match").then((result) => {
        console.log(result)
        let chess = new Chess();
        chess.loadPgn(result.pgn);
        setState(chess);
      });
    }

  }, [state]);

  const signin = session ? (
    <div>
      Signed in as {session.user?.email}
      <br />
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  ) : (
    <div>
      Not signed in.
      <br />
      <button onClick={() => signIn()}>Sign in</button>
    </div>
  );


  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {signin}

      <main>
        {state && <ChessBoard board={state} isPlayerWhite={true} />}
      </main>

    </div>
  );
};

export default Home;
