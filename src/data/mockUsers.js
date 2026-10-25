import { daysFromNow } from '@/utils/format';

const d = (n) => daysFromNow(-n);

export const mockUsers = [
  { id: 'U-001', name: 'Rahul Verma', email: 'rahul.verma@demo.trackify.test', role: 'institute', organization: 'Vindhya Institute of Engineering & Technology', instituteId: 'INS-1001', designation: 'Registrar', phone: '+91 98765 40001', status: 'Active', createdAt: d(210) },
  { id: 'U-002', name: 'Meera Iyer', email: 'meera.iyer@demo.trackify.test', role: 'institute', organization: 'Kaveri College of Engineering', instituteId: 'INS-1002', designation: 'Compliance Coordinator', phone: '+91 98765 40002', status: 'Active', createdAt: d(190) },
  { id: 'U-003', name: 'Farhan Qureshi', email: 'farhan.qureshi@demo.trackify.test', role: 'institute', organization: 'Aravali Institute of Management Studies', instituteId: 'INS-1003', designation: 'Director Office', phone: '+91 98765 40003', status: 'Active', createdAt: d(160) },
  { id: 'U-004', name: 'Lakshmi Menon', email: 'lakshmi.menon@demo.trackify.test', role: 'institute', organization: 'Malabar Polytechnic College', instituteId: 'INS-1010', designation: 'Principal Secretary', phone: '+91 98765 40004', status: 'Inactive', createdAt: d(140) },
  { id: 'U-101', name: 'Dr. Sanjay Kulkarni', email: 'sanjay.kulkarni@demo.trackify.test', role: 'officer', organization: 'Demo Review Cell', instituteId: null, designation: 'Senior Scrutiny Officer', phone: '+91 98765 41001', status: 'Active', createdAt: d(300) },
  { id: 'U-102', name: 'Priya Nair', email: 'priya.nair@demo.trackify.test', role: 'officer', organization: 'Demo Review Cell', instituteId: null, designation: 'Scrutiny Officer', phone: '+91 98765 41002', status: 'Active', createdAt: d(280) },
  { id: 'U-103', name: 'Arjun Mehta', email: 'arjun.mehta@demo.trackify.test', role: 'officer', organization: 'Demo Review Cell', instituteId: null, designation: 'Scrutiny Officer', phone: '+91 98765 41003', status: 'Active', createdAt: d(250) },
  { id: 'U-201', name: 'Kavita Rao', email: 'kavita.rao@demo.trackify.test', role: 'admin', organization: 'Trackify Demo Administration', instituteId: null, designation: 'Platform Administrator', phone: '+91 98765 42001', status: 'Active', createdAt: d(320) },
  { id: 'U-202', name: 'Imran Sheikh', email: 'imran.sheikh@demo.trackify.test', role: 'admin', organization: 'Trackify Demo Administration', instituteId: null, designation: 'Configuration Manager', phone: '+91 98765 42002', status: 'Active', createdAt: d(260) },
];
