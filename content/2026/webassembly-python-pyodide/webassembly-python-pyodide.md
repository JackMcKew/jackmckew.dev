Title: Running Python in the Browser with Pyodide
Date: 2026-03-11
Author: Jack McKew
Category: Python
Tags: python, webassembly, pyodide, browser, javascript

I built a small data explorer last month that runs entirely in the browser - no backend server, no API calls, just Python running in a tab via WebAssembly. It's absurd and brilliant and nobody talks about it enough.

Pyodide compiles CPython to WebAssembly so you can import numpy, pandas, matplotlib, whatever, and run it in JavaScript. The barrier to entry is lower than you'd expect.

Here's the basic setup - you're just loading a script and writing Python:

```html
<!DOCTYPE html>
<html>
<head>
    <script defer src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"></script>
</head>
<body>
    <textarea id="code" rows="10" cols="50">
import numpy as np
result = np.array([1, 2, 3, 4, 5]).mean()
print(f"Mean: {result}")
    </textarea>
    <button onclick="runPython()">Run</button>
    <pre id="output"></pre>

    <script>
        async function runPython() {
            let pyodide = await loadPyodide();
            let code = document.getElementById("code").value;
            try {
                let output = pyodide.runPython(code);
                document.getElementById("output").textContent = output;
            } catch (error) {
                document.getElementById("output").textContent = "Error: " + error;
            }
        }
    </script>
</body>
</html>
```

That works. You can paste Python and run it. Load the page, type code, hit the button.

Now the real stuff - building an interactive app. I built a CSV uploader and data explorer:

```html
<input type="file" id="csvFile" accept=".csv">
<button onclick="loadCSV()">Load CSV</button>

<select id="column">
    <option>Select a column</option>
</select>

<button onclick="showStats()">Show Stats</button>
<div id="results"></div>

<script>
    let pyodide;
    let dataframe;

    async function loadPyodide() {
        pyodide = await loadPyodide();
        // Install pandas if not already available
        await pyodide.loadPackage("pandas");
    }

    async function loadCSV() {
        if (!pyodide) await loadPyodide();

        let file = document.getElementById("csvFile").files[0];
        let arrayBuffer = await file.arrayBuffer();
        let uint8 = new Uint8Array(arrayBuffer);

        // Write file to Pyodide filesystem
        let fs = pyodide.FS;
        fs.writeFile("/tmp/data.csv", uint8);

        // Load into pandas
        pyodide.runPython(`
            import pandas as pd
            df = pd.read_csv('/tmp/data.csv')
            columns = df.columns.tolist()
        `);

        let columns = pyodide.globals.get("columns");
        let select = document.getElementById("column");
        columns.forEach(col => {
            let option = document.createElement("option");
            option.value = col;
            option.textContent = col;
            select.appendChild(option);
        });
    }

    async function showStats() {
        let column = document.getElementById("column").value;
        let result = pyodide.runPython(`
            print(f"Column: {column}")
            print(f"Mean: {df['${column}'].mean():.2f}")
            print(f"Std: {df['${column}'].std():.2f}")
            print(f"Min: {df['${column}'].min()}")
            print(f"Max: {df['${column}'].max()}")
        `);
        document.getElementById("results").textContent = result;
    }
</script>
```

The JS-Python bridge is where things get weird but also powerful. You can pass objects back and forth:

```javascript
// JavaScript calling Python
let result = pyodide.runPython("2 + 2");  // returns 4

// Python returning values
let output = pyodide.runPython(`
    data = {'name': 'Jack', 'age': 30}
    data
`);
console.log(output.toJs());  // { name: 'Jack', age: 30 }

// Python calling JavaScript
pyodide.runPython(`
    from js import console
    console.log("Hello from Python!")
`);
```

I built a simple calculator interface:

```html
<input type="number" id="a" placeholder="First number">
<input type="number" id="b" placeholder="Second number">
<select id="op">
    <option>+</option>
    <option>-</option>
    <option>*</option>
    <option>/</option>
</select>
<button onclick="calculate()">Calculate</button>
<p id="result"></p>

<script>
    async function calculate() {
        if (!pyodide) await loadPyodide();

        let a = parseFloat(document.getElementById("a").value);
        let b = parseFloat(document.getElementById("b").value);
        let op = document.getElementById("op").value;

        let result = pyodide.runPython(`
            a = ${a}
            b = ${b}
            op = '${op}'

            if op == '+': result = a + b
            elif op == '-': result = a - b
            elif op == '*': result = a * b
            elif op == '/': result = a / b if b != 0 else 'Error'

            result
        `);

        document.getElementById("result").textContent = `Result: ${result}`;
    }
</script>
```

This is where I expected it to break. But it... doesn't. You can pass variables from JS to Python, do actual computation, get results back.

Here's the honest part though: the trade-offs are real.

**Load time is brutal.** The first time you load the page with Pyodide, it downloads ~50MB of WebAssembly and CPython. Subsequent loads are cached, but first-time users wait 10-15 seconds. Not ideal for a marketing site, but fine for internal tools or shareable analysis notebooks.

**Not all packages work.** NumPy is there. Pandas is there. But packages that need C extensions sometimes don't have WASM builds. scikit-learn works but it's chunky. TensorFlow? No. You're limited to the curated ecosystem.

**No multithreading.** Python's GIL is... still a thing. Heavy computation blocks the browser tab. Do a 30-second calculation and your app freezes. You can work around it with JavaScript workers but that's annoying.

**File size matters.** Every package you import adds to the runtime overhead. A minimal Pyodide is ~10MB, but if you load pandas you're at 30MB+.

But here's why it's worth it: **you can ship interactive tools with zero backend infrastructure.** You don't need servers, databases, API keys, authentication. Upload the HTML file to GitHub Pages and users can run Python directly in their browser. For specific use cases - data exploration, calculators, format converters, equation solvers - this is genuinely powerful.

I used it to build a frequency analysis tool for analyzing English text. Users paste text, the browser runs character frequency counts, and outputs a histogram. All client-side. You could never scale this with a traditional backend (per-user computation), but with Pyodide it's essentially free - your compute is the user's computer.

The mental model is: if you can do it in a Jupyter notebook, you can probably deploy it as a Pyodide app. The latency sucks on cold load but once it's running it's fast.

Real use case that sold me: a colleague needed to validate CSV data against a schema before uploading to a system. Instead of building an API, I wrapped the validation script (200 lines of Python) in a Pyodide app. Sent him a link. It works offline. No backend needed. That's the win.

Try it if you have a Python script that could be useful as a shareable tool. The barrier to shipping is basically zero.
