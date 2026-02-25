/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';

import '@benrbray/rehype-cite/dist/rehype-cite.css'
import "katex/dist/katex.min.css";
import { Demo } from "./Demo";

const root = document.getElementById('root');

render(() => <Demo />, root!);
