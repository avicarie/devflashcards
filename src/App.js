import { createBrowserRouter } from 'react-router-dom';
import './App.css';
import React, { useRef, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
import { transform } from '@babel/standalone';
import { getSrcDoc } from './getSrcDoc';

function App() {
    const task1 = 'Napisz funkcję dodającą A do B';
    const taskObject = {
        initialCode: 'function sumTwoNumbers(a,b){\n\treturn 0;\n}',
        functionName: 'sumTwoNumbers',
        description: 'Write a function that sums two numbers passed as arguments',
        testCases: [
            { params: [1, 2], expected: 3 },
            { params: [4, 5], expected: 9 },
            { params: [-10, 30], expected: 20 },
            { params: [12, 309000], expected: 309012 },
        ],
    };
    const router = createBrowserRouter([
        { path: '/', element: <Glossary /> },
        {
            path: '/0',
            element: <Task {...taskObject} />,
        },
    ]);

    return (
        <React.Fragment>
            <RouterProvider router={router} />
        </React.Fragment>
    );
}
export default App;

function Glossary() {
    return <div>Glossary</div>;
}

function Task({ description, functionName, initialCode, testCases }) {
    return (
        <div>
            <div>{description}</div>
            <CodeEditor
                functionName={functionName}
                initialCode={initialCode}
                testCases={testCases}
            />
        </div>
    );
}

function fillCodeResults(code, { functionName, testCases }) {
    return `const root = ReactDOM.createRoot(
        document.getElementById('app')
    );


    ${code}
    
    function App(){
        const testCases = ${JSON.stringify(testCases)};
        return (

            <table>
                <thead>
                    <tr>
                        <th>PARAMS</th>
                        <th>EXPECTED</th>
                        <th>YOURS</th>
                    </tr>
                </thead>
                <tbody>
                {testCases.map(testCase => {
                    const valid = ${functionName}(...testCase.params) == testCase.expected;
                    return (
                        <tr key={testCase.expected} style={{backgroundColor: valid ? 'green' : 'red'}}>
                            <td>{JSON.stringify(testCase.params)} </td>
                            <td style={{textAlign: 'right'}}>{testCase.expected}</td>
                            <td style={{textAlign: 'right'}}>{${functionName}(...testCase.params)}</td>
                            <td>{valid ? '✅' : '❌'}</td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
        );
    }
    
    root.render(
        <App />
    )`;
}

function CodeEditor({ functionName, initialCode, testCases }) {
    const editorRef = useRef(null);
    const [output, setOutput] = useState('');

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }

    function submit() {
        const babelOutput = transform(
            fillCodeResults(editorRef.current.getValue(), { functionName, testCases }),
            {
                presets: ['env', 'react'],
            },
        ).code;
        setOutput(getSrcDoc({ babelOutput, error: null, css: null }));
    }

    return (
        <div>
            <div style={{ columnCount: 2 }}>
                <div>
                    <button style={{ float: 'right', backgroundColor: 'purple' }} onClick={submit}>
                        Submit ▶
                    </button>
                    <Editor
                        onMount={handleEditorDidMount}
                        height='90vh'
                        defaultLanguage='javascript'
                        theme='vs-dark'
                        defaultValue={initialCode}
                    ></Editor>
                </div>
                <iframe width='100%' height='100%' srcDoc={output} />
            </div>
        </div>
    );
}
