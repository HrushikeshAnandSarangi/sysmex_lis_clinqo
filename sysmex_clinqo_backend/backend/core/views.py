from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status,generics
from rest_framework.parsers import MultiPartParser
from .serializers import PatientCreateSerializer,PatientDetailSerializer,Sample,SampleSerializer
from rest_framework.generics import RetrieveAPIView,ListAPIView
from .models import Patient,Sample
from .parser import parse_sysmex_file
from rest_framework import status

class PatientWithSampleCreateView(APIView):
    def post(self, request):
        serializer = PatientCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Patient and Sample saved'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PatientDetailView(RetrieveAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientDetailSerializer
    lookup_field = 'patient_id'
class HealthCheck(APIView):
    def get(self, request):
        return Response({"status": "OK"}, status=status.HTTP_200_OK)




class FileUploadView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            file_bytes = uploaded_file.read()
            parser = parse_sysmex_file()
            parsed_samples = parser.parse_data(file_bytes)

            updated_samples = []
            not_found_samples = []

            for sample_data in parsed_samples:
                sample_id = sample_data['sample_info'].get('sample_id')
                test_results = sample_data['test_results']

                if not sample_id:
                    continue

                try:
                    sample = Sample.objects.get(sample_id=sample_id)
                    sample.test_details = test_results
                    sample.save()
                    updated_samples.append(sample_id)
                except Sample.DoesNotExist:
                    not_found_samples.append(sample_id)

            message = f"Updated {len(updated_samples)} samples. "
            if not_found_samples:
                message += f"Sample IDs not found: {', '.join(not_found_samples)}"

            return Response({"message": message}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AllPatientsView(ListAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientDetailSerializer

    def get_queryset(self):
        queryset = Patient.objects.all()
        name = self.request.query_params.get('name')
        patient_id = self.request.query_params.get('patient_id')

        if name:
            queryset = queryset.filter(name__icontains=name)
        if patient_id:
            queryset = queryset.filter(patient_id__icontains=patient_id)

        return queryset


class AddSampleView(generics.CreateAPIView):
    serializer_class = SampleSerializer
    queryset = Sample.objects.all()


class AddSampleToPatientView(APIView):
    def post(self, request, patient_id):
        try:
            patient = Patient.objects.get(patient_id=patient_id)
        except Patient.DoesNotExist:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        data['patient_id'] = patient_id  # Add patient_id to serializer input

        serializer = SampleSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("❌ Sample creation error:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
