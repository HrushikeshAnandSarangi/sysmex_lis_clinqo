"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import AddSampleForm from "@/components/AddSampletoPatient"

interface TestResult {
  value: number
  unit: string
}

interface Sample {
  sample_id: string
  test_details: Record<string, TestResult> | null
  created_at: string
}

interface Patient {
  patient_id: string
  name: string
  age: number
  sex: string
  mobile: string
  land_line: string
  state: string
  district: string
  address: string
  samples?: Sample[]
}

export default function PatientPage() {
  const params = useParams()
  const patient_id = typeof params?.patient_id === "string" ? params.patient_id : ""
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [newSampleId, setNewSampleId] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Fetch patient data
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/patients/${patient_id}/`)
        if (!res.ok) throw new Error("Failed to fetch patient")
        const data = await res.json()
        setPatient(data)
      } catch (err) {
        console.error("Error fetching patient:", err)
      } finally {
        setLoading(false)
      }
    }
    if (patient_id) fetchPatient()
  }, [patient_id])

  const handleAddSample = async () => {
    if (!newSampleId.trim()) return alert("Sample ID cannot be empty")
    if (!patient?.patient_id) return

    try {
      setSubmitting(true)
      const res = await fetch(`http://localhost:8000/api/add_sample/${patient_id}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sample_id: newSampleId.trim(),
          patient: patient.patient_id,
          test_details: {},
        }),
      })
      if (!res.ok) throw new Error("Failed to add sample")
      alert("Sample added successfully!")
      window.location.reload()
    } catch (err) {
      console.error(err)
      alert("Error adding sample")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="max-w-6xl mx-auto p-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-green-600 text-xl font-medium">Loading patient details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="max-w-6xl mx-auto p-8">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-white text-green-700 font-medium rounded-xl border-2 border-green-200 hover:bg-green-50 hover:border-green-300 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg mb-6"
          >
            <span className="text-xl mr-3">←</span>
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              </div>
              <p className="text-red-600 text-xl font-medium">Patient not found</p>
              <p className="text-red-500 mt-2">The requested patient could not be located in the database.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const hasSamples = Array.isArray(patient.samples) && patient.samples.length > 0

  const patientInfo = [
    { label: "Patient ID", value: patient.patient_id },
    { label: "Full Name", value: patient.name },
    { label: "Age", value: `${patient.age} years` },
    { label: "Gender", value: patient.sex },
    { label: "Mobile", value: patient.mobile },
    { label: "Land Line", value: patient.land_line || "Not provided" },
    { label: "State", value: patient.state },
    { label: "District", value: patient.district },
    { label: "Address", value: patient.address },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header with Back Button */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-white text-green-700 font-medium rounded-xl border-2 border-green-200 hover:bg-green-50 hover:border-green-300 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg mb-6"
          >
            <span className="text-xl mr-3">←</span>
            Back to Dashboard
          </Link>

          <h1 className="text-4xl font-bold text-green-800 mb-2">Patient Profile</h1>
          <div className="w-32 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
          <p className="text-green-600 mt-4 text-lg">Complete medical record and sample history</p>
        </div>

        {/* Patient Information Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden hover:shadow-2xl transition-shadow duration-300 mb-8">
          <div className="p-8">
            <div className="flex items-center mb-8">
              <div className="w-3 h-10 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-4"></div>
              <h2 className="text-2xl font-semibold text-green-800">Patient Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patientInfo.map((info, index) => (
                <div
                  key={info.label}
                  className="bg-green-50/50 rounded-xl p-4 border border-green-100 hover:bg-green-50 transition-colors duration-200"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">{info.label}</p>
                      <p className="text-green-900 font-medium mt-1 break-words">{info.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sample History Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden hover:shadow-2xl transition-shadow duration-300 mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="w-3 h-10 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-4"></div>
                <h2 className="text-2xl font-semibold text-green-800">Sample History</h2>
              </div>
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                {hasSamples
                  ? `${patient.samples!.length} Sample${patient.samples!.length !== 1 ? "s" : ""}`
                  : "No Samples"}
              </div>
            </div>

            {!hasSamples ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                </div>
                <p className="text-green-600 text-lg font-medium">No samples found</p>
                <p className="text-green-500 text-sm mt-2">Add a new sample to get started with testing</p>
              </div>
            ) : (
              <div className="space-y-6">
                {patient.samples!.map((sample, index) => (
                  <div
                    key={sample.sample_id}
                    className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-xl p-6 border border-green-100 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                        <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                          <span className="text-green-800 font-bold">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-green-900">Sample ID: {sample.sample_id}</p>
                          <p className="text-sm text-green-600">
                            Created:{" "}
                            {new Date(sample.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-green-200 pt-4">
                      <h3 className="font-semibold text-green-800 mb-3">Test Results</h3>
                      {!sample.test_details || Object.keys(sample.test_details).length === 0 ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                            <div>
                              <p className="text-yellow-800 font-medium">No test results available</p>
                              <p className="text-yellow-600 text-sm">
                                Results will appear here once testing is complete
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(sample.test_details).map(([test, result]) => (
                            <div key={test} className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                              <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">{test}</p>
                              <p className="text-lg font-bold text-green-900 mt-1">
                                {result.value} <span className="text-sm font-normal text-green-600">{result.unit}</span>
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add New Sample Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden hover:shadow-2xl transition-shadow duration-300 w-[100vw]">
          <AddSampleForm patient_id={patient.patient_id} />
          {/* Footer Info */}
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-8 py-4">
            <div className="flex items-center text-sm text-green-700">
              <span>
                New samples will be available for testing immediately after creation. Test results will be updated
                automatically when available.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
