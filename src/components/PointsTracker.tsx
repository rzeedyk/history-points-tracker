import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

// Historical team names
const historicalTeamNames = [
  "Federalists",
  "Patriots",
  "Minutemen",
  "Continentals",
  "Liberty Guard",
  "Freedom Riders",
  "Union Squad",
  "Constitution Team",
  "Independence Corps",
  "Revolution Unit",
  "Colonial Force",
  "Democracy Guards",
  "Liberty Legion",
  "Republic Rangers",
  "Eagle Squadron",
];

// Decorative Components
const StarDivider = () => (
  <div className="flex items-center justify-center my-2">
    <div className="h-px bg-blue-800 flex-1" />
    <div className="mx-2 text-red-700">★</div>
    <div className="h-px bg-blue-800 flex-1" />
  </div>
);
const PointsTracker = () => {
  // State declarations
  const [classes, setClasses] = useState([
    {
      id: 1,
      name: "Period 1",
      groups: [
        { id: 1, name: "Federalists", points: 0 },
        { id: 2, name: "Patriots", points: 0 },
        { id: 3, name: "Minutemen", points: 0 },
      ],
      students: [
        { id: 1, name: "Student 1", points: 0 },
        { id: 2, name: "Student 2", points: 0 },
        { id: 3, name: "Student 3", points: 0 },
      ],
    },
  ]);

  const [currentClassId, setCurrentClassId] = useState(1);
  const [isTeacher, setIsTeacher] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [showTeamNameSuggestions, setShowTeamNameSuggestions] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showEndYearDialog, setShowEndYearDialog] = useState(false);

  const currentClass = classes.find((c) => c.id === currentClassId); // Helper functions
  const addClass = () => {
    const newId =
      classes.length > 0 ? Math.max(...classes.map((c) => c.id)) + 1 : 1;
    const newClass = {
      id: newId,
      name: `Period ${newId}`,
      groups: [
        { id: 1, name: "Federalists", points: 0 },
        { id: 2, name: "Patriots", points: 0 },
        { id: 3, name: "Minutemen", points: 0 },
      ],
      students: [],
    };
    setClasses([...classes, newClass]);
    setCurrentClassId(newId);
  };

  const addGroup = () => {
    setClasses(
      classes.map((classItem) => {
        if (classItem.id === currentClassId) {
          const newGroupId = Math.max(...classItem.groups.map((g) => g.id)) + 1;
          const suggestedName =
            historicalTeamNames[
              classItem.groups.length % historicalTeamNames.length
            ];
          return {
            ...classItem,
            groups: [
              ...classItem.groups,
              { id: newGroupId, name: suggestedName, points: 0 },
            ],
          };
        }
        return classItem;
      })
    );
  };

  const addStudent = () => {
    setClasses(
      classes.map((classItem) => {
        if (classItem.id === currentClassId) {
          const newStudentId = classItem.students.length + 1;
          return {
            ...classItem,
            students: [
              ...classItem.students,
              { id: newStudentId, name: `Student ${newStudentId}`, points: 0 },
            ],
          };
        }
        return classItem;
      })
    );
  };

  const startEditing = (id: number, type: string, currentName: string) => {
    setEditingId(id);
    setEditingType(type);
    setEditingName(currentName);
  };

  const selectTeamName = (name: string) => {
    setEditingName(name);
    setShowTeamNameSuggestions(false);
  };

  const saveEdit = () => {
    setClasses(
      classes.map((classItem) => {
        if (classItem.id === currentClassId) {
          if (editingType === "class") {
            return { ...classItem, name: editingName };
          }
          if (editingType === "group") {
            return {
              ...classItem,
              groups: classItem.groups.map((group) =>
                group.id === editingId ? { ...group, name: editingName } : group
              ),
            };
          }
          if (editingType === "student") {
            return {
              ...classItem,
              students: classItem.students.map((student) =>
                student.id === editingId
                  ? { ...student, name: editingName }
                  : student
              ),
            };
          }
        }
        return classItem;
      })
    );
    setEditingId(null);
    setEditingType(null);
  };

  const adjustPoints = (type: string, id: number, amount: number) => {
    setClasses(
      classes.map((classItem) => {
        if (classItem.id === currentClassId) {
          if (type === "group") {
            return {
              ...classItem,
              groups: classItem.groups.map((group) =>
                group.id === id
                  ? { ...group, points: Math.max(0, group.points + amount) }
                  : group
              ),
            };
          } else {
            return {
              ...classItem,
              students: classItem.students.map((student) =>
                student.id === id
                  ? { ...student, points: Math.max(0, student.points + amount) }
                  : student
              ),
            };
          }
        }
        return classItem;
      })
    );
  };

  const resetGame = () => {
    setClasses(
      classes.map((classItem) => ({
        ...classItem,
        groups: [],
        students: classItem.students.map((student) => ({
          ...student,
          points: 0,
        })),
      }))
    );
    setShowResetDialog(false);
  };

  const endYear = () => {
    setClasses([]);
    setCurrentClassId(1);
    setShowEndYearDialog(false);
  };
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 bg-slate-50">
      {/* Header */}
      <div className="text-center py-6 bg-blue-900 text-white rounded-lg shadow-lg relative overflow-hidden">
        <h1 className="text-3xl font-bold">Historical Achievement Tracker</h1>
        <p className="text-blue-200">Documenting Progress Through History</p>
      </div>

      {/* Class Selection */}
      <Card className="border-2 border-blue-800">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">Class Selection</div>
            <Button onClick={addClass} className="bg-red-700 hover:bg-red-800">
              Add Class
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Select
            value={currentClassId.toString()}
            onChange={(e) => setCurrentClassId(parseInt(e.target.value))}
          >
            {classes.map((classItem) => (
              <option key={classItem.id} value={classItem.id.toString()}>
                {classItem.name}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>
      {currentClass && (
        <>
          {/* Group Points Section */}
          <Card className="border-2 border-red-800">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  Group Points - {currentClass.name}
                </div>
                <Button
                  onClick={addGroup}
                  className="bg-red-700 hover:bg-red-800"
                >
                  Add Group
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {currentClass.groups.map((group) => (
                  <div
                    key={group.id}
                    className="p-4 border-2 border-red-200 rounded-lg bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      {editingType === "group" && editingId === group.id ? (
                        <div className="flex gap-2">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="w-40"
                          />
                          <Button onClick={saveEdit} className="bg-green-600">
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingId(null)}
                            className="bg-red-600"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <h3
                          className="font-semibold flex items-center gap-1 cursor-pointer hover:text-red-700"
                          onClick={() =>
                            startEditing(group.id, "group", group.name)
                          }
                        >
                          {group.name}
                        </h3>
                      )}
                      <span className="text-2xl font-bold text-red-800">
                        {group.points}
                      </span>
                    </div>
                    <StarDivider />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => adjustPoints("group", group.id, -1)}
                        variant="outline"
                        className="border-red-800 text-red-800 hover:bg-red-50"
                      >
                        -1
                      </Button>
                      <Button
                        onClick={() => adjustPoints("group", group.id, 1)}
                        variant="outline"
                        className="border-red-800 text-red-800 hover:bg-red-50"
                      >
                        +1
                      </Button>
                      <Button
                        onClick={() => adjustPoints("group", group.id, 5)}
                        variant="outline"
                        className="border-red-800 text-red-800 hover:bg-red-50"
                      >
                        +5
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Reset Options */}
          <Card className="border-2 border-blue-800">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2">
                Reset Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={() => setShowResetDialog(true)}
                  variant="outline"
                  className="border-red-800 text-red-800 hover:bg-red-50"
                >
                  Reset Current Game
                </Button>
                <Button
                  onClick={() => setShowEndYearDialog(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  End School Year
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Reset Game Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Current Game?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all groups and reset all points to zero. Student
              names and class information will be preserved. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowResetDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={resetGame}
              className="bg-red-600 hover:bg-red-700"
            >
              Reset Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* End Year Dialog */}
      <AlertDialog open={showEndYearDialog} onOpenChange={setShowEndYearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              End School Year?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will clear ALL data, including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All classes</li>
                <li>All student names</li>
                <li>All groups</li>
                <li>All points</li>
              </ul>
              This action cannot be undone. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowEndYearDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={endYear}
              className="bg-red-600 hover:bg-red-700"
            >
              Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PointsTracker;
