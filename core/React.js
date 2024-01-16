function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child => typeof child === 'object' ? child : createTextElement(child))
        }
    }
}

function createTextElement(text) {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: []
        }
    }
}

function render(element, container) {
    nextUnitOfWork = {
        dom: container,
        type: element.type,
        props: {
            children: [element.type]
        }
    }
    root = nextUnitOfWork
}

function createDom(fiber) {
    const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type)
    fiber.dom = dom
    return dom
}

function addProps(dom, props) {
    const isProperty = key => key !== 'children'
    Object.keys(props)
        .filter(isProperty)
        .forEach(name => {
            dom[name] = props[name]
        })
}

function initChildren(fiber, children) {
    let prevFiber = null
    children.forEach((child, index) => {
        const newFiber = {
            type: child.type,
            props: child.props,
            sibling: null,
            child: null,
            parent: fiber,
            dom: null
        }

        if (index === 0) {
            fiber.child = newFiber
        } else {
            prevFiber.sibling = newFiber
        }
        prevFiber = newFiber
    })
}

function performUnitOfWork(fiber) {
    const isFunctionComponent = fiber.type instanceof Function
    if (!isFunctionComponent) {
        if (!fiber.dom) {
            const dom = createDom(fiber)
            addProps(fiber.dom, fiber.props)

        }
    }


    const children = isFunctionComponent ? [fiber.type(fiber.props)] : fiber.props.children
    initChildren(fiber, children)

    if (fiber.child) {
        return fiber.child
    }

    if (fiber.sibling) {
        return fiber.sibling
    }

    let nextFiber = fiber.parent
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent
    }
}

let root = null
let nextUnitOfWork = null
function workLoop(deadline) {
    let shouldYield = false
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
        shouldYield = deadline.timeRemaining() < 1
    }
    if (!nextUnitOfWork && root) {
        commitRoot()
    }
    requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function commitRoot() {
    commitWork(root.child)
    root = null
}

function commitWork(fiber) {
    if (!fiber) {
        return
    }
    let domParent = fiber.parent
    while (!domParent.dom) {
        domParent = domParent.parent
    }
    if (fiber.dom) {
        domParent.dom.appendChild(fiber.dom)

    }
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

const React = {
    render,
    createElement
}

export default React