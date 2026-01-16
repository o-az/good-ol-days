import '#style.css'
import $ from 'jquery'

$(() => {
  const $element = $('<p>').text('Hello, world!')

  const $button = $('<button>')
    .text('Click me for a biiig surprise!!!')
    .on('click', () => {
      $element.text('Hello, you!')
    })

  $('body').append($('<div>').append($button, $element))
})
