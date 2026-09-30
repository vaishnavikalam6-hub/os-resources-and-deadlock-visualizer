let processes = 0;
let resources = 0;


// Generate Tables
function generateTables() {

    processes = parseInt(
        document.getElementById("processCount").value
    );

    resources = parseInt(
        document.getElementById("resourceCount").value
    );

    generateAvailable();
    generateMatrix("allocationContainer", "allocation");
    generateMatrix("maximumContainer", "maximum");

    document.getElementById("needContainer").innerHTML =
        "Need matrix will appear after calculation.";

    document.getElementById("simulation").innerHTML =
        "Simulation steps will appear here.";

    document.getElementById("result").innerHTML =
        "Result will appear here.";
}


// Generate Available Resource Inputs
function generateAvailable() {

    let html = "<table><tr>";

    for (let j = 0; j < resources; j++) {
        html += `<th>R${j + 1}</th>`;
    }

    html += "</tr><tr>";

    for (let j = 0; j < resources; j++) {

        html += `
            <td>
                <input 
                    type="number"
                    id="available_${j}"
                    value="0"
                    min="0">
            </td>
        `;
    }

    html += "</tr></table>";

    document.getElementById("availableContainer").innerHTML = html;
}


// Generate Allocation / Maximum Matrix
function generateMatrix(containerId, type) {

    let html = "<table>";

    html += "<tr>";
    html += "<th>Process</th>";

    for (let j = 0; j < resources; j++) {
        html += `<th>R${j + 1}</th>`;
    }

    html += "</tr>";

    for (let i = 0; i < processes; i++) {

        html += `<tr>`;
        html += `<th>P${i + 1}</th>`;

        for (let j = 0; j < resources; j++) {

            html += `
                <td>
                    <input
                        type="number"
                        min="0"
                        value="0"
                        id="${type}_${i}_${j}">
                </td>
            `;
        }

        html += "</tr>";
    }

    html += "</table>";

    document.getElementById(containerId).innerHTML = html;
}


// Read Matrix
function getMatrix(type) {

    let matrix = [];

    for (let i = 0; i < processes; i++) {

        let row = [];

        for (let j = 0; j < resources; j++) {

            let value = parseInt(
                document.getElementById(
                    `${type}_${i}_${j}`
                ).value
            );

            row.push(value);
        }

        matrix.push(row);
    }

    return matrix;
}


// Read Available Resources
function getAvailable() {

    let available = [];

    for (let j = 0; j < resources; j++) {

        let value = parseInt(
            document.getElementById(`available_${j}`).value
        );

        available.push(value);
    }

    return available;
}


// Calculate Need Matrix
function calculateNeed() {

    let allocation = getMatrix("allocation");
    let maximum = getMatrix("maximum");

    let need = [];

    for (let i = 0; i < processes; i++) {

        let row = [];

        for (let j = 0; j < resources; j++) {

            row.push(
                maximum[i][j] - allocation[i][j]
            );
        }

        need.push(row);
    }

    displayNeedMatrix(need);
}


// Display Need Matrix
function displayNeedMatrix(need) {

    let html = "<table>";

    html += "<tr>";
    html += "<th>Process</th>";

    for (let j = 0; j < resources; j++) {
        html += `<th>R${j + 1}</th>`;
    }

    html += "</tr>";

    for (let i = 0; i < processes; i++) {

        html += `<tr>`;
        html += `<th>P${i + 1}</th>`;

        for (let j = 0; j < resources; j++) {

            html += `<td>${need[i][j]}</td>`;
        }

        html += "</tr>";
    }

    html += "</table>";

    document.getElementById("needContainer").innerHTML = html;
}


