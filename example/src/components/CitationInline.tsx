import { CiteItem } from "@benrbray/mdast-util-cite";
import { createEffect, createSignal, JSX, ParentProps } from "solid-js";

export namespace CitationInline {
  export type Props = ParentProps<{
    citeLookup?: (key: string) => JSX.Element,
    citeItemsJson: string
  }>
}

export const CitationInline = (
  handleChange: (key: string) => void
) => 
  (props: CitationInline.Props) => {
    const citeItems = JSON.parse(props.citeItemsJson) as CiteItem[];
    console.log(citeItems)

    const [selected, setSelected] = createSignal(false);

    createEffect(() => {
      
    })

    return <div 
      class="citation-inline"
      style="background-color: #ccf; display: inline-block"
      onclick={() => { setSelected(prev => !prev) }}
    >
      ({selected() ? <>SHOW {props.children}</> : "HIDDEN" })
    </div>
  }