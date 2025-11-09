import React from 'react'
import Footer from './../components/Footer.jsx'
import taskimg from './../assets/task.png'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './../libs/supabaseClient.js'
import { DeleteRounded, EditRounded } from '@mui/icons-material'
import TimeAgo from 'javascript-time-ago'
import ReactTimeAgo from 'react-time-ago'
import en from 'javascript-time-ago/locale/en'
import th from 'javascript-time-ago/locale/th'
import showWarningAlert from '../libs/showWarningAlert.js'
import { CircularProgress } from '@mui/material'

TimeAgo.addDefaultLocale(en);
TimeAgo.addLocale(th);

export default function ShowAllTask() {
    const [tasks, setTasks] = useState([])
    const [requesting, setRequesting] = useState(null);

    //จะทำงานตอนที่เพจถูกเปิดขึ้นมา (rendered)
    useEffect(() => {
        //ดึงข้อมูลงานทั้งหมดจาก Supabase
        try {
            //สร้างฟังก์ชันสำหรับดึงข้อมูล
            const fetchTasks = async () => {
                //ดึงข้อมูลจาก supabase (Postgres Database)
                const { data, error } = await supabase
                    .from('tb_task')          //ระบุชื่อตาราง
                    .select("*")              //ระบุว่าจะดึงข้อมูลคอลัมน์อะไรบ้าง
                    .order('created_at', { ascending: false }) //เรียงลำดับข้อมูลจากใหม่ไปเก่า
                //ตรวจสอบว่ามี error หรือไม่
                if (error) {
                    alert("เกิดข้อผิดพลาดในการดึงข้อมูลงาน กรุณาลองใหม่อีกครั้ง!!!")
                    throw error
                } else {
                    //นำข้อมูลที่ดึงมา data ไปเก็บไว้ที่ state tasks ที่สร้างไว้
                    setTasks(data)
                    console.log("Fetched tasks:", data)
                }
            }

            //เรียกใช้ฟังก์ชันดึงข้อมูลให้ทำงาน
            fetchTasks()
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการดึงข้อมูลงาน กรุณาลองใหม่อีกครั้ง!!!")
            console.log("Error fetching tasks:", error)
        }
    }, [])

    const handleDeleteTask = async (id, imgUrl) => {
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบงานนี้?')) {
            return;
        }
        console.log("Delete task with id:", id)

        setRequesting(id);

        try {
            const { data, error } = await supabase
                .from('tb_task')
                .delete()
                .eq('id', id);
            if (error) {
                throw error;
            }
        } catch (error) {
            showWarningAlert('เกิดข้อผิดพลาดในการลบข้อมูลงาน กรุณาลองใหม่อีกครั้ง!!!');
            console.log('Error deleting task data:', error);
            setRequesting(null);
            return;
        }
        if (imgUrl) {
            const imageName = imgUrl.split('/').pop();
            try {
                const { error } = await supabase
                    .storage
                    .from('task_storage')
                    .remove([imageName]);
                if (error) {
                    throw error;
                }
            } catch (error) {
                showWarningAlert('เกิดข้อผิดพลาดในการลบรูปภาพงาน กรุณาลองใหม่อีกครั้ง!!!');
                console.log('Error deleting image:', error);
                setRequesting(null);
                return;
            }
        }

        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
        setRequesting(null);
    }

    return (
        <div className='w-full min-h-screen flex flex-col'>
            <div className="w-8/12 border-gray-300 shadow-md rounded p-5 mx-auto my-auto flex flex-col items-center">

                <img src={taskimg} alt="Task" className="w-30 mb-4" />

                <h1 className="text-2xl font-bold text-gray-800 text-center">
                    Task Application
                    <br />
                    -- ข้อมูลงานทั้งหมด --
                </h1>

                {/* ส่วนของปุ่มเปิดไปหน้า /addtask  */}
                <div className="w-full flex justify-end mt-4 mb-7">
                    <Link to="/addtask" className="bg-blue-500 hover:bg-blue-600 cursor-pointer p-3 text-white rounded">
                        เพิ่มงานใหม่
                    </Link>
                </div>

                {/* ส่วนของการแสดงข้อมูลงานทั้งหมดจาก Supabase */}
                <div className="w-full">
                    <table className="w-full border border-gray-700 text-sm">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-2 border border-gray-700">รูป</th>
                                <th className="p-2 border border-gray-700">ชื่องาน</th>
                                <th className="p-2 border border-gray-700">รายละเอียดงาน</th>
                                <th className="p-2 border border-gray-700">สถานะงาน</th>
                                <th className="p-2 border border-gray-700">วันที่สร้างงาน</th>
                                <th className="p-2 border border-gray-700">วันที่อัพเดทงาน</th>
                                <th className="p-2 border border-gray-700">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                tasks.map((task) => (
                                    <tr key={task.id}>
                                        <td className="p-2 border border-gray-700">
                                            <img src={task.image_url ?? taskimg} alt={task.title} className="w-20 mx-auto" />
                                        </td>
                                        <td className="p-2 border border-gray-700">{task.title}</td>
                                        <td className="p-2 border border-gray-700">{task.detail}</td>
                                        <td className="p-2 border border-gray-700 text-center">
                                            {task.is_completed === true ? (
                                                <span className="text-green-600 font-bold">เสร็จแล้ว</span>
                                            ) : (
                                                <span className="text-red-600 font-bold">ยังไม่เสร็จ</span>
                                            )}
                                        </td>
                                        <td className="p-2 border border-gray-700 text-center">
                                            {/* {new Date(task.created_at).toLocaleDateString('th-TH', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })} */}
                                            <ReactTimeAgo date={task.created_at} locale='th-TH' />
                                        </td>
                                        <td className="p-2 border border-gray-700 text-center">
                                            {/* {new Date(task.updated_at).toLocaleDateString('th-TH', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })} */}
                                            <ReactTimeAgo date={task.updated_at} locale='th-TH' />
                                        </td>
                                        <td className="p-2 border border-gray-700">
                                            <div className="flex flex-col gap-2">
                                                <Link to={`/updatetask/${task.id}`}
                                                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded flex items-center gap-2"
                                                >
                                                    <EditRounded
                                                        style={{
                                                            fontSize: "20px"
                                                        }}
                                                    />
                                                    <span>แก้ไข</span>
                                                </Link>
                                                {/* <Link to={`/deltask`}
                                                    className="bg-red-400 hover:bg-red-500 text-white px-2 py-1 rounded flex items-center gap-2">
                                                    <DeleteRounded
                                                        style={{
                                                            fontSize: "20px"
                                                        }}
                                                    />
                                                    <span>ลบ</span>
                                                </Link> */}
                                                <button
                                                    onClick={() => handleDeleteTask(task.id, task.image_url)}
                                                    className="bg-red-400 hover:bg-red-500 text-white px-2 py-1 rounded flex items-center gap-2"
                                                    disabled={requesting === task.id}
                                                >
                                                    {requesting === task.id ? (
                                                        <CircularProgress
                                                            size={20}
                                                            className="text-white"
                                                        />
                                                    ) : (
                                                        <>
                                                            <DeleteRounded
                                                                style={{
                                                                    fontSize: "20px"
                                                                }}
                                                            />
                                                            <span>ลบ</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            <Footer />
        </div>
    )
}