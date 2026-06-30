import {  processAppointee, setuserpin, getCompany, forgetPin,  profileDtlURL, getCustomerDetailListURL, processAppointeeFileUpload, employeeTaskAllocationData, processAllocation, contractAllocationData, processActivityAllocation,} from "../services/ConstantServies";
import { authAxios, authAxiosFilePost, authAxiosget, authAxiosPost } from "./HttpMethod";

export function getCompanyName(isFms) {
  let data = {
    'mobile_app_type': isFms ? 'FMS_E' : 'HRM_E',
  };
  return authAxiosget(getCompany, data)
}

export function postAppointee(res) {
  let data = {};
  if (res) {
    data['emp_data'] = res;
  }
  // console.log('Data to be sent:', data);
  return authAxiosPost(processAppointee, data)

}

export function postAppointeeFile(res) {
  // console.log('Data to be sent:', data);
  return authAxiosFilePost(processAppointeeFileUpload, res)

}

export function forgetUserPinView(data, dbName) {
  return authAxiosPost(`${forgetPin + dbName}/`, data);
}

export function getCustomerDetailList(customerId) {
  let data = {}
  if (customerId) {
    data['customer_id'] = customerId;
  }
  return authAxios(getCustomerDetailListURL, data);
}

export async function setuserpinview(o_pin, n_pin) {
  try {
    const customerId = localStorage.getItem("custId");
    let data = {
      u_id: customerId,
      o_pin: o_pin,
      n_pin: n_pin,
      user_type: "CUSTOMER",
    };

    const response = await authAxiosPost(setuserpin, data);
    if (response.status === 200) {
      // console.log("Pin updated successfully")
    }
    return response;
  } catch (error) {
    return error;
  }
}

export function getemployeeLists(data) {
  return authAxios(profileDtlURL, data)
}

export function getEmpAllocationData(data) {
  return authAxios(employeeTaskAllocationData, data)
}

export function getContractAllocationData(data) {
  return authAxios(contractAllocationData, data)
}

export function postAllocationData(activity_data) {
  return authAxiosFilePost(processAllocation, activity_data);
}
export function postActivityAllocationData(activity_data) {
  return authAxiosFilePost(processActivityAllocation, activity_data);
}