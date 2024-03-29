function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child => (typeof child === 'number' || typeof child === 'string') ? createTextElement(child) : child)
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
    wipRoot = nextUnitOfWork
}

function createDom(fiber) {
    const dom = fiber.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(fiber.type)
    fiber.dom = dom
    return dom
}

function addProps(dom, nextProps, prevProps = {}) {
    Object.keys(prevProps).forEach(name => {
        if (name !== 'children' && !nextProps.hasOwnProperty(name)) {
            dom[name] = ''
        }
    })

    // 1. 在nextProps 不在prevProps
    Object.keys(nextProps).forEach(name => {
        if (name.startsWith('on')) {
            const eventType = name.toLowerCase().substring(2)
            dom.removeEventListener(eventType, prevProps[name])
            dom.addEventListener(eventType, nextProps[name])
        }
        if (name !== 'children' && prevProps[name] !== nextProps[name]) {
            dom[name] = nextProps[name]
        }
    })
}

function reconcileChildren(fiber, children) {
    let oldFiber = fiber.alternate?.child
    let prevFiber = null
    children.forEach((child, index) => {
        const isSameType = child && oldFiber && child.type === oldFiber.type
        let newFiber
        if (isSameType) {
            newFiber = {
                type: child.type,
                props: child.props,
                sibling: null,
                child: null,
                parent: fiber,
                dom: oldFiber.dom,
                alternate: oldFiber,
                effectTag: 'UPDATE'
            }


        } else {
            if (child) {
                newFiber = {
                    type: child.type,
                    props: child.props,
                    sibling: null,
                    child: null,
                    parent: fiber,
                    dom: null,
                    effectTag: 'PLACEMENT',
                }
            }
            while (oldFiber) {
                fiberDeletions.push(oldFiber)
                oldFiber = oldFiber.sibling
            }
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling
        }

        if (newFiber) {
            if (index === 0) {
                fiber.child = newFiber
            } else {
                prevFiber.sibling = newFiber
            }
            prevFiber = newFiber
        }

    })
}

function updateHostComponent(fiber) {
    if (!fiber.dom) {
        // 1. 创建 dom、挂载dom
        const dom = (fiber.dom = createDom(fiber));

        // 2. 设置 props
        addProps(dom, fiber.props, {});
    }

    const children = fiber.props.children;
    reconcileChildren(fiber, children);
}

function updateFunctionComponent(fiber) {
    hookIndex = 0
    stateHooks = fiber.alternate?.hooks || []

    wipFiber = fiber
    const children = [fiber.type(fiber.props)]
    reconcileChildren(fiber, children)
}

function performUnitOfWork(fiber) {
    const isFunctionComponent = fiber.type instanceof Function
    if (isFunctionComponent) {
        updateFunctionComponent(fiber)
    } else {
        updateHostComponent(fiber)
    }

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

let wipRoot = null
let currentRoot = null
let nextUnitOfWork = null
let wipFiber = null
let fiberDeletions = []

function workLoop(deadline) {
    let shouldYield = false
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
        shouldYield = deadline.timeRemaining() < 1

        if (wipRoot?.sibling?.type === nextUnitOfWork?.type) {
            nextUnitOfWork = null
        }
    }
    if (!nextUnitOfWork && wipRoot) {
        commitRoot()
    }
    requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

// updateProps
function update() {
    let currentFiber = wipFiber

    return () => {
        nextUnitOfWork = {
            dom: currentFiber.dom,
            type: currentFiber.type,
            props: { ...currentFiber.props },
            alternate: currentFiber
        }
        wipRoot = nextUnitOfWork
    }
}

let hookIndex
let stateHooks
function useState(initState) {
    let currentFiber = wipFiber
    const oldHook = currentFiber.alternate?.stateHooks[hookIndex]
    const hook = {
        state: oldHook ? oldHook.state : initState,
        queue: oldHook ? oldHook.queue : []
    }

    hook.queue.forEach(action => {
        hook.state = action(hook.state)
    })

    hook.queue = []

    stateHooks[hookIndex] = hook
    hookIndex++

    currentFiber.stateHooks = stateHooks

    const setState = (action) => {
        const eagerState = typeof action === 'function' ? action(hook.state) : action
        if (eagerState === hook.state) {
            return
        }
        hook.queue.push(typeof action === 'function' ? action : () => action)

        wipRoot = {
            ...currentFiber,
            alternate: currentFiber
        }
        nextUnitOfWork = wipRoot
    }

    return [hook.state, setState]
}

// 统一上传
function commitRoot() {
    fiberDeletions.forEach(commitDeletion)
    commitWork(wipRoot.child)
    currentRoot = wipRoot
    commitEffectHook()
    wipRoot = null
    fiberDeletions = []
}

function commitEffectHook() {
    function run(fiber) {
        if (!fiber) return;

        const oldEffectHooks = fiber.alternate?.effectHooks;
        const effectHooks = fiber?.effectHooks;

        if (!fiber.alternate) {
            effectHooks?.forEach((hook) => {
                hook.cleanup = hook.callback();
            });
        } else {
            effectHooks?.forEach((hook, index) => {
                const oldDeps = oldEffectHooks[index]?.deps;
                const deps = hook?.deps;

                if (deps.length > 0) {
                    deps?.forEach((dep, i) => {
                        if (dep !== oldDeps[i]) {
                            hook.cleanup = hook.callback();
                        }
                    });
                }
            });
        }

        run(fiber.child);
        run(fiber.sibling);
    }

    function runCleanup(fiber) {
        if (!fiber) return;

        fiber.alternate?.effectHooks?.forEach((hook) => {
            if (hook.deps.length > 0) {
                hook.cleanup && hook.cleanup();
            }
        });

        runCleanup(fiber.child);
        runCleanup(fiber.sibling);
    }

    runCleanup(wipRoot);
    run(wipRoot);
}

function commitDeletion(fiber) {
    let domParent = fiber.parent
    while (!domParent.dom) {
        domParent = domParent.parent
    }
    if (fiber.dom) {
        domParent.dom.removeChild(fiber.dom)
    }
}

function commitWork(fiber) {
    if (!fiber) {
        return
    }

    if (fiber.effectTag === 'PLACEMENT') {
        let domParent = fiber.parent
        while (!domParent.dom) {
            domParent = domParent.parent
        }
        if (fiber.dom) {
            domParent.dom.appendChild(fiber.dom)
        }
    } else if (fiber.effectTag === 'UPDATE') {
        if (fiber.dom) {
            addProps(fiber.dom, fiber.props, fiber.alternate?.props)
        }
    }

    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

let effectHooks;
function useEffect(callback, deps) {
    const effectHook = {
        callback,
        deps,
        cleanup: null,
    };
    effectHooks.push(effectHook);

    wipFiber.effectHooks = effectHooks;
}

const React = {
    useEffect,
    render,
    useState,
    update,
    createElement
}

export default React