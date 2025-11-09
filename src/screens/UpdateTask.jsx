import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Footer from '../components/Footer'
import taskimg from '../assets/task.png'
import { supabase } from '../libs/supabaseClient';
import { DeleteRounded } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';

export default function UpdateTask() {
    const router = useNavigate();
    const { id } = useParams();
    const [taskData, setTaskData] = useState({
        name: '',
        detail: '',
        isCompleted: '',
        imgFile: null,
        imgPreview: "",
    });
    const [requesting, setRequesting] = useState(false);

    const [prevTaskData, setPrevTaskData] = useState({});

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

        if (taskData.name.trim() === '' || taskData.detail.trim() === '' || taskData.isCompleted === '') {
            showWarningAlert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        setRequesting(true);

        if (prevTaskData.imgPreview != taskData.imgPreview) {
            if (!taskData.imgPreview && prevTaskData.imgPreview) {
                try {
                    const imageName = prevTaskData.imgPreview.split('/').pop();
                    const { data, error } = await supabase
                        .storage
                        .from('task_storage')
                        .remove([imageName]);
                    if (error) {
                        throw error;
                    }
                } catch (error) {
                    showWarningAlert('เกิดข้อผิดพลาดในการลบรูปภาพงาน กรุณาลองใหม่อีกครั้ง!!!');
                }
            } else {
                let imageUrl = '';
                const imageName = `task_img_${Date.now()}`;
                try {
                    const { data, error } = await supabase
                        .storage
                        .from('task_storage')
                        .upload(imageName, taskData.imgFile);
                    if (error) {
                        throw error;
                    } else {
                        const { data } = supabase
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
                }
                taskData.imgPreview = imageUrl;
            }

        }

        try {
            const { data, error } = await supabase
                .from('tb_task')
                .update({
                    title: taskData.name,
                    detail: taskData.detail,
                    is_completed: taskData.isCompleted,
                    image_url: taskData.imgPreview,
                })
                .eq('id', id);
            if (error) {
                throw error;
            }
        } catch (error) {
            showWarningAlert('เกิดข้อผิดพลาดในการบันทึกข้อมูลงาน กรุณาลองใหม่อีกครั้ง!!!');
            console.log('Error updating task data:', error);
        } finally {
            setRequesting(false);
            router('/showalltask');
        }
    }

    useEffect(() => {
        try {
            const fetchTaskById = async () => {
                const { data, error } = await supabase
                    .from('tb_task')
                    .select("*")
                    .eq('id', id)
                    .single();
                if (error) {
                    alert("เกิดข้อผิดพลาดในการดึงข้อมูลงาน กรุณาลองใหม่อีกครั้ง!!!");
                    throw error;
                } else {
                    setTaskData({
                        name: data.title,
                        detail: data.detail,
                        isCompleted: data.is_completed,
                        imgFile: null,
                        imgPreview: data.image_url,
                    });
                    setPrevTaskData({
                        name: data.title,
                        detail: data.detail,
                        isCompleted: data.is_completed,
                        imgPreview: data.image_url,
                    });
                }
            }

            fetchTaskById();
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการดึงข้อมูลงาน กรุณาลองใหม่อีกครั้ง!!!");
            console.log("Error fetching task:", error);
        }
    }, []);


    return (
        <div className='w-full min-h-screen flex flex-col'>
            <div className="w-8/12 border-gray-300 shadow-md rounded p-5 mx-auto my-auto flex flex-col items-center">

                <img src={taskimg} alt="Task" className="w-30 mb-4" />

                <h1 className="text-2xl font-bold text-gray-800 text-center">
                    Task Application
                    <br />
                    -- แก้ไขข้อมูลงาน --
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
                            <div className='flex flex-col items-center'>
                                <img src={taskData.imgPreview} alt="Preview" className="w-40 mt-4 mx-auto" />
                                <span className='flex items-center bg-red-600 text-white rounded-md px-2 py-1 mt-1 cursor-pointer'
                                    onClick={() => setTaskData((prevData) => ({
                                        ...prevData,
                                        imgFile: null,
                                        imgPreview: "",
                                    }))}
                                >
                                    <DeleteRounded
                                        className="cursor-pointer"
                                    />
                                    <span>ลบรูปภาพ</span>
                                </span>
                            </div>
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
