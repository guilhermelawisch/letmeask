import { FormEvent, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import logoImg from '../assets/images/logo.svg';

import { Button } from "../components/Button";
import { RoomCode } from "../components/RoomCode";
import { useAuth } from "../hooks/useAuth";

import '../styles/room.scss';
import { database } from "../services/firebase";

type IFirebaseQuestions = Record<string, {
  author: {
    name: string;
    avatar: string;
  }
  content: string;
  isAnswer: boolean;
  isHighlighted: boolean;
}>

type IQuestion = {
  id: string;
  author: {
    name: string;
    avatar: string;
  }
  content: string;
  isAnswer: boolean;
  isHighlighted: boolean;
}

interface IRoomParams {
  id: string;
}

const Room = () => {
  const { user } = useAuth();
  const params = useParams<IRoomParams>();
  const roomId = params.id;

  const [newQuestion, setNewQuestion] = useState('');
  const [questions, setQuestions] = useState<IQuestion[]>([])
  const [title, setTitle] = useState('')

  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`);

    roomRef.on('value', room => {
      const databaseRoom = room.val()
      const firebaseQuestions = databaseRoom.questions as IFirebaseQuestions ?? {};

      const parsedQuestions = Object.entries(firebaseQuestions).map(([key, value]) => {
        return {
          id: key,
          content: value.content,
          author: value.author,
          isHighlighted: value.isHighlighted,
          isAnswer: value.isAnswer
        }
      })

      setTitle(databaseRoom.title)
      setQuestions(parsedQuestions)
    })
  }, [roomId])

  const handleSendQuestion = async (event: FormEvent) => { 
    event.preventDefault();

    if (newQuestion.trim() === '') {
      return;
    }

    if (!user) {
      toast.error("You must be logged in");
    }

    const question = {
      content: newQuestion,
      author: {
        name: user?.name,
        avatar: user?.avatar
      },
      isHighlighted: false,
      isAnswer: false
    }

    await database.ref(`rooms/${roomId}/questions`).push(question)

    setNewQuestion('')
  }

  return (
    <>
      <div id="page-room">
        <header>
          <div className="content">
            <img src={logoImg} alt="Letmeask" />
            <RoomCode code={roomId}/>
          </div>
        </header>

        <main>
          <div className="room-title">
            <h1>Sala {title}</h1>
            { questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
          </div>

          <form onSubmit={handleSendQuestion}>
            <textarea 
              placeholder="O que você deseja perguntar"
              onChange={event => setNewQuestion(event.target.value)}
              value={newQuestion}
            />
            <div className="form-footer">
              { user ? (
                <div className="user-info">
                  <img src={user.avatar} alt={user.name} />
                  <span>{user.name}</span>
                </div>
              ) : (
                <span>Para enviar uma pergunta, <button>faça seu login</button>.</span>
              ) }
              <Button type="submit" disabled={!user}>Enviar pergunta</Button>
            </div>
          </form>

          {JSON.stringify(questions)}
        </main>
      </div>
    </>
  )
}

export { Room };