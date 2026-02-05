import { useMemo } from "react";
import { Box, Card, Typography, Chip, Avatar, Paper } from "@mui/material";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/projectService";
import { taskService } from "@/services/taskService";
import type { Task } from "@/types";

interface TasksBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const statusConfig: Record<string, string> = {
  DRAFT: "default",
  IN_PROGRESS: "primary",
  PENDING_REVIEW: "warning",
  REVISION_REQUESTED: "info",
  APPROVED: "success",
  REJECTED: "error",
  COMPLETED: "success",
};

export default function TasksBoard({ tasks, onTaskClick }: TasksBoardProps) {
  const queryClient = useQueryClient();

  // Fetch active projects for columns
  const { data: projectsData } = useQuery({
    queryKey: ["projects-board"],
    queryFn: () => projectService.search({ status: "ACTIVE" }),
  });

  const projects = projectsData?.ResultOnDb || [];

  // Group tasks by Project ID
  const tasksByProject = useMemo(() => {
    const grouped: Record<number, Task[]> = {};
    projects.forEach((p) => {
      grouped[p.ID] = [];
    });
    // Add tasks to groups
    tasks.forEach((task) => {
      if (grouped[task.PROJECT_ID]) {
        grouped[task.PROJECT_ID].push(task);
      }
    });
    return grouped;
  }, [tasks, projects]);

  const updateTaskProjectMutation = useMutation({
    mutationFn: ({
      taskId,
      projectId,
    }: {
      taskId: number;
      projectId: number;
    }) => taskService.update(taskId, { PROJECT_ID: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newProjectId = Number(destination.droppableId);
    const taskId = Number(draggableId);

    if (newProjectId !== Number(source.droppableId)) {
      updateTaskProjectMutation.mutate({ taskId, projectId: newProjectId });
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box
        sx={{
          display: "flex",
          overflowX: "auto",
          gap: 2,
          pb: 2,
          height: "calc(100vh - 250px)", // Fixed height container
          alignItems: "flex-start",
        }}
      >
        {projects.map((project) => (
          <Box
            key={project.ID}
            sx={{
              minWidth: 320,
              maxWidth: 320,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "grey.100",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                  [{project.CODE}] {project.NAME}
                </Typography>
                <Chip
                  label={tasksByProject[project.ID]?.length || 0}
                  size="small"
                />
              </Box>

              <Droppable droppableId={String(project.ID)}>
                {(provided, snapshot) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{
                      flexGrow: 1,
                      overflowY: "auto",
                      minHeight: 100,
                      transition: "background-color 0.2s ease",
                      bgcolor: snapshot.isDraggingOver
                        ? "grey.200"
                        : "transparent",
                      borderRadius: 1,
                      p: 0.5,
                    }}
                  >
                    {tasksByProject[project.ID]?.map((task, index) => (
                      <Draggable
                        key={task.ID}
                        draggableId={String(task.ID)}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onTaskClick(task)}
                            sx={{
                              p: 2,
                              mb: 2,
                              cursor: "grab",
                              transition: "box-shadow 0.2s",
                              boxShadow: snapshot.isDragging ? 4 : 1,
                              "&:hover": { boxShadow: 2 },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="primary"
                                fontFamily="monospace"
                              >
                                {task.CODE}
                              </Typography>
                              <Chip
                                label={task.STATUS}
                                size="small"
                                color={
                                  (statusConfig[task.STATUS] as any) ||
                                  "default"
                                }
                                sx={{ height: 20, fontSize: "0.625rem" }}
                              />
                            </Box>
                            <Typography
                              variant="body2"
                              fontWeight="500"
                              gutterBottom
                            >
                              {task.TITLE}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mt: 1.5,
                              }}
                            >
                              <Avatar
                                sx={{ width: 24, height: 24, fontSize: 10 }}
                              >
                                {task.assignees?.[0]?.user?.FIRST_NAME?.[0] ||
                                  "?"}
                              </Avatar>
                              {task.DUE_DATE && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {new Date(task.DUE_DATE).toLocaleDateString()}
                                </Typography>
                              )}
                            </Box>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Paper>
          </Box>
        ))}
        {projects.length === 0 && (
          <Typography sx={{ p: 4, color: "text.secondary" }}>
            No active projects found to display board.
          </Typography>
        )}
      </Box>
    </DragDropContext>
  );
}
