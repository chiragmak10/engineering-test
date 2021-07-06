import React, { useEffect, useReducer, useState } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person, SORTVALUE, SORTORDER, ROLLSTATE, sortType, INITIALCOUNT } from "shared/models/person"
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
  const [classAttendanceCount, setClassAttendanceCount] = useState({ presentCount: INITIALCOUNT, absentCount: INITIALCOUNT, lateCount: INITIALCOUNT })

  const initialSortingValues = { sortOrder: SORTORDER.ascending, sortValue: SORTVALUE.none }
  const reducer = (state: sortType, action: sortType): sortType => {
    let sortedData: Person[] | undefined = []
    switch (action.sortValue) {
      case SORTVALUE.firstname:
        if (action.sortOrder === SORTORDER.descending) {
          sortedData = studentData?.sort((x, y) => x.first_name.localeCompare(y.first_name))
          setStudentData(sortedData)
        } else if (action.sortOrder === SORTORDER.ascending) {
          sortedData = studentData?.sort((x, y) => y.first_name.localeCompare(x.first_name))
          setStudentData(sortedData)
        }
        return { ...action }
      case SORTVALUE.lastname:
        if (action.sortOrder === SORTORDER.descending) {
          sortedData = studentData?.sort((x, y) => x.last_name.localeCompare(y.last_name))
          setStudentData(sortedData)
        } else if (action.sortOrder === SORTORDER.ascending) {
          sortedData = studentData?.sort((x, y) => y.last_name.localeCompare(x.last_name))
          setStudentData(sortedData)
        }
        return { ...action }
      default:
        setStudentData(studentData)
        return { ...state, sortValue: SORTVALUE.none }
    }
  }

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

  const [state, dispatch] = useReducer(reducer, initialSortingValues)

  const onToolbarAction = (action: ToolbarAction) => {
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
  const updateStudentsData = (rollState: string, student: Person): void => {
    const updatedData = studentData?.map(
      (item): Person => {
        if (item.id === student.id) return { ...item, roll_state: rollState }
        else return { ...item }
      }
    )
    setStudentData(updatedData)
    updateStudentsCount(updatedData)
  }

  const updateStudentsCount = (updatedData: any[] | undefined) => {
    const presentCount = updatedData?.filter((x: Person) => x?.roll_state === ROLLSTATE.present)
    const absentCount = updatedData?.filter((y: Person) => y?.roll_state === ROLLSTATE.absent)
    const lateCount = updatedData?.filter((z: Person) => z?.roll_state === ROLLSTATE.late)

    setClassAttendanceCount({ presentCount: presentCount?.length ?? 0, absentCount: absentCount?.length ?? 0, lateCount: lateCount?.length || 0 })
  }
  const onStateIconClick = (value: any) => {
    if (value !== "all") {
      const rollBasedData = studentData?.filter((x) => x.roll_state === value)
      setStudentData(rollBasedData)
    } else {
      setStudentData(data?.students)
    }
  }
  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} setSearchValue={setSearchValue} state={state} dispatch={dispatch} />
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
  state: sortType
  dispatch: any
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, setSearchValue, dispatch, state } = props

  return (
    <S.ToolbarContainer>
      <span>
        <FormControl>
          <S.Select
            label="Sort"
            defaultValue={SORTVALUE.none}
            onChange={(e) => {
              dispatch({ sortValue: e.target.value as string, sortOrder: SORTORDER.ascending })
            }}
          >
            <MenuItem value={SORTVALUE.none}>None </MenuItem>
            <MenuItem value={SORTVALUE.firstname}>Firstname </MenuItem>
            <MenuItem value={SORTVALUE.lastname}>Lastname </MenuItem>
          </S.Select>
        </FormControl>
        {state.sortValue !== SORTVALUE.none &&
          (state.sortOrder === SORTORDER.ascending ? (
            <S.FontAwesomeIcon
              icon="arrow-up"
              onClick={() => {
                dispatch({ ...state, sortOrder: SORTORDER.descending })
              }}
            />
          ) : (
            <S.FontAwesomeIcon
              icon="arrow-down"
              onClick={() => {
                dispatch({ ...state, sortOrder: SORTORDER.ascending })
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
