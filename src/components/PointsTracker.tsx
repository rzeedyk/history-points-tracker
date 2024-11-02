import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

// Sound effects setup
const playPointSound = (isPositive: boolean) => {
  const audio = new Audio(isPositive 
    ? 'https://assets.mixkit.co/active_storage/sfx/2020/coin-collect-8.wav'
    : 'https://assets.mixkit.co/active_storage/sfx/2021/lose-2.wav'
  );
  audio.volume = 0.3;
  audio.play().catch(e => console.log('Sound play failed:', e));
};

const playGroupSound = (isPositive: boolean) => {
  const audio = new Audio(isPositive 
    ? 'https://assets.mixkit.co/active_storage/sfx/2020/coin-collect-8.wav'
    : 'https://assets.mixkit.co/active_storage/sfx/2021/lose-2.wav'
  );
  audio.volume = 0.2;
  audio.play().catch(e => console.log('Sound play failed:', e));
};

const PointsTracker = () => {
  // Load data from localStorage
  const loadStoredData = () => {
    const storedData = localStorage.getItem('historyTrackerData');
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (e) {
        console.error('Error loading stored data:', e);
        return [];
      }
    }
    return [];
  };

  // Save data to localStorage
  const saveToLocalStorage = (data: any) => {
    try {
      localStorage.setItem('historyTrackerData', JSON.stringify(data));
    } catch (e) {
      console.error('Error saving data:', e);
    }
  };

  const [classes, setClasses] = useState(loadStoredData() || [
    {
      id: 1,
      name: 'Period 1',
      groups: [
        { id: 1, name: 'Federalists', points: 0, students: [] },
        { id: 2, name: 'Patriots', points: 0, students: [] },
        { id: 3, name: 'Minutemen', points: 0, students: [] }
      ],
      students: []
    }
  ]);

  const [currentClassId, setCurrentClassId] = useState(1);
  const [isTeacher, setIsTeacher] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showTeamNameSuggestions, setShowTeamNameSuggestions] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showEndYearDialog, setShowEndYearDialog] = useState(false);

  // Save data when it changes
  useEffect(() => {
    saveToLocalStorage(classes);
  }, [classes]);

  const currentClass = classes.find(c => c.id === currentClassId);

  const addClass = () => {
    const newId = classes.length > 0 ? Math.max(...classes.map(c => c.id)) + 1 : 1;
    const newClass = {
      id: newId,
      name: `Period ${newId}`,
      groups: [
        { id: 1, name: 'Federalists', points: 0, students: [] },
        { id: 2, name: 'Patriots', points: 0, students: [] },
        { id: 3, name: 'Minutemen', points: 0, students: [] }
      ],
      students: []
    };
    setClasses([...classes, newClass]);
    setCurrentClassId(newId);
  };

  const addGroup = () => {
    setClasses(classes.map(classItem => {
      if (classItem.id === currentClassId) {
        const newGroupId = Math.max(...classItem.groups.map(g => g.id)) + 1;
        return {
          ...classItem,
          groups: [...classItem.groups, { 
            id: newGroupId, 
            name: `New Group ${newGroupId}`, 
            points: 0,
            students: []
          }]
        };
      }
      return classItem;
    }));
  };

  const addStudent = () => {
    setClasses(classes.map(classItem => {
      if (classItem.id === currentClassId) {
        const newStudentId = classItem.students.length + 1;
        return {
          ...classItem,
          students: [...classItem.students, 
            { id: newStudentId, name: `Student ${newStudentId}`, points: 0, groupId: null }
          ]
        };
      }
      return classItem;
    }));
  };

  const assignStudentToGroup = (studentId: number, groupId: number | null) => {
    setClasses(classes.map(classItem => {
      if (classItem.id === currentClassId) {
        return {
          ...classItem,
          students: classItem.students.map(student =>
            student.id === studentId ? { ...student, groupId } : student
          ),
          groups: classItem.groups.map(group => ({
            ...group,
            students: groupId === group.id 
              ? [...group.students, studentId]
              : group.students.filter(id => id !== studentId)
          }))
        };
      }
      return classItem;
    }));
  };

  const adjustPoints = (type: string, id: number, amount: number) => {
    const isPositive = amount > 0;
    setClasses(classes.map(classItem => {
      if (classItem.id === currentClassId) {
        if (type === 'group') {
          playPointSound(isPositive);
          return {
            ...classItem,
            groups: classItem.groups.map(group =>
              group.id === id ? { ...group, points: Math.max(0, group.points + amount) } : group
            )
          };
        } else {
          const student = classItem.students.find(s => s.id === id);
          if (!student) return classItem;

          playPointSound(isPositive);
          if (student.groupId) playGroupSound(isPositive);

          return {
            ...classItem,
            students: classItem.students.map(student =>
              student.id === id ? { ...student, points: Math.max(0, student.points + amount) } : student
            ),
            groups: classItem.groups.map(group =>
              group.id === student.groupId 
                ? { ...group, points: Math.max(0, group.points + amount) }
                : group
            )
          };
        }
      }
      return classItem;
    }));
  };

  const startEditing = (id: number, type: string, currentName: string) => {
    setEditingId(id);
    setEditingType(type);
    setEditingName(currentName);
  };

  const saveEdit = () => {
    setClasses(classes.map(classItem => {
      if (classItem.id === currentClassId) {
        if (editingType === 'class') {
          return { ...classItem, name: editingName };
        }
        if (editingType === 'group') {
          return {
            ...classItem,
            groups: classItem.groups.map(group =>
              group.id === editingId ? { ...group, name: editingName } : group
            )
          };
        }
        if (editingType === 'student') {
          return {
            ...classItem,
            students: classItem.students.map(student =>
              student.id === editingId ? { ...student, name: editingName } : student
            )
          };
        }
      }
      return classItem;
    }));
    setEditingId(null);
    setEditingType(null);
  };

  const resetGame = () => {
    setClasses(classes.map(classItem => ({
      ...classItem,
      groups: classItem.groups.map(group => ({ ...group, points: 0, students: [] })),
      students: classItem.students.map(student => ({ ...student, points: 0, groupId: null }))
    })));
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
            <div className="flex items-center gap-2">
              Class Selection
            </div>
            <Button 
              onClick={addClass} 
              className="bg-red-700 hover:bg-red-800"
            >
              Add Class
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Select 
            value={currentClassId.toString()} 
            onChange={(e) => setCurrentClassId(parseInt(e.target.value))}
          >
            {classes.map(classItem => (
              <option key={classItem.id} value={classItem.id.toString()}>
                {classItem.name}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      {currentClass && (

        <>
          {/* Group Points Section with Rankings */}
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
              {/* Rankings Overview */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-bold mb-2">Current Rankings</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[...currentClass.groups]
                    .sort((a, b) => b.points - a.points)
                    .map((group, index) => (
                      <div 
                        key={group.id} 
                        className={`p-2 rounded-lg flex items-center gap-2 ${
                          index === 0 ? 'bg-yellow-100 border-2 border-yellow-400' :
                          index === 1 ? 'bg-gray-100 border-2 border-gray-400' :
                          index === 2 ? 'bg-orange-100 border-2 border-orange-400' :
                          'bg-white border border-gray-200'
                        }`}
                      >
                        <span className="text-2xl">
                          {index === 0 ? '🏆' :
                           index === 1 ? '🥈' :
                           index === 2 ? '🥉' : ''}
                        </span>
                        <div>
                          <div className="font-bold">{group.name}</div>
                          <div className="text-sm text-gray-600">{group.points} points</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Group Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {currentClass.groups.map(group => (
                  <div key={group.id} className="p-4 border-2 border-red-200 rounded-lg bg-white shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      {editingType === 'group' && editingId === group.id ? (
                        <div className="flex gap-2">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="w-40"
                          />
                          <Button onClick={saveEdit} className="bg-green-600">
                            Save
                          </Button>
                          <Button onClick={() => setEditingId(null)} className="bg-red-600">
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <h3 className="font-semibold flex items-center gap-1 cursor-pointer hover:text-red-700"
                            onClick={() => startEditing(group.id, 'group', group.name)}>
                          {group.name}
                        </h3>
                      )}
                      <span className="text-2xl font-bold text-red-800">
                        {group.points}
                      </span>
                    </div>

                    {/* Animated Star Divider */}
                    <div className="relative flex items-center my-4">
                      <div className="h-px bg-blue-800 flex-1" />
                      <div 
                        className="mx-2 transition-all duration-500 ease-out"
                        style={{ 
                          transform: `scale(${1 + Math.abs(group.points) * 0.02})`
                        }}
                      >
                        <div className="text-red-700 text-2xl">★</div>
                      </div>
                      <div className="h-px bg-blue-800 flex-1" />
                    </div>

                    {/* Points Buttons */}
                    <div className="flex justify-between mt-4">
                      {/* Negative points group */}
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => adjustPoints('group', group.id, -1)}
                          variant="outline"
                          className="border-red-800 text-red-800 hover:bg-red-50 transform transition hover:scale-105"
                        >
                          -1
                        </Button>
                        <Button 
                          onClick={() => adjustPoints('group', group.id, -5)}
                          variant="outline"
                          className="border-red-800 text-red-800 hover:bg-red-50 transform transition hover:scale-105"
                        >
                          -5
                        </Button>
                      </div>
                      
                      {/* Positive points group */}
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => adjustPoints('group', group.id, 1)}
                          variant="outline"
                          className="border-red-800 text-red-800 hover:bg-red-50 transform transition hover:scale-105"
                        >
                          +1
                        </Button>
                        <Button 
                          onClick={() => adjustPoints('group', group.id, 5)}
                          variant="outline"
                          className="border-red-800 text-red-800 hover:bg-red-50 transform transition hover:scale-105"
                        >
                          +5
                        </Button>
                      </div>
                    </div>

                    {/* Students in Group */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold mb-2">Students:</h4>
                      <div className="space-y-2">
                        {currentClass.students
                          .filter(student => student.groupId === group.id)
                          .map(student => (
                            <div key={student.id} className="flex justify-between items-center">
                              <span>{student.name}</span>
                              <span className="text-sm text-gray-600">{student.points} pts</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Student Management Section */}
          <Card className="border-2 border-blue-800">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  Student Management
                </div>
                <Button 
                  onClick={addStudent} 
                  className="bg-blue-700 hover:bg-blue-800"
                >
                  Add Student
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {currentClass.students.map(student => (
                  <div key={student.id} className="p-4 border-2 border-blue-200 rounded-lg bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      {editingType === 'student' && editingId === student.id ? (
                        <div className="flex gap-2">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="w-40"
                          />
                          <Button onClick={saveEdit} className="bg-green-600">
                            Save
                          </Button>
                          <Button onClick={() => setEditingId(null)} className="bg-red-600">
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <h3 className="font-semibold cursor-pointer hover:text-blue-700"
                            onClick={() => startEditing(student.id, 'student', student.name)}>
                          {student.name}
                        </h3>
                      )}
                      <span className="text-xl font-bold text-blue-800">{student.points}</span>
                    </div>
                    
                    <div className="mt-2 mb-4">
                      <select
                        className="w-full p-2 border rounded"
                        value={student.groupId || ''}
                        onChange={(e) => assignStudentToGroup(student.id, e.target.value ? Number(e.target.value) : null)}
                      >
                        <option value="">No Group</option>
                        {currentClass.groups.map(group => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Student Point Buttons */}
                    <div className="flex justify-between mt-4">
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => adjustPoints('student', student.id, -1)}
                          variant="outline"
                          className="border-blue-800 text-blue-800 hover:bg-blue-50 transform transition hover:scale-105"
                        >
                          -1
                        </Button>
                        <Button 
                          onClick={() => adjustPoints('student', student.id, -5)}
                          variant="outline"
                          className="border-blue-800 text-blue-800 hover:bg-blue-50 transform transition hover:scale-105"
                        >
                          -5
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => adjustPoints('student', student.id, 1)}
                          variant="outline"
                          className="border-blue-800 text-blue-800 hover:bg-blue-50 transform transition hover:scale-105"
                        >
                          +1
                        </Button>
                        <Button 
                          onClick={() => adjustPoints('student', student.id, 5)}
                          variant="outline"
                          className="border-blue-800 text-blue-800 hover:bg-blue-50 transform transition hover:scale-105"
                        >
                          +5
                        </Button>
                      </div>
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
              This will clear all groups and reset all points to zero. 
              Student names and class information will be preserved. 
              This action cannot be undone.
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
