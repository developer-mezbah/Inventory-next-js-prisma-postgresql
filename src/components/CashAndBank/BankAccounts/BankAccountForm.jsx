"use client"
import client_api from '@/utils/API_FETCH';
import React, { useEffect, useState } from 'react'
import { BiLoader, BiMinus, BiPlus } from 'react-icons/bi';
import { FiRefreshCcw } from 'react-icons/fi';
import { GrClose } from 'react-icons/gr';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';


// Common Tailwind classes for the floating label input style
const inputClass = "block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border shadow appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer placeholder-transparent focus:placeholder-gray-400 transition-all duration-200";
const labelClass = "absolute transition-all text-md text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-left bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1";

// Helper function to get the correct border class
const getBorderClass = (isError) =>
    isError ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-600"


// Helper component for a single Floating Input Field
const FloatingInput = ({ id, type = "text", label, value, onChange, placeholder = "", min, step, isRequired, isError }) => (
    <div className="relative">
        <input
            type={type}
            id={id}
            value={value || ""}
            onChange={(e) => onChange(id, e.target.value)}
            placeholder={placeholder}
            className={`${inputClass} ${getBorderClass(isError)}`}
            min={min}
            step={step}
        />
        <label
            htmlFor={id}
            className={labelClass}
        >
            {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
    </div>
);

// const initialFormData = {
//   accountdisplayname: '',
//   openingbalance: '',
//   asofdate: '',
//   accountnumber: '',
//   IFSCCode: '',
//   UPIID: '',
//   BankName: '',
//   AccountHolderName: '',
//   Notes: '',
// };

const REQUIRED_FIELDS = [
    "accountdisplayname",
    "openingbalance"
]

const BankAccountForm = ({ isShowForm, onClose, initialData, refetch, updateFormId, onPaymentTypeChange }) => {
    const [showMoreFields, setShowMoreFields] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [validationErrors, setValidationErrors] = useState({})
    const [formData, setFormData] = useState({})

    useEffect(() => {
        if (updateFormId) {
            const findData = initialData?.find(item => item?.id === updateFormId)
            setFormData(findData)
        }
    }, [updateFormId])

    useEffect(() => {
        if (updateFormId) {
            if (formData?.accountnumber || formData?.IFSCCode || formData?.UPIID || formData?.BankName || formData?.AccountHolderName || formData?.Notes) {
                setShowMoreFields(true)
            }
        }
    }, [formData, updateFormId])

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        // Clear validation error when the user starts typing/selecting
        if (validationErrors[field]) {
            setValidationErrors((prev) => {
                const { [field]: _, ...rest } = prev
                return rest
            })
        }
    }

    const validateForm = () => {
        const errors = {}
        REQUIRED_FIELDS.forEach((field) => {
            const value = formData[field]
            if (value === null || value === undefined || value === "") {
                errors[field] = true
            }
        })
        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Please fill in all required fields (marked with a red border).",
            });
            return
        }

        setIsSubmitting(true)


        if (updateFormId) {
            // id use for ignore to pass in the server
            const { id, ...newFormData } = { ...formData, openingbalance: parseFloat(formData?.openingbalance) }
            
            client_api.update(`/api/cashandbank/${updateFormId}`, "token", newFormData).then((res) => {
                if (!res?.error) {
                    refetch()
                    toast.success("Data Updated successfully")
                    onClose()
                } else {
                    toast.error("Something went Wrong!")
                }
            }).catch((err) => {
                toast.error("Error Updating item")
            }).finally(() => {
                setIsSubmitting(false)
            })
        } else {
            client_api.create('/api/cashandbank', "token", { ...formData, openingbalance: parseFloat(formData?.openingbalance) }).then((res) => {
                if (res.status) {
                    onPaymentTypeChange && onPaymentTypeChange(res?.data)
                    refetch()
                    toast.success("Data added successfully.")
                    onClose()
                }
            }).catch((err) => {
                toast.error("Error cashandbank item")
            }).finally(() => {
                setIsSubmitting(false)
            })
        }
    }

    const toggleMoreFields = () => {
        setShowMoreFields(prev => !prev);
    };
    return (
        <div className={`${isShowForm ? "bg-transparent" : "bg-gray-100"} p-4 relative sm:p-8 flex items-center justify-center`}>
            <div className="w-full bg-white max-h-screen overflow-y-scroll shadow-xl rounded-2xl p-6 md:p-10 transition-all duration-300">
                {isShowForm && <button onClick={onClose} className='absolute right-16 text-xl hover:text-red-500 cursor-pointer'><GrClose /></button>}
                {/* Heading and Title Section */}
                <header className="mb-8 border-b pb-4">
                    <h1 className="text-3xl font-extrabold text-gray-800 flex items-center">
                        <FiRefreshCcw className="w-6 h-6 mr-3 text-blue-600" />
                        {updateFormId ? "Bank Account Setup" : "New Bank Account Setup"}
                    </h1>
                    <p className="mt-1 text-gray-500">
                        Enter the required details to register a new bank or cash account.
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* 3 Required Fields Section (Always visible) */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-700">Essential Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* Account Display Name */}
                            <FloatingInput
                                id="accountdisplayname"
                                type="text"
                                label="Account Display Name"
                                value={formData.accountdisplayname}
                                placeholder='Enter Account Display Name'
                                onChange={handleInputChange}
                                isRequired={true}
                                isError={validationErrors.accountdisplayname}
                            />

                            {/* Opening Balance */}
                            <FloatingInput
                                id="openingbalance"
                                type="number"
                                label="Opening Balance (Currency)"
                                value={formData.openingbalance}
                                onChange={handleInputChange}
                                step="0.01"
                                isRequired={true}
                                placeholder='Enter Opening Balance'
                                isError={validationErrors.openingbalance}
                            />

                            {/* As of Date */}
                            <FloatingInput
                                id="asofdate"
                                type="date"
                                label="Balance As of Date"
                                value={formData.asofdate ? new Date(formData.asofdate).toISOString().split("T")[0] : ""}
                                onChange={handleInputChange}
                            />
                        </div>
                    </section>

                    {/* Add More Fields Toggle Button */}
                    <div className="flex justify-start">
                        <button
                            type="button"
                            onClick={toggleMoreFields}
                            className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition duration-150 p-2 -ml-2 rounded-lg"
                        >
                            {showMoreFields ? <BiMinus className="w-5 h-5 mr-2" /> : <BiPlus className="w-5 h-5 mr-2" />}
                            {showMoreFields ? 'Hide Optional Fields' : 'Add More Bank Details'}
                        </button>
                    </div>

                    {/* Optional Fields Section (Toggleable) */}
                    {showMoreFields && (
                        <section className="space-y-6 animate-fadeIn transition-all duration-300">
                            <h2 className="text-xl font-semibold text-gray-700">Optional Bank Information</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                                {/* Account Number */}
                                <FloatingInput
                                    id="accountnumber"
                                    type="text"
                                    label="Account Number"
                                    value={formData.accountnumber}
                                    onChange={handleInputChange}
                                />

                                {/* IFSC Code */}
                                <FloatingInput
                                    id="IFSCCode"
                                    type="text"
                                    label="IFSC / Swift Code"
                                    value={formData.IFSCCode}
                                    onChange={handleInputChange}
                                />

                                {/* UPI ID */}
                                <FloatingInput
                                    id="UPIID"
                                    type="text"
                                    label="UPI ID / Payment Handle"
                                    value={formData.UPIID}
                                    onChange={handleInputChange}
                                />

                                {/* Bank Name */}
                                <FloatingInput
                                    id="BankName"
                                    type="text"
                                    label="Bank Name / Institution"
                                    value={formData.BankName}
                                    onChange={handleInputChange}
                                />

                                {/* Account Holder Name */}
                                <FloatingInput
                                    id="AccountHolderName"
                                    type="text"
                                    label="Account Holder Name"
                                    value={formData.AccountHolderName}
                                    onChange={handleInputChange}
                                />

                                {/* Notes */}
                                <FloatingInput
                                    id="Notes"
                                    type="text"
                                    label="Internal Notes"
                                    value={formData.Notes}
                                    onChange={handleInputChange}
                                    className="sm:col-span-2 lg:col-span-3"
                                />

                            </div>
                        </section>
                    )}

                    {/* Submit Button and Status */}
                    <div className="pt-4 flex items-center justify-between">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <BiLoader className="animate-spin w-5 h-5 mr-2" />
                                    Submitting...
                                </>
                            ) : (
                                updateFormId ? 'Update Bank Account' : 'Create Bank Account'
                            )}
                        </button>


                    </div>
                </form>

                {/* Tailwind Utility for custom animation (optional) */}
                <style jsx="true">{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fadeIn {
                        animation: fadeIn 0.3s ease-out;
                    }
                `}</style>
            </div>
        </div>
    )
}

export default BankAccountForm