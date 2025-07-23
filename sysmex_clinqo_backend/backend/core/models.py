from django.db import models

# Create your models here.
class Patient(models.Model):
    patient_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    sex = models.CharField(max_length=10)
    mobile = models.CharField(max_length=15, blank=True)
    land_line = models.CharField(max_length=15, blank=True)
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    address = models.TextField()

    def __str__(self):
        return f"{self.patient_id} - {self.name}"

class Sample(models.Model):
    sample_id = models.CharField(max_length=30, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='samples')
    test_details = models.JSONField(help_text="Format: {'Parameter': 'Result'}")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Sample {self.sample_id} for {self.patient.name}"
