import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  Users, 
  Calendar,
  Save,
  Download
} from 'lucide-react'

const SurveyForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Convert NaN values to null for optional number fields
      const cleanedData = Object.keys(data).reduce((acc, key) => {
        const value = data[key]
        // Convert NaN to null for number fields, keep other values as is
        acc[key] = (typeof value === 'number' && isNaN(value)) ? null : value
        return acc
      }, {})

      const surveyData = {
        ...cleanedData,
        submission_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('bmt_surveys')
        .insert([surveyData])

      if (error) throw error

      toast.success('Survey submitted successfully!')
      reset()
    } catch (error) {
      console.error('Error submitting survey:', error)
      toast.error('Failed to submit survey. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const exportSample = () => {
    const sampleData = {
      salesperson_name: 'John Doe',
      physician_name: 'Dr. Sarah Johnson',
      facility_name: 'City Medical Center',
      facility_type: 'hospital',
      city: 'Mumbai',
      state: 'Maharashtra',
      monthly_bmt_patients: 25,
      annual_bmt_patients: 300,
      submission_date: new Date().toISOString()
    }
    
    const dataStr = JSON.stringify([sampleData], null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = 'survey_sample.json'
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast.success('Sample data exported!')
  }

  const InputField = ({ label, name, type = 'text', required = false, icon: Icon, options = null, placeholder = '' }) => (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700  items-center">
        {Icon && <Icon className="h-4 w-4 mr-2 text-gray-500" />}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === 'select' ? (
        <select
          id={name}
          {...register(name, { required: required && `${label} is required` })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select {label}</option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          {...register(name, { required: required && `${label} is required` })}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      ) : (
        <input
          id={name}
          type={type}
          {...register(name, { 
            required: required && `${label} is required`,
            ...(type === 'email' && { pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } }),
            ...(type === 'number' && { 
              min: { value: 0, message: 'Must be a positive number' },
              valueAsNumber: true
            })
          })}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      )}
      {errors[name] && (
        <p className="text-red-600 text-xs mt-1">{errors[name].message}</p>
      )}
    </div>
  )

  const facilityTypes = [
    { value: 'hospital', label: 'Hospital' },
    { value: 'clinic', label: 'Clinic' },
    { value: 'medical_center', label: 'Medical Center' },
    { value: 'cancer_center', label: 'Cancer Center' },
    { value: 'research_institute', label: 'Research Institute' }
  ]

  const states = [
    { value: 'maharashtra', label: 'Maharashtra' },
    { value: 'karnataka', label: 'Karnataka' },
    { value: 'tamil_nadu', label: 'Tamil Nadu' },
    { value: 'gujarat', label: 'Gujarat' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'west_bengal', label: 'West Bengal' },
    { value: 'rajasthan', label: 'Rajasthan' },
    { value: 'uttar_pradesh', label: 'Uttar Pradesh' }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Users className="h-8 w-8 mr-3" />
            BMT Patient Market Survey
          </h2>
          <p className="text-blue-100 mt-2">
            Collect comprehensive data about Bone Marrow Transplant patient volumes and facility information
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          {/* Sales Representative Information */}
          <section className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Sales Representative Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Salesperson Name"
                name="salesperson_name"
                required
                icon={User}
                placeholder="Enter your full name"
              />
              <InputField
                label="Contact Number"
                name="salesperson_contact"
                type="tel"
                icon={Phone}
                placeholder="Enter your contact number"
              />
              <InputField
                label="Email Address"
                name="salesperson_email"
                type="email"
                icon={Mail}
                placeholder="Enter your email address"
              />
              <InputField
                label="Territory/Region"
                name="territory"
                icon={MapPin}
                placeholder="Enter your assigned territory"
              />
            </div>
          </section>

          {/* Physician & Facility Information */}
          <section className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-green-600" />
              Physician & Facility Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Physician Name"
                name="physician_name"
                required
                icon={User}
                placeholder="Enter doctor's full name"
              />
              <InputField
                label="Specialization"
                name="physician_specialization"
                icon={User}
                placeholder="e.g., Hematologist, Oncologist"
              />
              <InputField
                label="Facility Name"
                name="facility_name"
                required
                icon={Building2}
                placeholder="Enter hospital/clinic name"
              />
              <InputField
                label="Facility Type"
                name="facility_type"
                type="select"
                required
                icon={Building2}
                options={facilityTypes}
              />
              <InputField
                label="City"
                name="city"
                required
                icon={MapPin}
                placeholder="Enter city name"
              />
              <InputField
                label="State"
                name="state"
                type="select"
                required
                icon={MapPin}
                options={states}
              />
              <InputField
                label="Contact Number"
                name="facility_contact"
                type="tel"
                icon={Phone}
                placeholder="Enter facility contact number"
              />
              <InputField
                label="Email Address"
                name="facility_email"
                type="email"
                icon={Mail}
                placeholder="Enter facility email"
              />
            </div>
          </section>

          {/* BMT Patient Volume Data */}
          <section className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-orange-600" />
              BMT Patient Volume Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InputField
                label="Monthly BMT Patients"
                name="monthly_bmt_patients"
                type="number"
                required
                icon={Users}
                placeholder="Enter monthly patient count"
              />
              <InputField
                label="Annual BMT Patients"
                name="annual_bmt_patients"
                type="number"
                required
                icon={Calendar}
                placeholder="Enter annual patient count"
              />
              <InputField
                label="Autologous BMT (%)"
                name="autologous_percentage"
                type="number"
                icon={Users}
                placeholder="Enter percentage"
              />
              <InputField
                label="Allogeneic BMT (%)"
                name="allogeneic_percentage"
                type="number"
                icon={Users}
                placeholder="Enter percentage"
              />
              <InputField
                label="Average Patient Age"
                name="average_patient_age"
                type="number"
                icon={Users}
                placeholder="Enter average age"
              />
              <InputField
                label="Pediatric Patients (%)"
                name="pediatric_percentage"
                type="number"
                icon={Users}
                placeholder="Enter percentage"
              />
            </div>
          </section>

          {/* Disease Categories */}
          <section className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Disease Categories (Monthly Patient Count)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InputField
                label="Acute Lymphoblastic Leukemia"
                name="all_patients"
                type="number"
                placeholder="Enter count"
              />
              <InputField
                label="Acute Myeloid Leukemia"
                name="aml_patients"
                type="number"
                placeholder="Enter count"
              />
              <InputField
                label="Chronic Lymphocytic Leukemia"
                name="cll_patients"
                type="number"
                placeholder="Enter count"
              />
              <InputField
                label="Chronic Myeloid Leukemia"
                name="cml_patients"
                type="number"
                placeholder="Enter count"
              />
              <InputField
                label="Multiple Myeloma"
                name="multiple_myeloma_patients"
                type="number"
                placeholder="Enter count"
              />
              <InputField
                label="Lymphoma"
                name="lymphoma_patients"
                type="number"
                placeholder="Enter count"
              />
              <InputField
                label="Aplastic Anemia"
                name="aplastic_anemia_patients"
                type="number"
                placeholder="Enter count"
              />
              <InputField
                label="Other Blood Disorders"
                name="other_blood_disorders"
                type="number"
                placeholder="Enter count"
              />
              <InputField
                label="Solid Tumors"
                name="solid_tumor_patients"
                type="number"
                placeholder="Enter count"
              />
            </div>
          </section>

          {/* Additional Information */}
          <section className="pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Additional Information
            </h3>
            <div className="space-y-4">
              <InputField
                label="Current Treatment Protocols"
                name="treatment_protocols"
                type="textarea"
                placeholder="Describe current treatment protocols and standards"
              />
              <InputField
                label="Key Challenges Faced"
                name="challenges"
                type="textarea"
                placeholder="Describe main challenges in BMT treatment"
              />
              <InputField
                label="Interest in New Therapies"
                name="new_therapy_interest"
                type="textarea"
                placeholder="Level of interest in innovative treatment options"
              />
              <InputField
                label="Additional Notes"
                name="additional_notes"
                type="textarea"
                placeholder="Any other relevant information"
              />
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Submit Survey
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => reset()}
              className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Clear Form
            </button>
            <button
              type="button"
              onClick={exportSample}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Sample
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SurveyForm