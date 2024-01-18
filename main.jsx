import React from './core/React.js'
import ReactDom from './core/ReactDom.js'


let countFoo = 0
function Foo() {
  const update = React.update()

  function handleClick() {
    countFoo++
    console.log('clickFoo')
    update()
  }

  return <div onClick={handleClick}>Foo {countFoo}</div>
}

let countBar = 0
function Bar() {
  const update = React.update()

  function handleClick() {
    countBar++
    console.log('clickBar')
    update()
  }

  return <div onClick={handleClick}>Bar {countBar}</div>
}


const App = (
  <div>
    <div>Hello World🏅</div>
    <Foo />
    <Bar />
  </div>
)


ReactDom.createRoot(document.getElementById('root')).render(<App />)