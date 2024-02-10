import React, {
  Dispatch,
  useState,
  ChangeEventHandler,
  useEffect,
} from "react";
import { Navbar } from "../../navbar";
import {
  Dialog,
  Button,
  DialogTitle,
  DialogActions,
  TextField,
  Grid,
} from "@mui/material";
import {
  UploadPdf,
  CreateCardDeck,
  ListCardDecks,
  ListCardDecksResponse,
  CardDeck,
} from "../../backend_interface";
import { send_json_backend, get_session_token } from "../../utils";

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [deckName, setDeckName] = useState("");
  const [decks, setDecks]: [CardDeck[], Dispatch<CardDeck[]>] = useState(
    [] as CardDeck[],
  );

  const updateDecks = () => {
    let token = get_session_token();
    if (token == null) {
      return;
    }
    let request: ListCardDecks = { access_token: token };
    send_json_backend("/list_card_decks", JSON.stringify(request))
      .then((data: ListCardDecksResponse) => {
        setDecks(data.decks);
      })
      .catch((error) => {
        console.error("Error in:", error);
      });
    return;
  };

  useEffect(updateDecks, [setDecks]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const { value } = event.target;
    setDeckName(value);
  };

  const handleCreateButtonClick = () => {
    setOpenCreateDialog(true);
  };

  const handleCreateConfirm = () => {
    let access_token = get_session_token();
    if (access_token == null) {
      return;
    }
    console.log("access token = ", access_token);
    let request: CreateCardDeck = {
      access_token: access_token,
      deck_name: deckName,
    };
    send_json_backend("/create_card_deck", JSON.stringify(request))
      .then((data: null) => {
        console.log("ok: ", data);
        updateDecks();
      })
      .catch((error) => {
        console.error("Error in:", error);
      });
    setOpenCreateDialog(false);
  };

  const handleCreateDialogClose = () => {
    setOpenCreateDialog(false);
  };

  const handleChangeFile: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (event.target.files == null) {
      console.error("missing file");
    } else {
      let input_file = event.target.files[0];
      setFile(input_file);
    }
  };

  function getBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.onerror = reject;
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
    });
  }

  const pdfSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (file == null) {
      console.error("missing file");
      return;
    }

    getBase64(file).then((base64_encode: string) => {
      let request_json: UploadPdf = {
        access_token: [123, 456], //todo
        deck_id: 123, //todo
        file_bytes_base64: base64_encode,
      };
      return send_json_backend(
        "/create_card_deck_pdf",
        JSON.stringify(request_json),
      );
    });
  };
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {};

  return (
    <div>
      <Navbar />

      <Grid container rowSpacing={1} columnSpacing={{ xs: 1 }}>
        {decks.map((deck) => (
          <>
            <Grid item xs={6}>
              {JSON.stringify(deck)}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={() => {
                  const url = new URL(
                    "http://localhost:8000/flashcard_viewer/",
                  );
                  url.searchParams.append("deck", JSON.stringify(deck.deck_id));

                  window.location.href = url.toString();
                }}
              >
                hi
              </Button>
            </Grid>
          </>
        ))}
      </Grid>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        onClick={handleCreateButtonClick}
      >
        +
      </Button>

      <Dialog
        open={openCreateDialog}
        onClose={handleCreateDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Select a Set creation method:
        </DialogTitle>
        <DialogActions>
          <Button
            type="submit"
            variant="contained"
            onClick={handleCreateConfirm}
            color="primary"
            fullWidth
          >
            Create Your Own!
          </Button>

          <TextField
            style={{
              marginBottom: 20,
            }}
            label="Deck Name"
            variant="outlined"
            fullWidth
            name="deck_name"
            value={deckName}
            onChange={handleInputChange}
            required
          />

          <Button variant="contained" component="label" fullWidth>
            Upload File
            <input type="file" hidden onChange={handleChangeFile} />
          </Button>

          <Button onClick={handleCreateDialogClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default App;