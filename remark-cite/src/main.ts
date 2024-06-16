import './style.css'

import { number } from "@lib/main";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    Hello! ${number}
  </div>
`
