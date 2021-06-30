import React, { useState, useEffect } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"
import InputBase from "@material-ui/core/InputBase"
import { FormControl, MenuItem, Select } from "@material-ui/core"

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [searchValue, setSearchValue] = useState<string | null>()
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [saveActiveRoll] = useApi({ url: "save-roll" })
  const [studentData, setStudentData] = useState<Person[] | undefined>([])
  const [classAttendanceCount, setClassAttendanceCount] = useState({ presentCount: 0, absentCount: 0, lateCount: 0 })
  const [filterValue, setFilterValue] = useState({ sortDirection: "asc", sortValue: "" })
  useEffect(() => {
    if (data) setStudentData(data.students)
  }, [data])

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(() => {
    if (searchValue) {
      const val = searchValue.toLowerCase()
      const studentsData = data?.students.filter(
        (x: { first_name: string; last_name: string }) => x.first_name.toLowerCase().includes(val) || x.last_name.toLowerCase().includes(val)
      )
      setStudentData(studentsData)
    } else {
      setStudentData(data?.students)
    }
  }, [data, searchValue])

  const onToolbarAction = (action: ToolbarAction, value: string | undefined) => {
    if (action === "roll") {
      setIsRollMode(true)
    }
  }
  const onActiveRollAction = async (action: ActiveRollAction) => {
    if (action === "exit") {
      setStudentData(data?.students)
      setIsRollMode(false)
    } else if (action === "complete") {
      await saveActiveRoll(studentData)
      setStudentData(data?.students)
      setIsRollMode(false)
    }
  }
  const updateStudentsData = (type: string, student: Person) => {
    const updatedData = studentData?.map((item) => {
      if (item.id === student.id) {
        return { ...item, type: type }
      } else {
        return { ...item }
      }
    })
    setStudentData(updatedData)
    updateStudentsCount(updatedData)
  }

  const updateStudentsCount = (updatedData: any[] | undefined) => {
    const presentCount = updatedData?.filter((x: Person) => {
      return x?.type === "present"
    })
    const absentCount = updatedData?.filter((y: Person) => {
      return y?.type === "absent"
    })
    const lateCount = updatedData?.filter((z: Person) => {
      return z?.type === "late"
    })
    setClassAttendanceCount({ presentCount: presentCount?.length ?? 0, absentCount: absentCount?.length ?? 0, lateCount: lateCount?.length || 0 })
  }
  const onStateIconClick = (value: any) => {
    if (value !== "all") {
      const rollBasedData = studentData?.filter((x) => x.type === value)
      setStudentData(rollBasedData)
    } else {
      setStudentData(data?.students)
    }
  }
  useEffect(() => {
    let sortedData: Person[] | undefined = []
    if (filterValue.sortValue === "firstname") {
      if (filterValue.sortDirection === "asc") {
        sortedData = studentData?.sort((x, y) => x.first_name.localeCompare(y.first_name))
        setStudentData(sortedData)
      } else if (filterValue.sortDirection === "des") {
        sortedData = studentData?.sort((x, y) => y.first_name.localeCompare(x.first_name))
        setStudentData(sortedData)
      }
    } else if (filterValue.sortValue === "lastname") {
      if (filterValue.sortDirection === "asc") {
        sortedData = studentData?.sort((x, y) => x.last_name.localeCompare(y.last_name))
        setStudentData(sortedData)
      } else if (filterValue.sortDirection === "des") {
        sortedData = studentData?.sort((x, y) => y.last_name.localeCompare(x.last_name))
        setStudentData(sortedData)
      }
    } else {
      setStudentData(studentData)
    }
  }, [filterValue, studentData])
  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} setSearchValue={setSearchValue} filterValue={filterValue} setFilterValue={setFilterValue} />
        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}
        {loadState === "loaded" && studentData && (
          <>
            {studentData.map((s) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s} updateStudentsData={updateStudentsData} />
            ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay
        isActive={isRollMode}
        onItemClick={onActiveRollAction}
        classAttendanceCount={classAttendanceCount}
        totalStudents={studentData?.length ?? 0}
        onStateIconClick={onStateIconClick}
      />
    </>
  )
}

type ToolbarAction = "roll" | "sort" | "complete"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
  setSearchValue: React.Dispatch<React.SetStateAction<string | null | undefined>>
  filterValue: {
    sortDirection: string
    sortValue: string
  }
  setFilterValue: React.Dispatch<
    React.SetStateAction<{
      sortDirection: string
      sortValue: string
    }>
  >
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, setSearchValue, filterValue, setFilterValue } = props

  return (
    <S.ToolbarContainer>
      <span>
        <FormControl>
          <S.Select label="Sort" defaultValue={"none"} onChange={(e) => setFilterValue({ ...filterValue, sortValue: e.target.value as string })}>
            <MenuItem value={"none"}>None </MenuItem>
            <MenuItem value={"firstname"}>Firstname </MenuItem>
            <MenuItem value={"lastname"}>Lastname </MenuItem>
          </S.Select>
        </FormControl>
        {filterValue.sortValue !== "none" &&
          (filterValue.sortDirection === "asc" ? (
            <S.FontAwesomeIcon
              icon="arrow-up"
              onClick={() => {
                setFilterValue({ ...filterValue, sortDirection: "des" })
              }}
            />
          ) : (
            <S.FontAwesomeIcon
              icon="arrow-down"
              onClick={() => {
                setFilterValue({ ...filterValue, sortDirection: "asc" })
              }}
            />
          ))}
      </span>
      <InputBase
        placeholder="Search…"
        inputProps={{
          "aria-label": "search",
        }}
        onChange={(e) => setSearchValue(e.target.value)}
        endAdornment={<FontAwesomeIcon icon="search" />}
        style={{
          color: "#fff",
        }}
      />

      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
  FontAwesomeIcon: styled(FontAwesomeIcon)`
    padding: 8px 8px;
  `,
  Select: styled(Select)`
    display: inline;
    .MuiSelect-select {
      color: #fff;
      width: 120px;
    }
    .MuiSelect-icon {
      color: #fff;
      outline: #fff;
    }
  `,
}
