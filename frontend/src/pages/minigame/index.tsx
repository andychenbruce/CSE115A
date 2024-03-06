import React, { useState, useEffect, DragEventHandler } from "react";
import { Navbar } from "../../navbar";
//import "./sty.css"
import {
  ENDPOINT_LIST_CARDS,
  ListCards,
  ListCardsResponse,
} from "../../backend_interface";
import { send_json_backend, get_session_token, get_user_id } from "../../utils";
import { Button } from "@mui/material";

interface Card {
  question: string;
  answer: string;
}

const App: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Card[]>([]);
  const [rightCard, setRightCard] = useState<Card>();
  const [leftCard, setLeftCard] = useState<Card>();
  const [_visibleFlashcards, setVisibleFlashcards] = useState<number>(4);
  const [shuffledFlashcards, setShuffledFlashcards] = useState<Card[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  //const [droppedItems, setDroppedItems] = useState<Card[]>([]);

  const get_deckid = () => {
    const urlString = window.location.href;
    const url = new URL(urlString);
    const searchParams = new URLSearchParams(url.search);
    const deckIdJSON = searchParams.get("deck");
    const deckId = deckIdJSON ? JSON.parse(deckIdJSON) : null;
    return deckId;
  };

  const check_correct = () => {
    if (rightCard?.answer == leftCard?.answer) {
      console.log("IT'S RIGHT!");
    } else {
      console.log("IT'S WRONG!");
    }
  };
  const resetCards = () => {
    setLeftCard(undefined);
    setRightCard(undefined);
    setIsCorrect(null);
  };

  const nextHandler = () => {
    resetCards();
    shuffleHandler();
  };


  const listCards = () => {
    let deckId = get_deckid();
    let access_token = get_session_token();
    let user_id = get_user_id();
    if (access_token == null || user_id == null) {
      return;
    }
    let prev_cards: ListCards = {
      user_id: user_id,
      deck_id: deckId,
    };
    send_json_backend(ENDPOINT_LIST_CARDS, JSON.stringify(prev_cards))
      .then((data: ListCardsResponse) => {
        console.log("Prev_Cards:", data);
        setFlashcards(data.cards);
        //console.log(flashcards);
      })
      .catch((error) => {
        console.error("Error displaying cards:", error);
      });
  };

  useEffect(() => {
    listCards();
  }, []);

  const handleDragStart = (
    e: React.DragEvent<HTMLButtonElement>,
    card: Card,
  ) => {
    e.dataTransfer.setData("card", JSON.stringify(card));
  };

  const handleDragOver: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
  };

  const handleDropLeft: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const droppedCard = JSON.parse(e.dataTransfer.getData("card"));
    setLeftCard(droppedCard);
    console.log(leftCard)
    //submitHandler();
  };

  const handleDropRight: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const droppedCard = JSON.parse(e.dataTransfer.getData("card"));
    setRightCard(droppedCard);
    //submitHandler();
  };

  function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const shuffleHandler = () => {
    const rand = getRandomInt(4, flashcards.length);
    const newFlashcards = flashcards.slice(rand - 4, rand);
    const shuffledNewFlashcards = [...newFlashcards].sort(
      () => Math.random() - 0.5,
    );
    setShuffledFlashcards(shuffledNewFlashcards);
    setVisibleFlashcards(4);
  };

  useEffect(() => {
    shuffleHandler();
  }, []);

  const submitHandler = () => {
   //console.log(leftCard, rightCard)
    if (leftCard != undefined && rightCard != undefined) {
      if (leftCard.answer === rightCard.answer) {
        setIsCorrect(true);
      } else {
        setIsCorrect(false);
      }
    }
  };
  useEffect(() => {
    // This effect will be triggered whenever leftCard.question changes
    // You can perform any action here that you want to happen when the question changes
    if (leftCard) {
      submitHandler();    }
}, [leftCard]); // Re-run the effect whenever leftCard changes
useEffect(() => {
  // This effect will be triggered whenever leftCard.question changes
  // You can perform any action here that you want to happen when the question changes
  if (rightCard) {
    submitHandler();  }
}, [rightCard]); // Re-run the effect whenever leftCard changes


  return (
    <div>
      <Navbar />
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>Match-Minigame</h1>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "20px",
        }}
      >
        <div style={{ width: "25%", marginRight: "20px" }}>
          
          {shuffledFlashcards
          .sort(() => Math.random() * 100.12012)
          .map((flashcard, index) => (
              <div key={index} style={{ marginBottom: "10px" }}>
                <button
                  draggable
                  onDragStart={(e) => handleDragStart(e, flashcard)}
                  onClick={() => {
                    setLeftCard(flashcard);
                    check_correct();
                  }}
                  style={{ ...buttonStyle, width: "100%" }}
                >
                  {flashcard.question}
                </button>
              </div>
            ))}
        </div>

        <div
          style={{
            width: "30%",
            border: "1px dashed #ccc",
            padding: "20px",
            height: "200px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            backgroundColor: isCorrect === false ? "red" : isCorrect === true ? "green" : "inherit",
                  }}
          onDragOver={handleDragOver}
          onDrop={handleDropLeft}
        >
          <h2>Question </h2>
          {leftCard && <div>{leftCard.question}</div>}
        </div>

        <div
  style={{
    width: "30%",
    border: "1px dashed #ccc",
    padding: "20px",
    height: "200px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    backgroundColor: isCorrect === false ? "red" : isCorrect === true ? "green" : "inherit",
          }}
          onDragOver={handleDragOver}
          onDrop={handleDropRight}
        >
          <h2>Answer</h2>
          {rightCard && <div>{rightCard.answer}</div>}
        </div>


        <div style={{ width: "25%", marginLeft: "20px" }}>
          {shuffledFlashcards
          .sort(() => Math.random() - 0.5)
            //.slice(0, visibleFlashcards)
            .map((flashcard, index) => (
              <div key={index} style={{ marginBottom: "10px" }}>
                <button
                  draggable
                  onDragStart={(e) => handleDragStart(e, flashcard)}
                  onClick={() => {
                    setRightCard(flashcard);
                    check_correct();
                  }}
                  style={{ ...buttonStyle, width: "100%" }}
                >
                  {flashcard.answer}
                </button>
              </div>
            ))}
        </div>
      </div>
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}
      >
        <Button onClick={shuffleHandler} style={{ marginRight: "10px", backgroundColor: "white" }}>
          Start
        </Button>
        <Button onClick={nextHandler} style={{ marginRight: "10px", backgroundColor: "white" }}>Next</Button>
      </div>
    </div>
  );
};

const buttonStyle = {
  backgroundColor: "#fff",
  border: "1px solid #ccc",
  borderRadius: "5px",
  padding: "25%",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  cursor: "pointer",
  transition: "background-color 0.3s",
};
export default App;