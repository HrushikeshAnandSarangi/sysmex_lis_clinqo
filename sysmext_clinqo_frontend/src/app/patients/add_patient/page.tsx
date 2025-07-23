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

  const [testDetails, setTestDetails] = useState<{ [key: string]: string }>({})
  const [newParam, setNewParam] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleTestParamChange = (param: string, value: string) => {
    setTestDetails((prev) => ({ ...prev, [param]: value }))
  }

  const addParameter = () => {
    const trimmed = newParam.trim()
    if (trimmed && !testDetails.hasOwnProperty(trimmed)) {
      setTestDetails((prev) => ({ ...prev, [trimmed]: "awaited" }))
      setNewParam("")
    }
  }

  const removeParameter = (param: string) => {
    const updated = { ...testDetails }
    delete updated[param]
    setTestDetails(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      ...formData,
      test_details: testDetails,
    }

    try {
      const res = await fetch("http://localhost:8000/api/patients/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-white text-green-700 font-medium rounded-xl border-2 border-green-200 hover:bg-green-50 hover:border-green-300 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg mb-6"
        >
          <span className="text-xl mr-3">←</span>
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-bold text-green-800 mb-2">Register New Patient</h1>
        <div className="w-32 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6" />

        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-green-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formFields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-semibold text-green-700 uppercase tracking-wide">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  name={field.name}
                  type={field.type}
                  value={formData[field.name as keyof typeof formData]}
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 bg-green-50/30 placeholder-green-600/60 text-green-900"
                  onChange={handleChange}
                  required={field.required}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-semibold text-green-700 uppercase tracking-wide">Gender</label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-green-200 rounded-xl bg-green-50/30 text-green-900"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-green-700 uppercase tracking-wide">Address</label>
              <textarea
                name="address"
                value={formData.address}
                rows={4}
                className="w-full px-4 py-3 border-2 border-green-200 rounded-xl bg-green-50/30 text-green-900 resize-none"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Test Parameters Section */}
          <div>
            <h3 className="text-xl font-bold text-green-800 mb-2">Test Parameters</h3>
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                value={newParam}
                onChange={(e) => setNewParam(e.target.value)}
                placeholder="Enter parameter name"
                className="flex-1 px-4 py-2 border-2 border-green-200 rounded-xl bg-green-50/30"
              />
              <button
                type="button"
                onClick={addParameter}
                className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
              >
                + Add
              </button>
            </div>

            {Object.entries(testDetails).length === 0 && (
              <p className="text-green-600 text-sm">No test parameters added yet.</p>
            )}

            {Object.entries(testDetails).map(([param, value]) => (
              <div key={param} className="flex items-center gap-4 mb-2">
                <input
                  type="text"
                  value={param}
                  disabled
                  className="flex-1 px-4 py-2 border border-green-300 rounded-md bg-green-100 text-green-900"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleTestParamChange(param, e.target.value)}
                  placeholder="Enter result"
                  className="flex-1 px-4 py-2 border border-green-300 rounded-md bg-white"
                />
                <button
                  type="button"
                  onClick={() => removeParameter(param)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/"
              className="px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-10 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700"
            >
              ✓ Register Patient & Sample
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
