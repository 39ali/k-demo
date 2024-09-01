import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import { useEffect } from 'react';

function App() {
  useEffect(async () => {

    let chosen_game = ""
    window.chosen_game = chosen_game

    for (const el of document.getElementsByClassName("appicon")) {

      el.addEventListener("click", (ev) => {
        for (const el of document.getElementsByClassName("appicon")) {
          el.children[0].classList.remove("highlight");

        }


        ev.target.classList.add("highlight")

        let game = ev.target.innerHTML

        if (game === "QUAKE.EXE") {
          chosen_game = "quake"
          let logo = document.getElementById("gamelogo")
          logo.style.opacity = 1;
          logo.src = "../assets/games/quake-logo.png"

        }

        else if (game === "ALADDIN.EXE") {
          chosen_game = "aladdin"
          let logo = document.getElementById("gamelogo")
          logo.style.opacity = 1;
          logo.src = "../assets/games/aladdin-logo.png"
        }

        else if (game === "NFS95.EXE") {
          chosen_game = "nfs95"
          let logo = document.getElementById("gamelogo")
          logo.style.opacity = 1;
          logo.src = "../assets/games/nfs-logo.jpg"
        }
        else if (game === "EXIT()") {
          chosen_game = "exit"
          window.parent.run_game(chosen_game)
        }

      })
    }


    document.getElementById("gamelogo").addEventListener("click", () => {
      console.log("logo clicked ", chosen_game)
      if (chosen_game !== "")
        window.parent.run_game(chosen_game)
    })

  })

  return (
    <div>
      <div id="dos-ui" style={{ width: "100%", height: "100%", position: "absolute", background: "black", zIndex: 0 }} >
        <div id="border" style={{ margin: "0 auto", height: "90%", position: "relative", overflow: "hidden", top: "20px", padding: "30px", borderColor: "rgb(124, 198, 118)", borderStyle: "solid", borderWidth: "2px" }}>
          <div id="main-panel" style={{ height: "100%", background: "black" }}>
            <div className="scrollbar_cap cap_top">
            </div>
            <div id="leftcolumn" style={{ float: "left", paddingRight: "20px", height: "90%", overflowY: "scroll", width: "30%", display: "block", color: "rgb(124, 198, 118)", scrollbarColor: "rgb(124, 198, 118) #020202", borderRight: "4px solid rgb(124, 198, 118)" }}>
              <table cellPadding={2} cellSpacing={0} style={{ width: "100%", fontSize: "30px", display: "table", borderCollapse: "separate", boxSizing: "border-box" }}>
                <tbody>
                  <tr className='appicon' style={{ display: "table-row" }}>
                    <td style={{ display: "table-cell", verticalAlign: "inherit" }}>QUAKE.EXE</td>
                  </tr>
                  <tr className='appicon' style={{ display: "table-row" }}>
                    <td style={{ display: "table-cell", verticalAlign: "inherit" }}>ALADDIN.EXE</td>
                  </tr>
                  <tr className='appicon' style={{ display: "table-row" }}>
                    <td style={{ display: "table-cell", verticalAlign: "inherit" }}>NFS95.EXE</td>
                  </tr>
                  <tr className='appicon' style={{ display: "table-row" }}>
                    <td style={{ display: "table-cell", verticalAlign: "inherit" }}>EXIT()</td>
                  </tr>
                </tbody>

              </table>
            </div>
            <div id="rightcolumn">
              <img id="krea-ascii" src='../assets/krea-ascii.png'></img>
              <img id="gamelogo" className="pulse" src='../assets/games/quake-logo.png'></img>

            </div>
          </div>

          <div id="bottom_logo">
            <pre id="doc_logo"></pre>
            <div id="console" className="cursor">

              &gt;
              <i className='cursor'></i>
            </div>

          </div>
        </div>
      </div>
    </div>)
}

ReactDOM.render(
  <React.StrictMode>


    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
