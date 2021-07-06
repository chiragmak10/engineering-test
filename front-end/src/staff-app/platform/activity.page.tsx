import React, { useEffect } from "react"
import styled from "styled-components"
import { BorderRadius, FontWeight, Spacing } from "shared/styles/styles"

import { useApi } from "shared/hooks/use-api"
import { Activity } from "shared/models/activity"
import { Colors } from "shared/styles/colors"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@material-ui/core"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export const ActivityPage: React.FC = () => {
  const [getActivities, activityData, loadState] = useApi<{ activity: Activity[] }>({ url: "get-activities" })

  useEffect(() => {
    void getActivities()
  }, [getActivities])

  return (
    <S.TableContainer>
      <S.ToolbarContainer>Activity</S.ToolbarContainer>
      {loadState === "loading" && (
        <CenteredContainer>
          <FontAwesomeIcon icon="spinner" size="2x" spin />
        </CenteredContainer>
      )}
      {loadState === "loaded" && activityData?.activity && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Completed At</TableCell>
              <TableCell>Entity Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activityData.activity.map((x) => {
              const date = new Date(x.date)
              return (
                <TableRow>
                  <TableCell>{x.type.charAt(0).toUpperCase() + x.type.slice(1)}</TableCell>
                  <TableCell>{date.toLocaleDateString() + " " + date.toLocaleTimeString()}</TableCell>
                  <TableCell>{x.entity.name}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
      {loadState === "error" && (
        <CenteredContainer>
          <div>Failed to load</div>
        </CenteredContainer>
      )}
    </S.TableContainer>
  )
}
const S = {
  TableContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 24px;
    align-content: center;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
}
