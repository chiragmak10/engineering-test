export interface Person {
  id: number
  first_name: string
  last_name: string
  photo_url?: string
  roll_state?: string
}

export const PersonHelper = {
  getFullName: (p: Person) => `${p.first_name} ${p.last_name}`,
}

export const ROLLSTATE = {
  present: "present",
  absent: "absent",
  late: "late",
}

export const SORTORDER = {
  ascending: "ascending",
  descending: "descending",
}

export const SORTVALUE = {
  none: "none",
  firstname: "firstname",
  lastname: "lastname",
}

export type sortType = {
  sortOrder: string
  sortValue: string
}

export const INITIALCOUNT = 0
