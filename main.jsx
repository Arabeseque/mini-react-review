import React from './core/React.js'
import ReactDom from './core/ReactDom.js'

let count = 0
function Counter({ num }) {
  function handleClick() {
    console.log('click')
    count++
    React.update()
  }

  return (
    <div>
      Counter😁 {count}
      <button onClick={handleClick}>Click me😋</button>
    </div>
  )
}

const App = (
  <div>
    <div>Hello World🏅</div>
    <Counter num={count} />
  </div>
)


ReactDom.createRoot(document.getElementById('root')).render(<App />)