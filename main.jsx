import React from './core/React.js'
import ReactDom from './core/ReactDom.js'


function Foo() {
  const [count, setCount] = React.useState(0)
  const [bar, setBar] = React.useState('bar')
  function handleClick() {
    setCount(2)
    setBar((s) => s + 'bar')
  }

  React.useEffect(() => {
    console.log("This useEffect should be called once.");

    return () => {
      console.log("clean up - should not be called");
    };
  }, []);

  React.useEffect(() => {
    console.log("This useEffect should be called when count changed.");

    return () => {
      console.log("clean up - should be called");
    };
  }, [count]);

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