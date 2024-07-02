document.addEventListener("DOMContentLoaded", function () {
  const addInputButton = document.getElementById("add-input");
  const compareButton = document.getElementById("compare");
  const resultsContainer = document.getElementById("results-container");

  addInputButton.addEventListener("click", function () {
    const inputContainer = document.getElementById("input-container");
    const inputGroup = document.createElement("div");
    inputGroup.className = "input-group";
    inputGroup.innerHTML = `
            <select>
                <option value="/tables/dtek/gr1.html">Group 1</option>
                <option value="/tables/dtek/gr2.html">Group 2</option>
                <option value="/tables/dtek/gr3.html">Group 3</option>
                <option value="/tables/dtek/gr4.html">Group 4</option>
                <option value="/tables/dtek/gr5.html">Group 5</option>
                <option value="/tables/dtek/gr6.html">Group 6</option>
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
        offline: [],
        grayZone: [],
        online: [],
      };

      for (let hour = 0; hour < 24; hour++) {
        let offlineCount = 0;
        let grayZoneCount = 0;
        let onlineCount = 0;

        tables.forEach(table => {
          const row = table.querySelector(
            `tbody tr:nth-child(${dayIndex + 1})`
          );
          if (row) {
            const cell = row.querySelector(`td:nth-child(${hour + 3})`); // +3 to skip first two columns (day and empty)
            if (cell) {
              if (cell.classList.contains("cell-scheduled")) {
                offlineCount++;
              } else if (cell.classList.contains("cell-scheduled-maybe")) {
                grayZoneCount++;
              } else if (cell.classList.contains("cell-non-scheduled")) {
                onlineCount++;
              }
            }
          }
        });

        if (offlineCount === tables.length) {
          resultRow.offline.push(hour);
        } else if (grayZoneCount === tables.length) {
          resultRow.grayZone.push(hour);
        } else if (onlineCount === tables.length) {
          resultRow.online.push(hour);
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
                        ${Array.from({ length: 24 })
                          .map((_, hour) => {
                            if (result.offline.includes(hour)) {
                              return `<td class="cell-scheduled"></td>`;
                            } else if (result.grayZone.includes(hour)) {
                              return `<td class="cell-scheduled-maybe"></td>`;
                            } else if (result.online.includes(hour)) {
                              return `<td class="cell-non-scheduled"></td>`;
                            } else {
                              return `<td></td>`;
                            }
                          })
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
