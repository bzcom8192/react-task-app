import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import taskimg from '../assets/task.png'
import showWarningAlert from '../libs/showWarningAlert'
import { CircularProgress } from '@mui/material';
import { supabase } from '../libs/supabaseClient';

export default function AddTask() {
    const router = useNavigate();
    const [taskData, setTaskData] = useState({
        name: '',
        detail: '',
        isCompleted: '',
        imgFile: null,
        imgPreview: "",
    });
    const [requesting, setRequesting] = useState(false);

    // const showWarningAlert = (msg) => {
    //     Swal.fire({
    //         icon: 'warning',
    //         iconColor: '#f59800',
    //         text: msg,
    //         confirmButtonText: 'ตกลง',
    //         confirmButtonColor: '#0049f5',
    //     })
    // }

    const handleSetTaskData = (e) => {
        setTaskData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value
        }));
    }

    const handleImageSelect = (e) => {
        const file = e.target.files[0];

        setTaskData((prevData) => ({
            ...prevData,
            imgFile: file,
            imgPreview: URL.createObjectURL(file),
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setRequesting(true);

        if (taskData.name.trim() === '' || taskData.detail.trim() === '' || taskData.isCompleted === '') {
            showWarningAlert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        let imageUrl = '';
        if (taskData.imgFile) {
            const imageName = `task_img_${Date.now()}`;
            try {
                const { data, error } = await supabase
                    .storage
                    .from('task_storage')
                    .upload(imageName, taskData.imgFile);
                if (error) {
                    throw error;
                } else {
                    const {data} = supabase
                        .storage
                        .from('task_storage')
                        .getPublicUrl(imageName);
                    imageUrl = data.publicUrl;
                }
            } catch (error) {
                showWarningAlert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพงาน กรุณาลองใหม่อีกครั้ง!!!');
                console.log('Error uploading image:', error);
                setRequesting(false);
                return;
            } finally {
                setRequesting(false);
            }
            // imageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/task_storage/${imageName}`;
        }
        try {
            const { data, error } = await supabase
                .from('tb_task')
                .insert([{
                    title: taskData.name,
                    detail: taskData.detail,
                    is_completed: taskData.isCompleted,
                    image_url: imageUrl,
                }]);
            if (error) {
                throw error;
            }
            router('/showalltask');
        } catch (error) {
            showWarningAlert('เกิดข้อผิดพลาดในการบันทึกข้อมูลงาน กรุณาลองใหม่อีกครั้ง!!!');
            console.log('Error inserting task data:', error);
        } finally {
            setRequesting(false);
        }
    }


    return (
        <div className='w-full min-h-screen flex flex-col'>
            <div className="w-8/12 border-gray-300 shadow-md rounded p-5 mx-auto my-auto flex flex-col items-center">

                <img src={taskimg} alt="Task" className="w-30 mb-4" />

                <h1 className="text-2xl font-bold text-gray-800 text-center">
                    Task Application
                    <br />
                    -- เพิ่มข้อมูลงาน --
                </h1>

                <div className="w-full">
                    <div>
                        <label htmlFor='task_name'>ชื่องาน</label>
                        <input
                            id='task_name'
                            name='name'
                            type="text"
                            className="w-full p-2 border border-gray-700 rounded mt-2 mb-4"
                            value={taskData.name}
                            onChange={handleSetTaskData}
                        />
                    </div>
                    <div>
                        <label htmlFor='task_detail'>รายละเอียดงาน</label>
                        <input
                            id='task_detail'
                            name='detail'
                            type="text"
                            className="w-full p-2 border border-gray-700 rounded mt-2 mb-4"
                            value={taskData.detail}
                            onChange={handleSetTaskData}
                        />
                    </div>
                    <div>
                        <label className='mr-4'>รูปภาพงาน</label>
                        <input
                            id='task_pic'
                            name='imgFile'
                            type="file"
                            accept='image/*'
                            className="hidden"
                            onChange={handleImageSelect}
                        />
                        <label htmlFor='task_pic'
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
                        >
                            เลือกรูปภาพงาน
                        </label>
                        {taskData.imgPreview && (
                            <img src={taskData.imgPreview} alt="Preview" className="w-40 mt-4 mx-auto" />
                        )}
                    </div>
                    <div className='w-full'>
                        <select
                            name='isCompleted'
                            className="w-full p-2 border border-gray-700 rounded mt-4"
                            value={taskData.isCompleted}
                            onChange={handleSetTaskData}
                        >
                            <option value={null}>-- เลือกสถานะงาน --</option>
                            <option value={true}>เสร็จแล้ว</option>
                            <option value={false}>ยังไม่เสร็จ</option>
                        </select>
                    </div>
                    <div className='w-full flex justify-center'>
                        {requesting ?
                            (
                                <CircularProgress
                                size={24}
                                className="mx-auto mt-6"
                                />
                            )
                            :
                            (
                                <button
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-6"
                                    onClick={handleSubmit}
                                >
                                    บันทึกข้อมูล
                                </button>
                            )
                        }
                    </div>

                    <div>
                        <Link to="/showalltask"
                            className="w-full flex justify-center text-gray-800 px-4 py-2 rounded mt-6"
                        >
                            กลับไปหน้าข้อมูลงานทั้งหมด
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
