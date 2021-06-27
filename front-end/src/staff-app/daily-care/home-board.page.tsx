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

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [searchValue, setSearchValue] = useState<string | null>()
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [studentData, setStudentData] = useState<Person[] | undefined>([])
  const [classAttendanceCount, setClassAttendanceCount] = useState({ presentCount: 0, absentCount: 0, lateCount: 0 })

  useEffect(() => {
    if (data) setStudentData(data.students)
  }, [data, loadState])

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
    // else if (action === "sort") {
    //   {
    //     // sortStudents(value)
    //   }
    // }
  }
  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
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

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} setSearchValue={setSearchValue} />
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
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} classAttendanceCount={classAttendanceCount} totalStudents={studentData?.length ?? 0} />
    </>
  )
}

type ToolbarAction = "roll" | "sort"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
  setSearchValue: React.Dispatch<React.SetStateAction<string | null | undefined>>
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, setSearchValue } = props

  return (
    <S.ToolbarContainer>
      <div onClick={() => onItemClick("sort")}></div>
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
}
