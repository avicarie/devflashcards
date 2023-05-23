import { createBrowserRouter } from 'react-router-dom';
import './App.css';
import React, { useRef, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Editor } from '@monaco-editor/react';
import { transform } from '@babel/standalone';
import { getSrcDoc } from './getSrcDoc';

const iframeCss = `
table, th, td {
    border: 2px solid black;
  }
`;

function App() {
    function factorial(a) {
        if (a == 0) return 1;
        return a * factorial(a - 1);
    }

    function fibbonaci(a) {
        if (a == 0) return 0;
        if (a == 1) return 1;
        return fibbonaci(a - 1) + fibbonaci(a - 2);
    }

    function leapYearChecker(a) {
        if (a % 400 == 0) return true;
        if (a % 100 == 0) return false;
        if (a % 4 == 0) return true;
        return false;
    }

    const tasks = [
        {
            initialCode: 'function sumTwoNumbers(a,b){\n\treturn 0;\n}',
            functionName: 'sumTwoNumbers',
            description: 'Write a function that takes two numbers as input and returns their sum.',
            testCases: [
                { params: [1, 2], expected: 3 },
                { params: [4, 5], expected: 9 },
                { params: [-10, 30], expected: 20 },
                { params: [12, 309000], expected: 309012 },
            ],
        },
        {
            initialCode: 'function evenOrOdd(a){\n\treturn "";\n}',
            functionName: 'evenOrOdd',
            description: `Write a function that takes a number as input and determines whether it's even or odd. The function should return "Even" if the number is even, and "Odd" if the number is odd.`,
            testCases: [
                { params: [8], expected: 'Even' },
                { params: [11], expected: 'Odd' },
                { params: [16], expected: 'Even' },
                { params: [27], expected: 'Odd' },
            ],
        },
        {
            initialCode: 'function factorial(a){\n\treturn 0;\n}',
            functionName: 'factorial',
            description: `Write a function that takes a number as input and calculates its factorial. The factorial of a non-negative integer n is the product of all positive integers less than or equal to n. For example, the factorial of 5 is 5 * 4 * 3 * 2 * 1 = 120.`,
            testCases: [
                { params: [8], expected: factorial(8) },
                { params: [7], expected: factorial(7) },
                { params: [4], expected: factorial(4) },
                { params: [5], expected: factorial(5) },
            ],
        },
        {
            initialCode: 'function fibbonaci(a){\n\treturn 0;\n}',
            functionName: 'fibbonaci',
            description: `Write a function that takes a number n as input and returns the nth number in the Fibonacci sequence. The Fibonacci sequence is a series of numbers in which each number is the sum of the two preceding ones, usually starting with 0 and 1.`,
            testCases: [
                { params: [8], expected: fibbonaci(8) },
                { params: [7], expected: fibbonaci(7) },
                { params: [11], expected: fibbonaci(11) },
                { params: [5], expected: fibbonaci(5) },
            ],
        },
        {
            initialCode: 'function leapYearChecker(a){\n\treturn false;\n}',
            functionName: 'leapYearChecker',
            description: `Write a function that takes a year as input and determines whether it's a leap year. A leap year is a year that is divisible by 4 but not divisible by 100, except if it's also divisible by 400. Return true if the year is a leap year, and false otherwise.`,
            testCases: [
                { params: [1999], expected: leapYearChecker(1999) },
                { params: [2004], expected: leapYearChecker(2004) },
                { params: [2000], expected: leapYearChecker(2000) },
                { params: [1900], expected: leapYearChecker(1900) },
            ],
        },
    ];
    const router = createBrowserRouter([
        { path: '/', element: <Glossary /> },
        ...tasks.map((task, index) => {
            return { path: `/${index}`, element: <Task key={index} {...task} /> };
        }),
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
            <div style={{ fontSize: '25px' }}>{description}</div>
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
                            <td style={{textAlign: 'right'}}>{testCase.expected.toString()}</td>
                            <td style={{textAlign: 'right'}}>{${functionName}(...testCase.params).toString()}</td>
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
        setOutput(
            getSrcDoc({
                babelOutput,
                error: null,
                css: iframeCss,
            }),
        );
    }

    const options = {
        readOnly: false,
        minimap: { enabled: false },
    };

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
                        options={options}
                    ></Editor>
                </div>
                <iframe width='100%' height='100%' srcDoc={output} />
            </div>
        </div>
    );
}
