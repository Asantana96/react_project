import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import Logout from "./pages/auth/LogoutPage";
import DefaultHome from "./pages/DefaultHome";
import { useAuth0 } from "@auth0/auth0-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useMemo } from "react";
import { Container } from "react-bootstrap";
import { useLocalStorage } from "./useLocalStorage";
import { v4 as uuidV4 } from "uuid";
import { NoteList } from "./NoteList";
import { NoteLayout } from "./NoteLayout";
import { Note } from "./Note";
import { EditNote } from "./EditNote";
import { NewNote } from "./NewNote";

type RawNote = {
  id: string;
  title: string;
  content: string;
  tagIds: string[];
};

type Tag = {
  id: string;
  label: string;
};

type NoteData = {
  title: string;
  content: string;
  tags: Tag[];
};

function App() {
  const { isAuthenticated } = useAuth0();

  const [notes, setNotes] = useLocalStorage<RawNote[]>("NOTES", []);
  const [tags, setTags] = useLocalStorage<Tag[]>("TAGS", []);

  const notesWithTags = useMemo(() => {
    return notes.map((note) => {
      return { ...note, tags: tags.filter((tag) => note.tagIds.includes(tag.id)) };
    });
  }, [notes, tags]);

  function onCreateNote({ tags, ...data }: NoteData) {
    setNotes((prevNotes) => {
      return [
        ...prevNotes,
        { ...data, id: uuidV4(), tagIds: tags.map((tag) => tag.id) },
      ];
    });
  }

  function onUpdateNote(id: string, { tags, ...data }: NoteData) {
    setNotes((prevNotes) => {
      return prevNotes.map((note) => {
        if (note.id === id) {
          return { ...note, ...data, tagIds: tags.map((tag) => tag.id) };
        } else {
          return note;
        }
      });
    });
  }

  function onDeleteNote(id: string) {
    setNotes((prevNotes) => {
      return prevNotes.filter((note) => note.id !== id);
    });
  }

  function addTag(tag: Tag) {
    setTags((prev) => [...prev, tag]);
  }

  function updateTag(id: string, label: string) {
    setTags((prevTags) => {
      return prevTags.map((tag) => {
        if (tag.id === id) {
          return { ...tag, label };
        } else {
          return tag;
        }
      });
    });
  }

  function deleteTag(id: string) {
    setTags((prevTags) => {
      return prevTags.filter((tag) => tag.id !== id);
    });
  }

  if (isAuthenticated) {
    return (
      <Container className="my-4">
        <Routes>
          <Route
            path="/"
            element={
              <NoteList
                notes={notesWithTags}
                availableTags={tags}
                onUpdateTag={updateTag}
                onDeleteTag={deleteTag}
              />
            }
          />
          <Route
            path="/new"
            element={<NewNote onCreate={onCreateNote} onAddTag={addTag} availableTags={tags} />}
          />
          <Route
            path="/:id"
            element={
              <NoteLayout
                onDelete={onDeleteNote}
                onUpdate={onUpdateNote}
                availableTags={tags}
              />
            }
          >
            <Route path="/" element={<Note />} />
            <Route
              path="/edit"
              element={<EditNote onUpdate={onUpdateNote} onAddTag={addTag} availableTags={tags} />}
            />
          </Route>
          <Navigate to="/" replace />
        </Routes>
      </Container>
    );
  } else {
    return (
      <Container className="my-4">
        <Routes>
          <Route path="/" element={<DefaultHome />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/logout" element={<Logout />} />
          <Navigate to="/login" replace />
        </Routes>
      </Container>
    );
  }
}

ReactDOM.render(
  <React.StrictMode>
    <Auth0Provider
      domain="dev-zraqxf7q6yukvb10.us.auth0.com"
      clientId="jRumlgq6nUbfi8PaOJ0Ci8jlRFPlEoaq"
      redirectUri={window.location.origin}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

