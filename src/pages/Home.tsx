import { useHistory } from 'react-router-dom';
import { useState, useContext, FormEvent } from 'react';
import { toast } from "react-hot-toast";

import illustrationImg from '../assets/images/illustration.svg';
import logoImg from '../assets/images/logo.svg';
import logoWhiteImg from '../assets/images/logoWhite.svg';
import googleIconImg from '../assets/images/google-icon.svg';

import { Button } from '../components/Button';

import cx from 'classnames';
import '../styles/auth.scss';
import { useAuth } from '../hooks/useAuth';
import { database } from '../services/firebase';

import { Toggle } from '../components/Toggle';
import { ToggleContext } from '../context/ToggleContext';

const Home = () => {
  const history = useHistory();
  const { user, SignInWithGoogle } = useAuth()
  const [roomCode, setRoomCode] = useState('')

  const { theme } = useContext(ToggleContext)

  const handleCreateRoom = async () => {
    if (!user) {
      await SignInWithGoogle()
    } else {
      history.push('/rooms/new')
    }
  }

  const handleJoinRoom = async (event: FormEvent) => {
    event.preventDefault()

    if (roomCode.trim() === '') {
      return;
    }

    const roomRef = await database.ref(`rooms/${roomCode}`).get();

    if (!roomRef.exists()) {
      alert('Room does not exists.')
      return;
    }

    if (roomRef.val().endedAt) {
      toast.error("A sala que você está tentando entrar já foi encerrada!", {
        style: {
          border: '1px solid #835AFD',
          padding: '18px',
          color: '#835AFD',
          fontSize: '20px'
        },
        iconTheme: {
          primary: '#835AFD',
          secondary: '#FFFAEE',
        }
      })
      return;
    }

    history.push(`/rooms/${roomCode}`);
  }

  return (
    <>
      <div id="page-auth">
        <aside className="aside">
          <img src={illustrationImg} alt="Ilustração simbolizando perguntas e respostas" />
          <strong>Crie salas Q&amp;A ao-vivo</strong>
          <p>Tire as dúvidas da sua audiência em tempo-real</p>
        </aside>

        <main className={cx(
          'main',
          { theme: theme }
        )}>
          <div className="main-content">
            <Toggle />
            <img src={theme ? logoWhiteImg : logoImg} alt="Letmeask" />
            <button onClick={handleCreateRoom} className="create-room">
              <img src={googleIconImg} alt="Logo do Google" />
              Crie sua sala com o Google
            </button>

            <div className="separator">ou entre em uma sala</div>

            <form onSubmit={handleJoinRoom}>
              <input 
                type="text"
                placeholder="Digite o código da sala"
                onChange={event => setRoomCode(event.target.value)}
                value={roomCode}
              />
              <Button type="submit">
                Entrar na sala
              </Button>
            </form>
          </div>
        </main>
      </div>
    </>
  )
}

export { Home };