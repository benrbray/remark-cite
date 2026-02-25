import { ParentProps } from "solid-js"

export const Heading = (props: ParentProps) => {
  return <div class="heading">
    Heading:  {props.children}
  </div>
}