// Banker's Algorithm
function runBankersAlgorithm() {

    let allocation = getMatrix("allocation");
    let maximum = getMatrix("maximum");
    let available = getAvailable();

    let need = [];

    // Calculate Need
    for (let i = 0; i < processes; i++) {

        let row = [];

        for (let j = 0; j < resources; j++) {

            row.push(
                maximum[i][j] - allocation[i][j]
            );
        }

        need.push(row);
    }

    displayNeedMatrix(need);


    let work = [...available];

    let finish = new Array(processes).fill(false);

    let safeSequence = [];

    let steps = "";

    let completed = 0;


    while (completed < processes) {

        let found = false;

        for (let i = 0; i < processes; i++) {

            if (finish[i]) {
                continue;
            }

            let canExecute = true;


            // Check Need <= Work
            for (let j = 0; j < resources; j++) {

                if (need[i][j] > work[j]) {

                    canExecute = false;
                    break;
                }
            }


            if (canExecute) {

                steps += `
    <div class="step simulation-step">
        <strong>Step ${completed + 1}</strong>

        <br><br>

        🔍 Checking Process P${i + 1}

        <br>

        ✓ P${i + 1} can execute.

        <br>

        Its resource requirements can be satisfied.
    </div>
`;


                // Release resources
                for (let j = 0; j < resources; j++) {

                    work[j] += allocation[i][j];
                }


                finish[i] = true;

                safeSequence.push(`P${i + 1}`);

                completed++;

                found = true;


                steps += `
    <div class="step release-step">

        🔄 Resources allocated to
        <strong>P${i + 1}</strong>
        are released.

        <br><br>

        ✓ Available resources updated.

    </div>
`;
            }
        }


        // No process can execute
        if (!found) {
            break;
        }
    }

let progress =
    Math.round((completed / processes) * 100);

steps = `
    <div class="progress-container">

        <div class="progress-label">
            Simulation Progress: ${progress}%
        </div>

        <div class="progress-bar">

            <div class="progress-fill"
                 style="width:${progress}%">
            </div>

        </div>

    </div>

` + steps;
    document.getElementById("simulation").innerHTML = steps;
    generateResourceGraph(allocation, maximum);


    // Safe State
    if (completed === processes) {

        document.getElementById("result").innerHTML = `

            <div class="success">

                <h3>✓ SYSTEM IS IN SAFE STATE</h3>

                <p>No deadlock detected.</p>

                <div class="safe-sequence">

                    Safe Sequence:

                    ${safeSequence.join(" → ")}

                </div>

            </div>
        `;

    }

    // Deadlock
    else {

        let deadlocked = [];

        for (let i = 0; i < processes; i++) {

            if (!finish[i]) {

                deadlocked.push(`P${i + 1}`);
            }
        }


        document.getElementById("result").innerHTML = `

            <div class="danger">

                <h3>⚠ DEADLOCK / UNSAFE STATE DETECTED</h3>

                <p>
                    The following processes could not complete:
                </p>

                <div class="safe-sequence">

                    ${deadlocked.join(", ")}

                </div>

            </div>
        `;
    }
}


// Reset
function resetProject() {

    location.reload();
}

// ================= RESOURCE ALLOCATION GRAPH =================

function generateResourceGraph(allocation, maximum) {

    let html = `
        <div class="graph-container">

            <h3>Resource Allocation Graph</h3>

            <div class="graph-legend">
                <span>🔵 Process</span>
                <span>🟢 Resource</span>
                <span>➡ Allocation</span>
                <span>➜ Request</span>
            </div>

            <div class="rag-wrapper">

                <div class="rag-processes">
                    <h3>Processes</h3>
    `;

    // Process nodes
    for (let i = 0; i < processes; i++) {

        html += `
            <div class="rag-process-node"
                 id="process-node-${i}">
                <span>P${i + 1}</span>
            </div>
        `;
    }

    html += `
                </div>

                <div class="rag-arrows">
                    <h3>Connections</h3>
    `;


    let connectionFound = false;

    // Allocation arrows
    for (let i = 0; i < processes; i++) {

        for (let j = 0; j < resources; j++) {

            if (allocation[i][j] > 0) {

                connectionFound = true;

                html += `
                    <div class="rag-connection allocation-arrow">

                        <span class="resource-label">
                            R${j + 1}
                        </span>

                        <span class="arrow">
                            ➜
                        </span>

                        <span class="process-label">
                            P${i + 1}
                        </span>

                        <span class="units">
                            ${allocation[i][j]} unit
                        </span>

                    </div>
                `;
            }
        }
    }


    // Request arrows
    for (let i = 0; i < processes; i++) {

        for (let j = 0; j < resources; j++) {

            let max =
                parseInt(
                    document.getElementById(
                        `maximum_${i}_${j}`
                    ).value
                );

            let request =
                max - allocation[i][j];

            if (request > 0) {

                connectionFound = true;

                html += `
                    <div class="rag-connection request-arrow">

                        <span class="process-label">
                            P${i + 1}
                        </span>

                        <span class="arrow">
                            ➜
                        </span>

                        <span class="resource-label">
                            R${j + 1}
                        </span>

                        <span class="units">
                            Need: ${request}
                        </span>

                    </div>
                `;
            }
        }
    }


    if (!connectionFound) {

        html += `
            <p>No allocation or request connections.</p>
        `;
    }


    html += `
                </div>

                <div class="rag-resources">

                    <h3>Resources</h3>
    `;


    // Resource nodes
    for (let j = 0; j < resources; j++) {

        html += `
            <div class="rag-resource-node"
                 id="resource-node-${j}">
                <span>R${j + 1}</span>
            </div>
        `;
    }


    html += `
                </div>

            </div>

        </div>
    `;


    document.getElementById("resourceGraph").innerHTML = html;


    // Animate nodes
    setTimeout(() => {

        for (let i = 0; i < processes; i++) {

            const node =
                document.getElementById(
                    `process-node-${i}`
                );

            if (node) {
                node.classList.add("node-visible");
            }
        }


        for (let j = 0; j < resources; j++) {

            const node =
                document.getElementById(
                    `resource-node-${j}`
                );

            if (node) {
                node.classList.add("node-visible");
            }
        }

    }, 100);
}