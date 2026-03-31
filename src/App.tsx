
import Greeting from './Greeting.tsx'
import './App.css'

function App() {
  

  return (
    <>
  <Greeting  name="Lucas"/>
  <button onClick={handleClick}>Clique aqui</button>
    </>
  )
}

function handleClick() {
  alert('Botão clicado!');
}
export default App
