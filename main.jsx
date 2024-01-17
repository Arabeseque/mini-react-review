import React from './core/React.js'
import ReactDom from './core/ReactDom.js'
// import App from './App.jsx'

function handleClick() {
  console.log('click')
}

function Counter({ num }) {
  return (
    <div>
      <div >Counter😁 {num}</div>
      <button onClick={handleClick}>Click me😋</button>
    </div>

  )
}

const App = (
  <div>
    <div>Hello World🏅</div>
    <Counter num={1} />
  </div>
)


ReactDom.createRoot(document.getElementById('root')).render(<App />)