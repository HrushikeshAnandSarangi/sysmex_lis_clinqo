from django.urls import path
from .views import PatientWithSampleCreateView,PatientDetailView,HealthCheck,FileUploadView,AllPatientsView,AddSampleToPatientView

urlpatterns = [
    path('',HealthCheck.as_view(),name='health-check'),
    path('patients/', PatientWithSampleCreateView.as_view(), name='create-patient-with-sample'),
    path('patients/', PatientWithSampleCreateView.as_view(), name='create-patient-with-sample'),
    path('patients/<str:patient_id>/', PatientDetailView.as_view(), name='get-patient'),
    path('upload/', FileUploadView.as_view(), name='upload-txt'),
    path('all-patients/', AllPatientsView.as_view(), name='all-patients'),
    path('add_sample/<str:patient_id>/', AddSampleToPatientView.as_view(), name='add-sample-to-patient'),
    
]

