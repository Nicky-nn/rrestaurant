/**
 * @author isi-template
 * @param e
 */
export const swalExceptionMsg = (e: Error) => {
  return `
<p style="text-align: center">${e.message}</p>
<div class="accordionTabs">
    <div class="tab">
      <input type="checkbox" id="a01">
      <label class="tab-label" for="a01">Detalle del error</label>
      <div class="tab-content">
        <ul style="margin: 0; padding: 5px 15px; line-height: 25px ">
          <li><strong style="color:#ef5350">Nombre: </strong> ${e.name}</li>
          <li><strong  style="color:#ef5350">Mensaje Original: </strong> ${e.cause}</li>
          <li><strong  style="color:#ef5350">Detalle Error: </strong> ${e.stack}</li>
        </ul>
      </div>
    </div>
  </div>
  `
}
