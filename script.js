document.addEventListener("DOMContentLoaded", function () {
  const addInputButton = document.getElementById("add-input");
  const compareButton = document.getElementById("compare");
  const resultsContainer = document.getElementById("results-container");

  addInputButton.addEventListener("click", function () {
    const inputContainer = document.getElementById("input-container");
    const inputGroup = document.createElement("div");
    inputGroup.className = "input-group"; // for local usage change lights_out_comparison/tables/dtek/gr1.html to tables/dtek/gr1.html
    inputGroup.innerHTML = `
            <select>
                <option value="lights_out_comparison/tables/dtek/gr1.html">Група 1</option>
                <option value="lights_out_comparison/tables/dtek/gr2.html">Група 2</option>
                <option value="lights_out_comparison/tables/dtek/gr3.html">Група 3</option>
                <option value="lights_out_comparison/tables/dtek/gr4.html">Група 4</option>
                <option value="lights_out_comparison/tables/dtek/gr5.html">Група 5</option>
                <option value="lights_out_comparison/tables/dtek/gr6.html">Група 6</option>
            </select>
            <button class="remove-btn">-</button>
        `;
    inputContainer.insertBefore(inputGroup, addInputButton);

    inputGroup
      .querySelector(".remove-btn")
      .addEventListener("click", function () {
        inputContainer.removeChild(inputGroup);
      });
  });

  compareButton.addEventListener("click", function () {
    const selectElements = document.querySelectorAll("#input-container select");
    const tablePaths = Array.from(selectElements).map(select => select.value);

    if (tablePaths.length < 2) {
      alert("Please select at least two tables to compare.");
      return;
    }

    const tablePromises = tablePaths.map(path =>
      fetch(path).then(response => response.text())
    );

    Promise.all(tablePromises)
      .then(htmlContents => {
        const tables = htmlContents.map(html => {
          const tempElement = document.createElement("div");
          tempElement.innerHTML = html;
          return tempElement.querySelector("table");
        });

        if (tables.length >= 2) {
          const results = compareTables(tables);
          displayResults(results);
        }
      })
      .catch(error => console.error("Error fetching tables:", error));
  });

  function compareTables(tables) {
    const results = [];

    const weekdays = [
      "Понеділок",
      "Вівторок",
      "Середа",
      "Четвер",
      "П'ятниця",
      "Субота",
      "Неділя",
    ];

    weekdays.forEach((day, dayIndex) => {
      const resultRow = {
        day: day,
        cells: [],
      };

      for (let hour = 0; hour < 24; hour++) {
        let cellStatus = {
          cellScheduled: 0,
          cellScheduledMaybe: 0,
          cellNonScheduled: 0,
        };

        tables.forEach(table => {
          const row = table.querySelector(
            `tbody tr:nth-child(${dayIndex + 1})`
          );
          if (row) {
            const cell = row.querySelector(`td:nth-child(${hour + 2})`); // +2 to skip first column + 1
            if (cell) {
              if (cell.classList.contains("cell-scheduled")) {
                cellStatus.cellScheduled++;
              } else if (cell.classList.contains("cell-scheduled-maybe")) {
                cellStatus.cellScheduledMaybe++;
              } else if (cell.classList.contains("cell-non-scheduled")) {
                cellStatus.cellNonScheduled++;
              }
            }
          }
        });

        if (cellStatus.cellScheduled > 0) {
          resultRow.cells.push("cell-scheduled");
        } else if (cellStatus.cellScheduledMaybe > 0) {
          resultRow.cells.push("cell-scheduled-maybe");
        } else if (cellStatus.cellNonScheduled === tables.length) {
          resultRow.cells.push("cell-non-scheduled");
        } else {
          resultRow.cells.push("");
        }
      }

      results.push(resultRow);
    });

    return results;
  }

  function displayResults(results) {
    resultsContainer.innerHTML = ""; // Clear previous results

    const table = document.createElement("table");
    table.innerHTML = `
            <thead>
                <tr>
                    <th colspan="2"><div class="head-time">Часові<br>проміжки</div></th>
                    ${Array.from({ length: 24 })
                      .map(
                        (_, i) =>
                          `<th scope="col"><div>${i
                            .toString()
                            .padStart(2, "0")}-${(i + 1)
                            .toString()
                            .padStart(2, "0")}</div></th>`
                      )
                      .join("")}
                </tr>
            </thead>
            <tbody>
                ${results
                  .map(
                    result => `
                    <tr>
                        <td colspan="2"><div>${result.day}</div></td>
                        ${result.cells
                          .map(cellClass => `<td class="${cellClass}"></td>`)
                          .join("")}
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
        `;
    resultsContainer.appendChild(table);
  }

  document.getElementById("year").textContent = new Date().getFullYear();
});
