export interface FieldDef {
  key: string
  label: string
}

/** Individuals — order & labels MUST match the extension's INDIVIDUAL_FIELDS. */
export const INDIVIDUAL_FIELDS: FieldDef[] = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'fullName', label: 'Full Name' },
  { key: 'email', label: 'Email' },
  { key: 'title', label: 'Job Title' },
  { key: 'types', label: 'Type(s)' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'twitter', label: 'Twitter' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'profileUrl', label: 'Profile URL' },
  { key: 'photoUrl', label: 'Photo URL' },
  { key: 'bio', label: 'Bio' },
  { key: 'interests', label: 'Interests' },
  { key: 'company', label: 'Company' },
  { key: 'companyWebsite', label: 'Company Website' },
  { key: 'phone', label: 'Company Phone' },
  { key: 'city', label: 'City' },
  { key: 'country', label: 'Country' },
  { key: 'region', label: 'Region' },
  { key: 'industry', label: 'Industry' },
  { key: 'orgType', label: 'Org Type' },
  { key: 'additionalInfo', label: 'Additional Info' },
]

/** Companies — order & labels MUST match the extension's COMPANY_FIELDS. */
export const COMPANY_FIELDS: FieldDef[] = [
  { key: 'name', label: 'Name' },
  { key: 'website', label: 'Website' },
  { key: 'phone', label: 'Phone' },
  { key: 'country', label: 'Country' },
  { key: 'city', label: 'City' },
  { key: 'region', label: 'Region' },
  { key: 'address', label: 'Address' },
  { key: 'types', label: 'Type(s)' },
  { key: 'industry', label: 'Industry' },
  { key: 'numEmployees', label: 'Num of Employees' },
  { key: 'revenue', label: 'Revenue ($)' },
  { key: 'orgType', label: 'Org Type' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'twitter', label: 'Twitter' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'description', label: 'About (summary)' },
  { key: 'profileUrl', label: 'Company Profile URL' },
  { key: 'additionalInfo', label: 'Additional Info' },
]
