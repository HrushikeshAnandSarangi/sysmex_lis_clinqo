"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"

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
}

export default function AdminDashboard() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [search, setSearch] = useState({ name: "", patient_id: "" })

  const fetchPatients = async () => {
    try {
      const query = new URLSearchParams(search).toString()
      const res = await fetch(`http://localhost:8000/api/all-patients/?${query}`)
      const data = await res.json()
      setPatients(data)
    } catch (err) {
      console.error("Error fetching patients", err)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return alert("Please select a file")
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("http://localhost:8000/api/upload/", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) throw new Error("Upload failed")
      alert("File uploaded and parsed!")
      fetchPatients() // refresh if new data added
    } catch (err) {
      console.error(err)
      alert("Upload error")
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch({ ...search, [e.target.name]: e.target.value })
  }

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    fetchPatients()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Admin Dashboard</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 mb-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-6">
            <div className="w-3 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-4"></div>
            <h2 className="text-2xl font-semibold text-green-800">Upload Sysmex File</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-green-700 mb-2">Select .txt file</label>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors duration-200 bg-green-50/50"
              />
            </div>
            <button
              onClick={handleUpload}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Upload & Parse
            </button>
          </div>
        </div>

        {/* Add Patient Section */}
        <div className="mb-8">
          <Link
            href="/patients/add_patient"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <span className="text-xl mr-3"></span>
            Add New Patient
          </Link>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 mb-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-6">
            <div className="w-3 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-4"></div>
            <h2 className="text-2xl font-semibold text-green-800">Search Patients</h2>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                name="name"
                placeholder="Search by Name"
                className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors duration-200 bg-green-50/30 placeholder-green-600/60"
                value={search.name}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex-1">
              <input
                name="patient_id"
                placeholder="Search by Patient ID"
                className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors duration-200 bg-green-50/30 placeholder-green-600/60"
                value={search.patient_id}
                onChange={handleSearchChange}
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-green-700 to-emerald-700 text-white font-semibold rounded-xl hover:from-green-800 hover:to-emerald-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Search
            </button>
          </form>
        </div>

        {/* Patient Table Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="p-8 pb-0">
            <div className="flex items-center mb-6">
              <div className="w-3 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-4"></div>
              <h2 className="text-2xl font-semibold text-green-800">Patient Database</h2>
              <div className="ml-auto bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                {patients.length} {patients.length === 1 ? "Patient" : "Patients"}
              </div>
            </div>
          </div>

          {patients.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">👥</span>
              </div>
              <p className="text-green-600 text-lg font-medium">No patients found</p>
              <p className="text-green-500 text-sm mt-2">Try adjusting your search criteria or add new patients</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-green-800 uppercase tracking-wider">
                      Patient ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-green-800 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-green-800 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-green-800 uppercase tracking-wider">
                      Sex
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-green-800 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-100">
                  {patients.map((p, index) => (
                    <tr
                      key={p.patient_id}
                      className={`hover:bg-green-50/50 transition-colors duration-150 ${
                        index % 2 === 0 ? "bg-white" : "bg-green-50/20"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-green-900">{p.patient_id}</td>
                      <td className="px-6 py-4 text-sm text-green-800 font-medium">{p.name}</td>
                      <td className="px-6 py-4 text-sm text-green-700">{p.age}</td>
                      <td className="px-6 py-4 text-sm text-green-700">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            p.sex.toLowerCase() === "male" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"
                          }`}
                        >
                          {p.sex}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          href={`/patients/${p.patient_id}`}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
