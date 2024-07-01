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
                <option value="/tables/dtek/table1.html">Table 1</option>
                <option value="/tables/dtek/table2.html">Table 2</option>
                <option value="/tables/dtek/table3.html">Table 3</option>
                <option value="/tables/dtek/table4.html">Table 4</option>
                <option value="/tables/dtek/table5.html">Table 5</option>
                <option value="/tables/dtek/table6.html">Table 6</option>
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

    // Assuming tables are already loaded and parsed
    const weekdays = [
      "Понеділок",
      "Вівторок",
      "Середа",
      "Четвер",
      "П'ятниця",
      "Субота",
      "Неділя",
    ];

    // Iterate over the rows of the first table (assuming all tables have the same structure)
    tables[0].querySelectorAll("tbody tr").forEach((row, rowIndex) => {
      const day = row.querySelector("td:first-child div").textContent.trim();

      const resultRow = {
        day: day,
        offline: [],
        grayZone: [],
        online: [],
      };

      const columns = row.querySelectorAll("td:not(:first-child)");

      columns.forEach((cell, columnIndex) => {
        const className = cell.className;

        tables.slice(1).forEach((table, tableIndex) => {
          const matchingCell = table.querySelectorAll(
            `tbody tr:nth-child(${rowIndex + 1}) td:nth-child(${
              columnIndex + 2
            })`
          )[0];
          if (matchingCell && matchingCell.classList.contains(className)) {
            if (className.includes("cell-scheduled")) {
              resultRow.offline.push({
                hour: columnIndex,
                table: tableIndex + 2,
              });
            } else if (className.includes("cell-scheduled-maybe")) {
              resultRow.grayZone.push({
                hour: columnIndex,
                table: tableIndex + 2,
              });
            } else if (className.includes("cell-non-scheduled")) {
              resultRow.online.push({
                hour: columnIndex,
                table: tableIndex + 2,
              });
            }
          }
        });
      });

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
                    <th scope="col" class="monday-th-day"><div>00-01</div></th>
                    <th scope="col" class="monday-th-day"><div>01-02</div></th>
                    <th scope="col" class="monday-th-day"><div>02-03</div></th>
                    <th scope="col" class="monday-th-day"><div>03-04</div></th>
                    <th scope="col" class="monday-th-day"><div>04-05</div></th>
                    <th scope="col" class="monday-th-day"><div>05-06</div></th>
                    <th scope="col" class="monday-th-day"><div>06-07</div></th>
                    <th scope="col" class="monday-th-day"><div>07-08</div></th>
                    <th scope="col" class="monday-th-day"><div>08-09</div></th>
                    <th scope="col" class="monday-th-day"><div>09-10</div></th>
                    <th scope="col" class="monday-th-day"><div>10-11</div></th>
                    <th scope="col" class="monday-th-day"><div>11-12</div></th>
                    <th scope="col" class="monday-th-day"><div>12-13</div></th>
                    <th scope="col" class="monday-th-day"><div>13-14</div></th>
                    <th scope="col" class="monday-th-day"><div>14-15</div></th>
                    <th scope="col" class="monday-th-day"><div>15-16</div></th>
                    <th scope="col" class="monday-th-day"><div>16-17</div></th>
                    <th scope="col" class="monday-th-day"><div>17-18</div></th>
                    <th scope="col" class="monday-th-day"><div>18-19</div></th>
                    <th scope="col" class="monday-th-day"><div>19-20</div></th>
                    <th scope="col" class="monday-th-day"><div>20-21</div></th>
                    <th scope="col" class="monday-th-day"><div>21-22</div></th>
                    <th scope="col" class="monday-th-day"><div>22-23</div></th>
                    <th scope="col" class="monday-th-day"><div>23-24</div></th>
                </tr>
            </thead>
            <tbody>
                ${results
                  .map(
                    result => `
                    <tr class="monday-row">
                        <td colspan="2" class="current-day"><div>${
                          result.day
                        }</div></td>
                        ${renderCells(result.offline)}
                        ${renderCells(result.grayZone)}
                        ${renderCells(result.online)}
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
        `;
    resultsContainer.appendChild(table);
  }

  function renderCells(cells) {
    const cellHtml = Array(24)
      .fill("")
      .map((_, index) => {
        if (cells.some(cell => cell.hour === index)) {
          return `<td class="highlighted-cell"></td>`;
        } else {
          return `<td></td>`;
        }
      })
      .join("");

    return cellHtml;
  }

  document.getElementById("year").textContent = new Date().getFullYear();
});
