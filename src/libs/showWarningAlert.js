import React from 'react'
import Swal from 'sweetalert2'

export default function showWarningAlert(msg) {
    Swal.fire({
        icon: 'warning',
        iconColor: '#f59800',
        text: msg,
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#0049f5',
    })
}