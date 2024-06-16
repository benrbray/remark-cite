/* @refresh reload */
import { render } from 'solid-js/web'

import './index.css'
import { Demo } from "./Demo"

const root = document.getElementById('root')

render(() => <Demo />, root!)
