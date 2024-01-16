import React from './React.js'

function createRoot(container) {
    return {
        render(element) {
            React.render(element, container)
        }
    }
}

const ReactDom = {
    createRoot
}

export default ReactDom