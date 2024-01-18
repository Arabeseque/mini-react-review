import React from './core/React.js'
import ReactDom from './core/ReactDom.js'

let showBar = false
function Counter() {
  const Foo = (
    <div>
      <div>Foo</div>
      <div>child1</div>
      <div>child2</div>
    </div>
  )
  const Bar = <div>Bar</div>

  function handleClick() {
    showBar = !showBar
    React.update()
  }

  return (
    <div>
      <div>header</div>
      {showBar && Bar}
      <button onClick={handleClick}>Click me😋</button>
    </div>
  )
}

const App = (
  <div>
    <div>Hello World🏅</div>
    <Counter />
  </div>
)


ReactDom.createRoot(document.getElementById('root')).render(<App />)