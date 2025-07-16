import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { 
  Download, 
  Users, 
  Building2, 
  MapPin, 
  Calendar,
  TrendingUp,
  FileText,
  Activity
} from 'lucide-react'
import * as XLSX from 'xlsx'

const Dashboard = () => {
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSurveys: 0,
    totalPatients: 0,
    avgPatientsPerFacility: 0,
    facilitiesCount: 0
  })

  useEffect(() => {
    fetchSurveys()
  }, [])

  const fetchSurveys = async () => {
    try {
      const { data, error } = await supabase
        .from('bmt_surveys')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setSurveys(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching surveys:', error)
      toast.error('Failed to fetch survey data')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (surveyData) => {
    const totalSurveys = surveyData.length
    const totalPatients = surveyData.reduce((sum, survey) => sum + (survey.monthly_bmt_patients || 0), 0)
    const facilitiesCount = new Set(surveyData.map(s => s.facility_name)).size
    const avgPatientsPerFacility = facilitiesCount > 0 ? Math.round(totalPatients / facilitiesCount) : 0

    setStats({
      totalSurveys,
      totalPatients,
      avgPatientsPerFacility,
      facilitiesCount
    })
  }

  const exportToExcel = () => {
    if (surveys.length === 0) {
      toast.error('No data to export')
      return
    }

    const workbook = XLSX.utils.book_new()
    
    // Prepare data for export
    const exportData = surveys.map(survey => ({
      'Submission Date': new Date(survey.submission_date).toLocaleDateString(),
      'Salesperson Name': survey.salesperson_name,
      'Salesperson Contact': survey.salesperson_contact,
      'Salesperson Email': survey.salesperson_email,
      'Territory': survey.territory,
      'Physician Name': survey.physician_name,
      'Physician Specialization': survey.physician_specialization,
      'Facility Name': survey.facility_name,
      'Facility Type': survey.facility_type,
      'City': survey.city,
      'State': survey.state,
      'Facility Contact': survey.facility_contact,
      'Facility Email': survey.facility_email,
      'Monthly BMT Patients': survey.monthly_bmt_patients,
      'Annual BMT Patients': survey.annual_bmt_patients,
      'Autologous BMT %': survey.autologous_percentage,
      'Allogeneic BMT %': survey.allogeneic_percentage,
      'Average Patient Age': survey.average_patient_age,
      'Pediatric Patients %': survey.pediatric_percentage,
      'ALL Patients': survey.all_patients,
      'AML Patients': survey.aml_patients,
      'CLL Patients': survey.cll_patients,
      'CML Patients': survey.cml_patients,
      'Multiple Myeloma': survey.multiple_myeloma_patients,
      'Lymphoma': survey.lymphoma_patients,
      'Aplastic Anemia': survey.aplastic_anemia_patients,
      'Other Blood Disorders': survey.other_blood_disorders,
      'Solid Tumors': survey.solid_tumor_patients,
      'Treatment Protocols': survey.treatment_protocols,
      'Challenges': survey.challenges,
      'New Therapy Interest': survey.new_therapy_interest,
      'Additional Notes': survey.additional_notes
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BMT Survey Data')

    // Auto-adjust column widths
    const colWidths = []
    Object.keys(exportData[0] || {}).forEach(key => {
      const maxLength = Math.max(
        key.length,
        ...exportData.map(row => String(row[key] || '').length)
      )
      colWidths.push({ wch: Math.min(maxLength + 2, 50) })
    })
    worksheet['!cols'] = colWidths

    const fileName = `BMT_Survey_Data_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
    
    toast.success('Data exported successfully!')
  }

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Survey Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of BMT market survey responses</p>
        </div>
        <button
          onClick={exportToExcel}
          className="mt-4 sm:mt-0 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export to Excel
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Surveys"
          value={stats.totalSurveys}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Monthly BMT Patients"
          value={stats.totalPatients}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Unique Facilities"
          value={stats.facilitiesCount}
          icon={Building2}
          color="orange"
        />
        <StatCard
          title="Avg Patients/Facility"
          value={stats.avgPatientsPerFacility}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Survey Data Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Survey Submissions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salesperson
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Physician
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facility
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Patients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Annual Patients
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {surveys.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    No survey data available. Start by submitting your first survey.
                  </td>
                </tr>
              ) : (
                surveys.map((survey) => (
                  <tr key={survey.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(survey.submission_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {survey.salesperson_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {survey.territory}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {survey.physician_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {survey.physician_specialization}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {survey.facility_name}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {survey.facility_type?.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        {survey.city}, {survey.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {survey.monthly_bmt_patients || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {survey.annual_bmt_patients || 0}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard