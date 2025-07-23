'use client'
import { useState } from "react"

const AddSampleForm = ({ patient_id }: { patient_id: string }) => {
  const [sampleId, setSampleId] = useState("")
  const [testParams, setTestParams] = useState([{ parameter: "", result: "awaited" }])

  const handleParamChange = (index: number, field: "parameter", value: string) => {
    const updated = [...testParams]
    updated[index][field] = value
    updated[index]["result"] = "awaited" // Automatically set result
    setTestParams(updated)
  }

  const handleAddField = () => {
    setTestParams([...testParams, { parameter: "", result: "awaited" }])
  }

  const handleRemoveField = (index: number) => {
    const updated = [...testParams]
    updated.splice(index, 1)
    setTestParams(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const testDetails: Record<string, string> = {}
    testParams.forEach(({ parameter, result }) => {
      if (parameter.trim()) {
        testDetails[parameter] = result
      }
    })

    const formData = {
      sample_id: sampleId,
      test_details: testDetails,
    }

    try {
      const res = await fetch(`http://localhost:8000/api/add_sample/${patient_id}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error("Submission failed")
      alert("Sample added successfully!")
    } catch (err) {
      alert("Failed to submit")
      console.error(err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white border border-green-500 rounded-xl max-w-xl shadow-md w-full">
      <h2 className="text-xl font-semibold text-green-600">Add Sample</h2>

      <div>
        <label className="block font-medium text-green-700 mb-1">Sample ID</label>
        <input
          type="text"
          value={sampleId}
          onChange={(e) => setSampleId(e.target.value)}
          required
          className="border border-green-300 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="space-y-3">
        <label className="block font-medium text-green-700 mb-1">Test Parameters</label>
        {testParams.map((field, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Parameter (e.g. Glucose)"
              value={field.parameter}
              onChange={(e) => handleParamChange(idx, "parameter", e.target.value)}
              className="border border-green-300 px-2 py-2 rounded w-1/2 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <input
              type="text"
              value="awaited"
              disabled
              className="border border-green-300 px-2 py-2 rounded w-1/2 bg-gray-100 text-gray-600"
            />
            {testParams.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveField(idx)}
                className="text-red-500 hover:text-red-700 text-lg"
                title="Remove parameter"
              >
                ✖
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddField}
          className="text-green-600 hover:text-green-800 text-sm font-medium"
        >
          + Add Parameter
        </button>
      </div>

      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-all"
      >
        Submit Sample
      </button>
    </form>
  )
}

export default AddSampleForm
