"use strict";

import { graphData, datas, instructions } from "./data.js";

let currentInstructionIndex = -1;
let sleepTime = 3500;

const setInstruction = (index) => {
  if (index < instructions.length && currentInstructionIndex < index) {
    currentInstructionIndex = index;
    document.getElementById("instructions").innerHTML =
      instructions[currentInstructionIndex].message;

    instructions[currentInstructionIndex].elementId.forEach((id, ind) => {
      if (ind === 0)
        document.getElementById(id).scrollIntoView({
          behavior: "smooth",
        });
      document.getElementById(id).classList.add("highlight");
    });
    sleep(sleepTime - 600).then(() =>
      instructions[currentInstructionIndex].elementId.forEach((id) =>
        document.getElementById(id).classList.remove("highlight")
      )
    );
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const setMultipleInstructions = (indexes) =>
  indexes.forEach((val, ind) =>
    sleep(sleepTime * ind).then(() => setInstruction(val))
  );

const width = window.innerWidth;
const movie = new ChemDoodle.MovieCanvas3D("movie", width, 300);

const setMolecule = (data) => {
  movie.clear();
  movie.frames = [];
  if (data !== null) {
    data.forEach((geometry) =>
      movie.addFrame([ChemDoodle.readXYZ(geometry)], [])
    );
    movie.styles.set3DRepresentation("Ball and Stick");
    movie.styles.atoms_displayLabels_3D = true;
    movie.styles.backgroundColor = "transparent";
    movie.loadMolecule(movie.frames[0].mols[0]);
    movie.startAnimation();
  }
  return movie;
};

const initChart = () => {
  return new Chart("myChart", {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Curve",
          pointRadius: 0.5,
          data: graphData,
          borderColor: "#FFA500",
          borderWidth: 2,
          fill: false,
          tension: 0,
          showLine: true,
        },
      ],
    },
    options: {
      responsive: true,
      legend: { display: false },
      scales: {
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Frquency",
            },
          },
        ],

        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Energy (Ha)",
            },
          },
        ],
      },
    },
  });
};

const highlightChart = (angle) => {
  if (chart) {
    chart.data.datasets[0].pointBackgroundColor = [];
    chart.data.datasets[0].pointRadius = [];
    for (let i = 0; i < chart.data.datasets[0].data.length; i++) {
      if (chart.data.datasets[0].data[i]["x"] == angle) {
        chart.data.datasets[0].pointRadius[i] = 4;
        chart.data.datasets[0].pointBackgroundColor[i] = "red";
      } else {
        chart.data.datasets[0].pointRadius[i] = 0.5;
      }
    }
    chart.update();
  }
};

// init
const chart = initChart();
setInstruction(0);

let XYZData = [];

const truncateFloat = (num) => Math.round(num * 1000000) / 1000000;

const generateXYZData = () => {
  const frames = 30;
  datas.frequencies.forEach((item, ind) => {
    let geometry = [];
    let prep = {};
    item.displacement.forEach((disp) => {
      prep[disp.atom - 1] = {
        x: {
          min: datas.positions[disp.atom - 1].x - disp.x,
          max: datas.positions[disp.atom - 1].x + disp.x,
          step: (2 * disp.x) / frames,
        },
        y: {
          min: datas.positions[disp.atom - 1].y - disp.y,
          max: datas.positions[disp.atom - 1].y + disp.y,
          step: (2 * disp.y) / frames,
        },
        z: {
          min: datas.positions[disp.atom - 1].z - disp.z,
          max: datas.positions[disp.atom - 1].z + disp.z,
          step: (2 * disp.z) / frames,
        },
      };
    });

    for (let i = 0; i <= frames; i++) {
      let str = `${datas.positions.length}\n `;
      for (let j = 0; j < datas.positions.length; j++) {
        str += `\n${datas.positions[j].element}   ${truncateFloat(
          prep[j].x.min + prep[j].x.step * i
        )}  ${truncateFloat(
          prep[j].y.min + prep[j].y.step * i
        )}  ${truncateFloat(prep[j].z.min + prep[j].z.step * i)}`;
      }
      geometry.push(str);
    }

    XYZData[ind] = { freq: item.freq, geometry: geometry };
  });
};

generateXYZData();

const setFreq = (frequencyIndex) => {
  setMolecule(XYZData[frequencyIndex].geometry);
  highlightChart(XYZData[frequencyIndex].freq);
};

setFreq(0);

document.querySelectorAll(".v-button-set .v-button").forEach((button, ind) => {
  button.addEventListener("click", () => {
    setMultipleInstructions([1, 2, 3, 4]);

    document
      .querySelectorAll(".v-button-set .v-active")
      .forEach((activeButton) => activeButton.classList.remove("v-active"));
    button.classList.add("v-active");
    setFreq(ind);
  });
});
