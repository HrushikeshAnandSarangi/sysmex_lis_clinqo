"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewPatientPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    patient_id: "",
    sample_id: "",
    name: "",
    age: "",
    sex: "",
    mobile: "",
    land_line: "",
    state: "",
    district: "",
    address: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("http://localhost:8000/api/patients/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error("Submission failed")
      alert("Patient and Sample Registered!")
      router.push(`/patients/${formData.patient_id}`)
    } catch (err) {
      alert("Failed to submit")
      console.error(err)
    }
  }

  const formFields = [
    { name: "patient_id", label: "Patient ID", type: "text", required: true },
    { name: "sample_id", label: "Sample ID", type: "text", required: true },
    { name: "name", label: "Full Name", type: "text", required: true },
    { name: "age", label: "Age", type: "number", required: true },
    { name: "mobile", label: "Mobile Number", type: "tel", required: true },
    { name: "land_line", label: "Land Line", type: "tel", required: false },
    { name: "state", label: "State", type: "text", required: true },
    { name: "district", label: "District", type: "text", required: true },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header with Back Button */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-white text-green-700 font-medium rounded-xl border-2 border-green-200 hover:bg-green-50 hover:border-green-300 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg mb-6"
          >
            <span className="text-xl mr-3">←</span>
            Back to Dashboard
          </Link>

          <h1 className="text-4xl font-bold text-green-800 mb-2">Register New Patient</h1>
          <div className="w-32 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
          <p className="text-green-600 mt-4 text-lg">Add a new patient and sample to the database</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
          <div className="p-8">
            <div className="flex items-center mb-8">
              <div className="w-3 h-10 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-4"></div>
              <h2 className="text-2xl font-semibold text-green-800">Patient Information</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formFields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="block text-sm font-semibold text-green-700 uppercase tracking-wide">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                      name={field.name}
                      type={field.type}
                      value={formData[field.name as keyof typeof formData]}
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-200 bg-green-50/30 placeholder-green-600/60 text-green-900 font-medium hover:border-green-300"
                      onChange={handleChange}
                      required={field.required}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>

              {/* Sex Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-green-700 uppercase tracking-wide">
                  Gender <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-200 bg-green-50/30 text-green-900 font-medium hover:border-green-300"
                  onChange={handleChange}
                  required
                >
                  <option value="" className="text-green-600">
                    Select Gender
                  </option>
                  <option value="Male" className="text-green-900">
                    Male
                  </option>
                  <option value="Female" className="text-green-900">
                    Female
                  </option>
                  <option value="Other" className="text-green-900">
                    Other
                  </option>
                </select>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-green-700 uppercase tracking-wide">
                  Address <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-200 bg-green-50/30 placeholder-green-600/60 text-green-900 font-medium hover:border-green-300 resize-none"
                  onChange={handleChange}
                  required
                  placeholder="Enter complete address"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-green-100">
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <Link
                    href="/"
                    className="px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg text-center"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                  >
                    <span className="text-xl mr-3">✓</span>
                    Register Patient & Sample
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Form Footer */}
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-8 py-4">
            <div className="flex items-center text-sm text-green-700">
              <span className="text-lg mr-2">ℹ️</span>
              <span>
                All fields marked with <span className="text-red-500 font-semibold">*</span> are required. Please ensure
                all information is accurate before submitting.
              </span>
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">Quick Tips</h3>
              <ul className="text-green-600 space-y-1 text-sm">
                <li>• Patient ID should be unique and follow your organization's format</li>
                <li>• Sample ID will be used to track laboratory samples</li>
                <li>• Double-check contact information for accurate communication</li>
                <li>• Address should include complete details for proper identification</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
