export const PROJECT_NAME = "template_board"

export default function TemplateBoard() {
  return (
    <board width="30mm" height="20mm">
      <resistor name="R1" resistance="1k" footprint="0603" pcbX={-3} pcbY={0} />
      <led name="D1" color="red" footprint="0603" pcbX={3} pcbY={0} />
      <trace from="R1.pin1" to="D1.neg" />
      <trace from="R1.pin2" to="D1.pos" />
    </board>
  )
}
