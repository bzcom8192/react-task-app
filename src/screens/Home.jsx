import React from 'react'
import Footer from '../components/Footer.jsx'
import task from '../assets/task.png'
import { useState } from 'react'
import Swal from 'sweetalert2'

export default function Home() {
    const [secureCode, setSecureCode] = useState('')

    const showWarningAlert = (msg) => {
        Swal.fire({
            icon: 'warning',
            iconColor: '#f59800',
            text: msg,
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#0049f5',
        })
    }

    const handleTaskClick = () => {
        //Validate
        if (secureCode === '') {
            // alert('กรุณาใส่ Secure Code')
            showWarningAlert('กรุณาใส่ Secure Code')
            return;
        }

        //ตรวจสอบ Secure Code ว่าถูกต้องหรือไม่
        if (secureCode.toLowerCase() === 'dtisau') {
            //redirect ไปยัง /showalltask
            window.location.href = '/showalltask'
        } else {
            alert('Secure Code ไม่ถูกต้อง')
        }
    }

    return (
        <div className='w-full h-screen flex flex-col'>
            <div className="w-8/12 border-gray-300 shadow-md rounded p-5 mx-auto my-auto flex flex-col items-center">
                <img src={task} alt="Task" className="w-40 mb-4" />

                <h1 className="text-3xl font-bold text-gray-800">
                    Task Application
                </h1>

                <input type="text" placeholder="Enter Secure Code"
                    value={secureCode} onChange={(e) => setSecureCode(e.target.value)}
                    className="p-2 border border-gray-800 mt-5 rounded w-100" />

                <button onClick={handleTaskClick}
                    className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white px-5 py-3 rounded mt-7"
                >
                    เข้าใช้งาน Task Application
                </button>
            </div>

            <Footer />
        </div>
    )
}