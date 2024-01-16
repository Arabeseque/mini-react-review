import React from './core/React.js'
import ReactDom from './core/ReactDom.js'
// import App from './App.jsx'

function Counter({ num }) {
  return (
    <div>Counter😁 {num}</div>
  )
}

const App = (
  <div>
    <div>Hello World🏅</div>
    <Counter num={1} />
  </div>
)


ReactDom.createRoot(document.getElementById('root')).render(<App />)