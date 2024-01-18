import React from './core/React.js'
import ReactDom from './core/ReactDom.js'

let showBar = true
function Counter() {
  const Foo = <div>Foo</div>
  const Bar = <p>Bar</p>

  function handleClick() {
    showBar = !showBar
    React.update()
  }

  return (
    <div>
      <div>
        {showBar ? Bar : Foo}
      </div>
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