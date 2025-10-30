import { useState, useEffect } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable
} from '@hello-pangea/dnd';
import {
  PlayIcon,
  DocumentTextIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon,
  ArrowsUpDownIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../ui/Toast';
import { updateLesson, deleteLesson, updateLessonOrder } from '../../services/firestore';

export default function BulkLessonManager({ 
  lessons, 
  courseId, 
  onLessonsUpdate, 
  onAddLesson,
  onEditLesson 
}) {
  const { success, error } = useToast();
  const [localLessons, setLocalLessons] = useState([]);
  const [selectedLessons, setSelectedLessons] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [isReordering, setIsReordering] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sort lessons by order and set local state
    const sortedLessons = [...lessons].sort((a, b) => (a.order || 0) - (b.order || 0));
    setLocalLessons(sortedLessons);
    setHasChanges(false);
  }, [lessons]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(localLessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedLessons = items.map((lesson, index) => ({
      ...lesson,
      order: index + 1
    }));

    setLocalLessons(updatedLessons);
    setHasChanges(true);
  };

  const saveOrder = async () => {
    try {
      setLoading(true);
      await updateLessonOrder(courseId, localLessons);
      onLessonsUpdate();
      setHasChanges(false);
      success('Lesson order updated successfully!');
    } catch (err) {
      console.error('Error updating lesson order:', err);
      error('Failed to update lesson order');
    } finally {
      setLoading(false);
    }
  };

  const cancelReorder = () => {
    const sortedLessons = [...lessons].sort((a, b) => (a.order || 0) - (b.order || 0));
    setLocalLessons(sortedLessons);
    setHasChanges(false);
    setIsReordering(false);
  };

  const toggleLessonSelection = (lessonId) => {
    const newSelection = new Set(selectedLessons);
    if (newSelection.has(lessonId)) {
      newSelection.delete(lessonId);
    } else {
      newSelection.add(lessonId);
    }
    setSelectedLessons(newSelection);
  };

  const selectAllLessons = () => {
    if (selectedLessons.size === localLessons.length) {
      setSelectedLessons(new Set());
    } else {
      setSelectedLessons(new Set(localLessons.map(l => l.id)));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedLessons.size === 0) return;

    try {
      setLoading(true);
      
      switch (bulkAction) {
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedLessons.size} lesson(s)?`)) {
            const deletePromises = Array.from(selectedLessons).map(lessonId => 
              deleteLesson(courseId, lessonId)
            );
            await Promise.all(deletePromises);
            success(`${selectedLessons.size} lesson(s) deleted successfully!`);
            onLessonsUpdate();
            setSelectedLessons(new Set());
          }
          break;
          
        case 'free':
          const freePromises = Array.from(selectedLessons).map(lessonId => {
            const lesson = localLessons.find(l => l.id === lessonId);
            return updateLesson(courseId, lessonId, { ...lesson, isFree: true });
          });
          await Promise.all(freePromises);
          success(`${selectedLessons.size} lesson(s) marked as free!`);
          onLessonsUpdate();
          setSelectedLessons(new Set());
          break;
          
        case 'premium':
          const premiumPromises = Array.from(selectedLessons).map(lessonId => {
            const lesson = localLessons.find(l => l.id === lessonId);
            return updateLesson(courseId, lessonId, { ...lesson, isFree: false });
          });
          await Promise.all(premiumPromises);
          success(`${selectedLessons.size} lesson(s) marked as premium!`);
          onLessonsUpdate();
          setSelectedLessons(new Set());
          break;
      }
      
      setBulkAction('');
    } catch (err) {
      console.error('Error performing bulk action:', err);
      error('Failed to perform bulk action');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    return localLessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Lesson Management</h3>
            <p className="text-sm text-gray-600">
              {localLessons.length} lessons • Total duration: {formatDuration(getTotalDuration())}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsReordering(!isReordering)}
              className={`btn-outline flex items-center gap-2 ${
                isReordering ? 'bg-blue-50 border-blue-200 text-blue-700' : ''
              }`}
            >
              <ArrowsUpDownIcon className="w-5 h-5" />
              {isReordering ? 'Exit Reorder' : 'Reorder Lessons'}
            </button>
            <button
              onClick={onAddLesson}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add Lesson
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {!isReordering && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedLessons.size === localLessons.length && localLessons.length > 0}
                onChange={selectAllLessons}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                {selectedLessons.size > 0 
                  ? `${selectedLessons.size} selected`
                  : 'Select all'
                }
              </span>
            </div>

            {selectedLessons.size > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="form-input text-sm"
                >
                  <option value="">Bulk Actions</option>
                  <option value="delete">Delete Selected</option>
                  <option value="free">Mark as Free</option>
                  <option value="premium">Mark as Premium</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction || loading}
                  className="btn-primary text-sm"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reorder Actions */}
        {isReordering && hasChanges && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 flex-1">
              You have unsaved changes to the lesson order
            </p>
            <button
              onClick={saveOrder}
              disabled={loading}
              className="btn-primary text-sm flex items-center gap-1"
            >
              <CheckIcon className="w-4 h-4" />
              Save Order
            </button>
            <button
              onClick={cancelReorder}
              className="btn-outline text-sm flex items-center gap-1"
            >
              <XMarkIcon className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Lessons List */}
      <div className="p-6">
        {localLessons.length === 0 ? (
          <div className="text-center py-12">
            <PlayIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No lessons yet</h3>
            <p className="text-gray-600 mb-6">Start building your course by adding your first lesson</p>
            <button
              onClick={onAddLesson}
              className="btn-primary"
            >
              Add Your First Lesson
            </button>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="lessons" isDropDisabled={!isReordering}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-3 ${
                    snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''
                  }`}
                >
                  {localLessons.map((lesson, index) => (
                    <Draggable
                      key={lesson.id}
                      draggableId={lesson.id}
                      index={index}
                      isDragDisabled={!isReordering}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`border rounded-lg p-4 transition-all ${
                            snapshot.isDragging
                              ? 'shadow-lg bg-white border-blue-300'
                              : 'bg-gray-50 hover:bg-gray-100'
                          } ${
                            selectedLessons.has(lesson.id) ? 'ring-2 ring-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Drag Handle */}
                            {isReordering && (
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                              >
                                <ArrowsUpDownIcon className="w-5 h-5" />
                              </div>
                            )}

                            {/* Selection Checkbox */}
                            {!isReordering && (
                              <input
                                type="checkbox"
                                checked={selectedLessons.has(lesson.id)}
                                onChange={() => toggleLessonSelection(lesson.id)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            )}

                            {/* Lesson Number */}
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>

                            {/* Lesson Icon */}
                            <div className="flex-shrink-0">
                              {lesson.type === 'video' ? (
                                <PlayIcon className="w-6 h-6 text-blue-600" />
                              ) : (
                                <DocumentTextIcon className="w-6 h-6 text-green-600" />
                              )}
                            </div>

                            {/* Lesson Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">{lesson.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <ClockIcon className="w-4 h-4" />
                                  {formatDuration(lesson.duration)}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  lesson.isFree 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {lesson.isFree ? 'Free Preview' : 'Premium'}
                                </span>
                                {lesson.description && (
                                  <span className="truncate">{lesson.description}</span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            {!isReordering && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onEditLesson(lesson)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit lesson"
                                >
                                  <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => {
                                    // Preview lesson functionality
                                    success('Lesson preview coming soon!');
                                  }}
                                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                  title="Preview lesson"
                                >
                                  <EyeIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (window.confirm('Are you sure you want to delete this lesson?')) {
                                      try {
                                        await deleteLesson(courseId, lesson.id);
                                        success('Lesson deleted successfully!');
                                        onLessonsUpdate();
                                      } catch (err) {
                                        error('Failed to delete lesson');
                                      }
                                    }
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete lesson"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
