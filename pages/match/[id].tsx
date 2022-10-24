import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../../styles/Home.module.css";
import { useRouter } from 'next/router'

import { useSession, signIn, signOut } from "next-auth/react";
import { IMatch } from "../../models/Match";
import { useEffect, useState } from "react";
import { Chess } from "chess.js"

import ChessBoard from "../../components/chessboard/ChessBoard";

import SocketIO, { io, Socket } from "socket.io-client";

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


const socket = SocketIO();

socket.on('notif', (msg) => {
    console.log(msg)
})


interface PlayInteface {
    board: Chess,
    moves: string[]
    input: string
}

const defaultProps = {
    board: new Chess(),
    moves: [],
    input: '',
}






let isInitialLoad = true;

const Home: NextPage = () => {
    const { data: session } = useSession();
    const [state, setState] = useState<PlayInteface>(defaultProps);
    const router = useRouter();
    const { id } = router.query;

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const old = { ...state };
        old.input = e.target.value;
        setState(old);
    }

    // create a function for making a move
    function transmitMove(socket: Socket) {
        // sends the move over the socket to the opposite player
    }

    useEffect(() => {
        // load the match id from the database
        if (isInitialLoad) {
            request<IMatch>(`/api/match/6355e10a9efe7f3ce4f1fbea`).then((result) => {
                console.log(result)
                let chess = new Chess();
                chess.loadPgn(result.pgn);

                console.log(chess.moves())

                setState({ ...state, board: chess });
            });

            socket.emit("match_connect", "6355e10a9efe7f3ce4f1fbea")
            isInitialLoad = false;
        }

        console.log("state change!");

    });

    // set socket move handler
    socket.on("move", (msg) => {

        if (state) {
            console.log("Received move: " + msg);
            console.log(state.board.moves())
            let s = new Chess(state.board.fen());
            let result = s.move(msg)

            console.log(s.moves())

            if (result) {
                console.log("update!")
                setState({
                    ...state,
                    board: s,
                    moves: [...state.moves, msg]
                });
                console.log(s.board())
            }
        }


    });

    const emit_message = () => {

        let s = new Chess(state.board.fen());
        let result = s.move(state.input)

        if (result) {
            socket.emit('notif', { game: id, move: state.input });

            setState({
                ...state,
                board: s,
                moves: [...state.moves, state.input]
            })
        }

    };

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


    const moves_cmpnt = state.moves?.map((str, i) => <li key={i}>{str}</li>)


    return (
        <div className={styles.container}>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {signin}

            <main>
                <div>Match: {id}</div>

                {state && <ChessBoard board={state.board} isPlayerWhite={true} selection="" setSelection={() => { }} />}
            </main>


            <input value={state.input} onChange={handleChange}></input>
            <button onClick={emit_message}>emit message</button>

            <h2>Moves</h2>
            <ol>
                {state.moves && moves_cmpnt}
            </ol>
        </div>
    );
};

export default Home;
