import React from './core/React.js'
import ReactDom from './core/ReactDom.js'


function Foo() {
  const [count, setCount] = React.useState(0)
  const [bar, setBar] = React.useState('bar')
  function handleClick() {
    setCount((c) => c + 1)
    setBar((s) => s + 'bar')
  }

  return (
    <div>
      <div>Foo</div>
      <div>{count}</div>
      <div>{bar}</div>
      <button onClick={handleClick}>add</button>
    </div>
  )
}

const App = (
  <div>
    <div>Hello World🏅</div>
    <Foo />
  </div>
)


ReactDom.createRoot(document.getElementById('root')).render(<App />)