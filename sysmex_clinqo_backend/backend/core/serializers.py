from rest_framework import serializers
from .models import Patient, Sample


from rest_framework import serializers
from .models import Sample, Patient

class SampleSerializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(write_only=True)

    class Meta:
        model = Sample
        fields = ['sample_id', 'test_details', 'created_at', 'patient_id']

    def create(self, validated_data):
        patient_id = validated_data.pop('patient_id')
        patient = Patient.objects.get(patient_id=patient_id)
        return Sample.objects.create(patient=patient, **validated_data)


class PatientCreateSerializer(serializers.Serializer):
    patient_id = serializers.CharField()
    sample_id = serializers.CharField()
    name = serializers.CharField()
    age = serializers.IntegerField()
    sex = serializers.CharField()
    mobile = serializers.CharField()
    land_line = serializers.CharField()
    state = serializers.CharField()
    district = serializers.CharField()
    address = serializers.CharField()

    def create(self, validated_data):
        patient_id = validated_data.pop('patient_id')
        sample_id = validated_data.pop('sample_id')

        # Get or create the patient
        patient, _ = Patient.objects.get_or_create(
            patient_id=patient_id,
            defaults={
                **validated_data
            }
        )

        # Always create a new Sample for this request
        Sample.objects.create(
            sample_id=sample_id,
            patient=patient,
            test_details={}  # Initially empty
        )

        return patient

class SampleDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sample
        fields = ['sample_id', 'test_details', 'created_at']

class PatientDetailSerializer(serializers.ModelSerializer):
    samples = SampleDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Patient
        fields = [
            'patient_id', 'name', 'age', 'sex', 'mobile',
            'land_line', 'state', 'district', 'address', 'samples'
        ]
