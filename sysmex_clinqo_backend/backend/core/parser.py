import re
import json
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple

class parse_sysmex_file:
    """
    Parser for Sysmex LIS data following ASTM E1394-97 standard
    """
    
    def __init__(self):
        self.reset_state()
        self.parsed_samples = []
        
    def reset_state(self):
        """Reset all state variables"""
        self.current_message_id = None
        self.current_patient_info = {}
        self.current_sample_id = None
        self.current_sample_info = {}
        self.current_test_results = {}
        self.current_sequence = None
        
    def parse_header_record(self, line: str) -> Dict[str, Any]:
        """Parse H (Header) record - contains system information"""
        parts = line.split('|')
        header_info = {
            'record_type': 'H',
            'sender_name': parts[4] if len(parts) > 4 else '',
            'sender_id': parts[5] if len(parts) > 5 else '',
            'receiver_id': parts[6] if len(parts) > 6 else '',
            'processing_id': parts[11] if len(parts) > 11 else '',
            'version': parts[13] if len(parts) > 13 else '',
            'timestamp': datetime.now().isoformat()
        }
        
        # Print extracted header data
        print("=" * 60)
        print("📋 HEADER RECORD EXTRACTED:")
        print("=" * 60)
        print(f"   Record Type: {header_info['record_type']}")
        print(f"   Sender Name: {header_info['sender_name']}")
        print(f"   Sender ID: {header_info['sender_id']}")
        print(f"   Receiver ID: {header_info['receiver_id']}")
        print(f"   Processing ID: {header_info['processing_id']}")
        print(f"   Version: {header_info['version']}")
        print(f"   Timestamp: {header_info['timestamp']}")
        print("=" * 60)
        
        return header_info
    
    def parse_patient_record(self, line: str) -> Dict[str, Any]:
        """Parse P (Patient) record - contains patient information"""
        parts = line.split('|')
        patient_info = {
            'record_type': 'P',
            'practice_id': parts[1] if len(parts) > 1 else '',
            'patient_id': parts[2] if len(parts) > 2 else '',
            'patient_name': parts[5] if len(parts) > 5 else '',
            'birth_date': parts[7] if len(parts) > 7 else '',
            'sex': parts[8] if len(parts) > 8 else '',
        }
        
        # Print extracted patient data
        print("👤 PATIENT RECORD EXTRACTED:")
        print("-" * 40)
        print(f"   Record Type: {patient_info['record_type']}")
        print(f"   Practice ID: {patient_info['practice_id']}")
        print(f"   Patient ID: {patient_info['patient_id']}")
        print(f"   Patient Name: {patient_info['patient_name']}")
        print(f"   Birth Date: {patient_info['birth_date']}")
        print(f"   Sex: {patient_info['sex']}")
        print("-" * 40)
        
        return patient_info
    
    def parse_order_record(self, line: str) -> Tuple[Optional[str], Dict[str, Any]]:
        """Parse O (Order) record - contains sample/specimen information"""
        parts = line.split('|')
        if len(parts) < 3:
            return None, {}
    
        # Try to extract sample ID from specimen ID field (index 2)
        specimen_field = parts[2].strip() if len(parts) > 2 else ''
        sample_id = self.extract_sample_id_from_field(specimen_field)
    
        # If not found, try instrument specimen ID field (index 3)
        if not sample_id and len(parts) > 3:
            instrument_field = parts[3].strip()
            sample_id = self.extract_sample_id_from_field(instrument_field)
            if sample_id:
                print(f"🔍 Extracted sample ID from instrument field: {sample_id}")
    
        # If still not found, log a warning
        if not sample_id:
            print(f"⚠️ Could not extract sample ID from order record: {line[:50]}")
    
        sample_info = {
            'record_type': 'O',
            'sample_id': sample_id,
            'specimen_field': specimen_field,
            'test_ordered': parts[4] if len(parts) > 4 else '',
            'priority': parts[5] if len(parts) > 5 else '',
            'collection_date': parts[6] if len(parts) > 6 else '',
            'collection_time': parts[7] if len(parts) > 7 else '',
            'volume': parts[9] if len(parts) > 9 else '',
            'collector_id': parts[10] if len(parts) > 10 else '',
        }
    
        # Print extracted order/sample data
        print("🧪 ORDER/SAMPLE RECORD EXTRACTED:")
        print("-" * 40)
        print(f"   Record Type: {sample_info['record_type']}")
        print(f"   Sample ID: {sample_info['sample_id']}")
        print(f"   Specimen Field: {sample_info['specimen_field']}")
        print(f"   Test Ordered: {sample_info['test_ordered']}")
        print(f"   Priority: {sample_info['priority']}")
        print(f"   Collection Date: {sample_info['collection_date']}")
        print(f"   Collection Time: {sample_info['collection_time']}")
        print(f"   Volume: {sample_info['volume']}")
        print(f"   Collector ID: {sample_info['collector_id']}")
        print("-" * 40)
    
        return sample_id, sample_info
    
    def extract_sample_id_from_field(self, field: str) -> Optional[str]:
        """Enhanced sample ID extraction from specimen field"""
        if not field:
            return None
            
        print(f"🔍 Extracting sample ID from field: '{field}'")
        print(f"🔍 Field length: {len(field)}")
        print(f"🔍 Field repr: {repr(field)}")
        
        # Strategy 1: Direct number (e.g., "3616340")
        if field.isdigit():
            print(f"✅ Strategy 1 - Direct number: {field}")
            return field
        
        # Strategy 2: Caret-separated values with flexible whitespace
        # Handle formats like: "7^10^               3615525^B" or "7^10^3615525^B"
        if '^' in field:
            caret_parts = field.split('^')
            print(f"🔍 Caret parts count: {len(caret_parts)}")
            print(f"🔍 Caret parts: {caret_parts}")
            
            for i, part in enumerate(caret_parts):
                cleaned = part.strip()
                print(f"   Part {i}: '{part}' (len={len(part)}) -> cleaned: '{cleaned}' (len={len(cleaned)})")
                
                # Skip empty parts and single character flags
                if not cleaned or len(cleaned) <= 1:
                    print(f"   -> Skipping part {i} (empty or single char)")
                    continue
                    
                # Check if it's a valid sample ID (6+ digits)
                if cleaned.isdigit() and len(cleaned) >= 6:
                    print(f"✅ Strategy 2 - Caret-separated: {cleaned}")
                    return cleaned
                elif cleaned.isdigit():
                    print(f"   -> Part {i} is numeric but too short: '{cleaned}' (len={len(cleaned)})")
                else:
                    print(f"   -> Part {i} is not numeric: '{cleaned}'")
        
        # Strategy 3: Regex patterns for various formats
        patterns = [
            # Pattern for the specific format: "7^10^               3615525^B"
            r'^7\^10\^\s*(\d{6,})\^B',
            # Pattern for spaces followed by digits and ^B (most specific first)
            r'\^\d+\^\s*(\d{6,})\^[A-Z]',
            # Pattern for any sequence of 6+ digits
            r'(\d{6,})',
            # Pattern for whitespace followed by digits
            r'\s+(\d{6,})',
            # Pattern for caret followed by digits
            r'\^(\d{6,})',
        ]

        for i, pattern in enumerate(patterns):
            print(f"🔍 Trying pattern {i+1}: '{pattern}'")
            match = re.search(pattern, field)
            if match:
                extracted_id = match.group(1)
                print(f"✅ Strategy 3.{i+1} - Regex pattern '{pattern}': {extracted_id}")
                return extracted_id
            else:
                print(f"   -> Pattern {i+1} no match")
        
        print(f"⚠️ Could not extract sample ID from field: '{field}'")
        return None
    
    def parse_result_record(self, line: str) -> Optional[Dict[str, Any]]:
        """Parse R (Result) record - contains test results"""
        parts = line.split('|')
        if len(parts) < 4:
            return None
        
        # Extract test name - multiple possible formats
        test_name_field = parts[2].strip()
        test_name = self.extract_test_name(test_name_field)
        if not test_name:
            return None
            
        # Extract result value
        value_field = parts[3].strip()
        unit = parts[4].strip() if len(parts) > 4 else ''
        status = parts[6] if len(parts) > 6 else ''  # Normal/Abnormal flags
        timestamp = parts[12] if len(parts) > 12 else ''
        
        # Handle special values
        if value_field in ('----', 'NaN', 'NULL'):
            value = None
            status = 'A'  # Mark as abnormal
        else:
            value = self.process_value(value_field)
        
        result = {
            'test_name': test_name,
            'value': value,
            'unit': unit,
            'status': status,
            'timestamp': timestamp
        }
        
        # Print extracted result data
        print(f"   🔬 RESULT EXTRACTED:")
        print(f"       Test Name: {result['test_name']}")
        print(f"       Value: {result['value']}")
        print(f"       Unit: {result['unit']}")
        print(f"       Status: {result['status']}")
        print(f"       Timestamp: {result['timestamp']}")
        print("       " + "-" * 30)
        
        return result
    
    def extract_sample_id_from_results(self, lines: List[str]) -> Optional[str]:
        """Extract sample ID from R or O records with improved patterns"""
        
        # 1. Check PNG filenames in R records
        for line in lines:
            if line.startswith('R|') and '.PNG' in line.upper():
                # Match "2025_07_10_15_49_3616340_WDF.PNG"
                match = re.search(r'_(\d{7})_[A-Z_]+\.PNG', line, re.IGNORECASE)
                if match:
                    extracted_id = match.group(1)
                    print(f"🔍 SAMPLE ID EXTRACTED FROM PNG: {extracted_id}")
                    return extracted_id
        
        # 2. Check sample ID in O records with flexible patterns
        for line in lines:
            if line.startswith('O|'):
                parts = line.split('|')
                if len(parts) > 2:
                    specimen_field = parts[2].strip() if len(parts) > 2 else ''
                    sample_id = self.extract_sample_id_from_field(specimen_field)
                    if not sample_id and len(parts) > 3:
                        instrument_field = parts[3].strip()
                        sample_id = self.extract_sample_id_from_field(instrument_field)
                        if sample_id:
                            print(f"🔍 Extracted sample ID from instrument field: {sample_id}")
                    if sample_id:
                        print(f"🔍 SAMPLE ID EXTRACTED FROM O RECORD: {sample_id}")
                        return sample_id
        
        # 3. Could not extract sample ID
        print("⚠️ Could not extract sample ID from lines.")
        return None
    
    def extract_test_name(self, test_field: str) -> Optional[str]:
        """Extract test name from various formats"""
        # Format 1: ^^^^TEST_NAME (e.g., ^^^^WBC^1)
        if test_field.startswith('^^^^'):
            return test_field[4:].split('^')[0].strip()
        
        # Format 2: TEST_NAME (direct)
        if '^' not in test_field and test_field:
            return test_field
        
        # Format 3: Mixed formats
        parts = test_field.split('^')
        for part in parts:
            cleaned = part.strip()
            if cleaned and not cleaned.isdigit():
                return cleaned
        
        return None
    
    def process_value(self, value_str: str) -> Any:
        """Process and convert result values"""
        # Handle comparison operators
        if re.match(r'^[<>]=?', value_str):
            return value_str
        
        # Handle numeric values
        try:
            if '.' in value_str or 'e' in value_str.lower():
                return float(value_str)
            return int(value_str)
        except ValueError:
            return value_str
    
    def save_current_sample(self):
        """Save current sample data to parsed samples"""
        if not self.current_sample_id:
            print("⚠️  No sample ID found, skipping save")
            return
            
        if not self.current_test_results:
            print("⚠️  No test results found, skipping save")
            return
            
        sample_data = {
            'message_id': self.current_message_id,
            'patient_info': self.current_patient_info,
            'sample_info': self.current_sample_info,
            'test_results': self.current_test_results,
            'parsed_timestamp': datetime.now().isoformat()
        }
        
        self.parsed_samples.append(sample_data)
        
        # Print complete sample data
        print("\n" + "=" * 60)
        print("💾 COMPLETE SAMPLE DATA SAVED:")
        print("=" * 60)
        print(f"Sample ID: {self.current_sample_id}")
        print(f"Number of Test Results: {len(self.current_test_results)}")
        print(f"Parsed Timestamp: {sample_data['parsed_timestamp']}")
        
        print("\n📋 MESSAGE INFO:")
        if self.current_message_id:
            for key, value in self.current_message_id.items():
                print(f"   {key}: {value}")
        
        print("\n👤 PATIENT INFO:")
        for key, value in self.current_patient_info.items():
            print(f"   {key}: {value}")
        
        print("\n🧪 SAMPLE INFO:")
        for key, value in self.current_sample_info.items():
            print(f"   {key}: {value}")
        
        print("\n🔬 ALL TEST RESULTS:")
        for test_name, result in self.current_test_results.items():
            print(f"   {test_name}:")
            print(f"      Value: {result['value']}")
            print(f"      Unit: {result['unit']}")
            print(f"      Status: {result['status']}")
            print(f"      Timestamp: {result['timestamp']}")
        
        print("=" * 60)
        
        # Reset sample-specific state
        self.current_sample_id = None
        self.current_sample_info = {}
        self.current_test_results = {}
    
    def parse_message(self, message_lines: List[str]):
        """Parse a complete ASTM message (H to L records)"""
        self.reset_state()
        
        print(f"\n🔎 PARSING MESSAGE WITH {len(message_lines)} LINES")
        print("=" * 60)
        
        for line in message_lines:
            line = line.strip()
            if not line:
                continue
                
            record_type = line[0]
            
            try:
                if record_type == 'H':
                    self.current_message_id = self.parse_header_record(line)
                    
                elif record_type == 'P':
                    self.current_patient_info = self.parse_patient_record(line)
                    
                elif record_type == 'O':
                    # Save previous sample if exists
                    if self.current_sample_id:
                        self.save_current_sample()
                        
                    sample_id, sample_info = self.parse_order_record(line)
                    if sample_id:
                        self.current_sample_id = sample_id
                        self.current_sample_info = sample_info
                    else:
                        print(f"⚠️  Could not extract sample ID from: {line[:50]}")
                    
                elif record_type == 'R':
                    if self.current_sample_id:
                        result = self.parse_result_record(line)
                        if result:
                            test_name = result['test_name']
                            self.current_test_results[test_name] = result
                        else:
                            print(f"⚠️  Could not parse result: {line[:50]}")
                    else:
                        print(f"⚠️  Result without active sample: {line[:50]}")
                    
                elif record_type == 'L':
                    self.save_current_sample()
                    print(f"🔚 END OF MESSAGE")
                    break
                    
            except Exception as e:
                print(f"⚠️  Error parsing line: {e}")
                print(f"   Line: {line[:100]}")
    
    def parse_data(self, data) -> List[Dict[str, Any]]:
        """Main parsing method for byte data or list of byte chunks"""
        print("\n" + "=" * 80)
        print("🚀 STARTING SYSMEX DATA PARSING")
        print("=" * 80)
        
        # Handle both single bytes object and list of bytes
        if isinstance(data, list):
            # Concatenate all byte chunks
            combined_data = b''.join(data)
            print(f"📦 Concatenated {len(data)} byte chunks")
        else:
            combined_data = data
            print(f"📦 Processing single byte object")
        
        try:
            # Decode bytes to string with error handling
            decoded_data = combined_data.decode('utf-8', errors='replace')
            print("✅ Successfully decoded data as UTF-8")
        except UnicodeDecodeError:
            # Try with latin-1 encoding as fallback
            decoded_data = combined_data.decode('latin-1', errors='replace')
            print("✅ Successfully decoded data as Latin-1 (fallback)")
        
        # Handle special case where data contains byte string representations
        # Check if the data contains lines that start with "b'" indicating byte string format
        if "b'" in decoded_data:
            print("🔧 DETECTED BYTE STRING FORMAT - Processing special format")
            # Extract actual content from byte string representations
            actual_lines = []
            for line in decoded_data.split('\n'):
                line = line.strip()
                if line.startswith("b'") and line.endswith("'"):
                    # Remove b' prefix and ' suffix, then handle escape sequences
                    content = line[2:-1]
                    # Replace escape sequences
                    content = content.replace('\\r', '\r').replace('\\n', '\n').replace('\\\\', '\\')
                    # Split by \r to get individual records
                    sub_lines = content.split('\r')
                    for sub_line in sub_lines:
                        sub_line = sub_line.strip()
                        if sub_line:
                            actual_lines.append(sub_line)
                elif line and not line.startswith("b'"):
                    actual_lines.append(line)
            
            lines = actual_lines
            print(f"📄 Extracted {len(lines)} actual lines from byte string format")
        else:
            # Original processing for normal format
            lines = []
            for line in decoded_data.replace('\r', '\n').split('\n'):
                line = line.strip()
                if line:
                    lines.append(line)
            print(f"📄 Processing {len(lines)} lines")
        
        print(f"🔍 First few lines: {lines[:3]}")
        print(f"🔍 Last few lines: {lines[-3:]}")
        
        # For fragmented data (only R records), create a complete message
        if lines and all(line.startswith('R|') or line.startswith('C|') or line.startswith('L|') for line in lines):
            print("🔧 DETECTED FRAGMENTED DATA - Creating complete message")
            
            # Extract sample ID from PNG filenames
            sample_id = self.extract_sample_id_from_results(lines)
            if not sample_id:
                sample_id = "UNKNOWN"
            
            print(f"🔍 Using sample ID: {sample_id}")
            
            # Create complete message with dummy headers
            complete_message = [
                'H|\\^&|||Sysmex|||||||P|1|20250710154953',
                'P|1|||||||||||||||||||||||||||||||',
                f'O|1|^1^{sample_id}^B|^^^^|ALL|||||||||||||||||||||||||||'
            ]
            complete_message.extend(lines)
            
            # Add terminator if missing
            if not any(line.startswith('L|') for line in complete_message):
                complete_message.append('L|1|N')
            
            # Parse the complete message
            print(f"🔎 Processing complete message with {len(complete_message)} lines")
            self.parse_message(complete_message)
            
        else:
            # Original logic for complete ASTM messages
            messages = []
            current_message = []
            
            for line in lines:
                if line.startswith('H|'):
                    if current_message:
                        messages.append(current_message)
                    current_message = [line]
                elif line.startswith('L|'):
                    current_message.append(line)
                    messages.append(current_message)
                    current_message = []
                elif current_message:
                    current_message.append(line)
            
            # Handle case where last message doesn't end with L|
            if current_message:
                # Add terminator if missing
                if not any(line.startswith('L|') for line in current_message):
                    current_message.append('L|1|N')
                messages.append(current_message)
            
            # Parse each message
            for i, message_lines in enumerate(messages):
                print(f"\n🔎 Processing message {i+1}/{len(messages)}")
                self.parse_message(message_lines)
        
        # Print final summary
        print("\n" + "=" * 80)
        print("✅ PARSING COMPLETE - FINAL SUMMARY")
        print("=" * 80)
        print(f"Total Samples Parsed: {len(self.parsed_samples)}")
        
        for i, sample in enumerate(self.parsed_samples, 1):
            print(f"\nSample {i}:")
            print(f"  Sample ID: {sample['sample_info'].get('sample_id', 'Unknown')}")
            print(f"  Patient ID: {sample['patient_info'].get('patient_id', 'Unknown')}")
            print(f"  Test Results: {len(sample['test_results'])}")
            print(f"  Tests: {', '.join(sample['test_results'].keys())}")
        
        print("=" * 80)
        
        return self.parsed_samples


def parse_sysmex_data(data) -> List[Dict[str, Any]]:
    """
    Parse Sysmex LIS data in ASTM E1394-97 format
    
    Args:
        data: ASTM data in bytes format or list of byte chunks
        
    Returns:
        List of parsed samples with test results
    """
    parser = parse_sysmex_file()
    return parser.parse_data(data)


def test_sample_id_extraction():
    """Test function to debug sample ID extraction"""
    parser = parse_sysmex_file()
    
    # Test cases
    test_cases = [
        "7^10^               3615525^B",
        "7^10^3615525^B",
        "3616340",
        "7^1^3616340^B",
        "7^8^               3615532^B"
    ]
    
    print("=" * 60)
    print("🧪 TESTING SAMPLE ID EXTRACTION")
    print("=" * 60)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n--- Test Case {i} ---")
        result = parser.extract_sample_id_from_field(test_case)
        print(f"Input: '{test_case}'")
        print(f"Result: {result}")
        print(f"Success: {'✅' if result else '❌'}")
    
    print("=" * 60)

# Uncomment the line below to run the test
# test_sample_id_extraction()