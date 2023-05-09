
    (function () {
        'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.validated-form')

    // Loop over them and prevent submission
    //Array.prototype.slice.call(forms)// this the old way of converting into array
    Array.from(forms) // this is the new way of converting into an array,
    .forEach(function (form) {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }
            
            form.classList.add('was-validated')
        }, false)
    })
})()