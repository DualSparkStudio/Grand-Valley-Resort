import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import type { Room } from '../lib/supabase';
import { api } from '../lib/supabase';

const AdminRooms: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [globalTimes, setGlobalTimes] = useState({
    check_in_time: '',
    check_out_time: ''
  });

  const [roomTypeForm, setRoomTypeForm] = useState({
    name: '',
    description: '',
    price_per_night: '',
    max_occupancy: '',
    amenities: '',
    image_url: '',
    images: [''], // Add images array like attractions
    is_active: true,
    extra_guest_price: '',
    accommodation_details: '',
    floor: '',
    // Occupancy-based pricing
    price_double_occupancy: '',
    price_triple_occupancy: '',
    price_four_occupancy: '',
    extra_mattress_price: '200' // Default ₹200
  });
  const [selectedRoomType, setSelectedRoomType] = useState<Room | null>(null);
  const [roomTypeModalMode, setRoomTypeModalMode] = useState<'edit' | 'add' | 'view'>('add');

  const [imagePreview, setImagePreview] = useState<string>('');
  const [roomTypes, setRoomTypes] = useState<Room[]>([]);
  const [uploadingImage, setUploadingImage] = useState<number | null>(null);

  useEffect(() => {
    loadData();
    // Load global times from localStorage
    const savedCheckIn = localStorage.getItem('globalCheckInTime');
    const savedCheckOut = localStorage.getItem('globalCheckOutTime');
    if (savedCheckIn || savedCheckOut) {
      setGlobalTimes({
        check_in_time: savedCheckIn || '',
        check_out_time: savedCheckOut || ''
      });
    }
  }, []);

  // Update image preview whenever roomTypeForm.images changes
  useEffect(() => {
    const firstValidImage = roomTypeForm.images.find(img => img.trim());
    setImagePreview(firstValidImage || '');
  }, [roomTypeForm.images]);

  // Debug modal mode changes
  useEffect(() => {
  }, [roomTypeModalMode]);

  // Debug modal open state
  useEffect(() => {
    if (isModalOpen) {
    }
  }, [isModalOpen, roomTypeModalMode]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getAllRooms();
      setRoomTypes(data || []);
    } catch (error) {
      toast.error('Failed to load room data');
      // Set empty array to prevent undefined errors
      setRoomTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setRoomTypeModalMode('add'); // Reset modal mode to default
    setSelectedRoomType(null);
        setRoomTypeForm({ 
          name: '', 
          description: '', 
          price_per_night: '', 
          max_occupancy: '', 
          amenities: '', 
          image_url: '', 
          images: [''], // Reset images array
          is_active: true, 
          extra_guest_price: '', 
          accommodation_details: '',
          floor: '',
          price_double_occupancy: '',
          price_triple_occupancy: '',
          price_four_occupancy: '',
          extra_mattress_price: '200'
        });
    setImagePreview('');
  };

  const handleRoomTypeFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setRoomTypeForm({ ...roomTypeForm, [e.target.name]: e.target.value });
  };

  const addImageField = () => {
    setRoomTypeForm(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImageField = (index: number) => {
    setRoomTypeForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const updateImage = (index: number, value: string) => {
    setRoomTypeForm(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    setRoomTypeForm(prev => {
      const newImages = [...prev.images];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return { ...prev, images: newImages };
    });
  };

  const validateImageUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setUploadingImage(imageIndex || 0);
      
      // For now, we'll just show a success message
      // In a real implementation, you would upload to a cloud service like Supabase Storage
      toast.success('File selected! Please enter the image URL manually.');
      
      // Clear the file input
      e.target.value = '';
    } catch (error) {
      toast.error('Failed to process file. Please try again.');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleAddRoomType = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!roomTypeForm.name.trim()) {
        toast.error('Room name is required');
        return;
      }
      
      if (!roomTypeForm.price_per_night.trim()) {
        toast.error('Price per night is required');
        return;
      }
      
      if (!roomTypeForm.max_occupancy.trim()) {
        toast.error('Max occupancy is required');
        return;
      }

      // Filter out empty image URLs and validate
      const validImages = roomTypeForm.images.filter(img => img.trim() && validateImageUrl(img));
      
      if (validImages.length === 0) {
        toast.error('At least one valid image URL is required');
        return;
      }

      const roomData = {
        name: roomTypeForm.name.trim(),
        description: roomTypeForm.description.trim(),
        price_per_night: parseFloat(roomTypeForm.price_per_night),
        max_occupancy: parseInt(roomTypeForm.max_occupancy),
        amenities: roomTypeForm.amenities.split('\n').filter(item => item.trim()),
        image_url: validImages[0], // Use first image as main image
        images: validImages, // Store all images
        is_active: roomTypeForm.is_active,
        is_available: true, // Set room as available when creating
        extra_guest_price: roomTypeForm.extra_guest_price ? parseFloat(roomTypeForm.extra_guest_price) : 0,
        accommodation_details: roomTypeForm.accommodation_details.trim(),
        floor: roomTypeForm.floor ? parseInt(roomTypeForm.floor) : undefined,
        room_number: `ROOM-${Date.now()}`, // Generate unique room number
        // Occupancy-based pricing
        price_double_occupancy: roomTypeForm.price_double_occupancy ? parseFloat(roomTypeForm.price_double_occupancy) : undefined,
        price_triple_occupancy: roomTypeForm.price_triple_occupancy ? parseFloat(roomTypeForm.price_triple_occupancy) : undefined,
        price_four_occupancy: roomTypeForm.price_four_occupancy ? parseFloat(roomTypeForm.price_four_occupancy) : undefined,
        extra_mattress_price: roomTypeForm.extra_mattress_price ? parseFloat(roomTypeForm.extra_mattress_price) : 200,
      };

      if (roomTypeModalMode === 'edit' && selectedRoomType) {
        await api.updateRoom(selectedRoomType.id, roomData);
        toast.success('Room updated successfully!');
      } else {
        console.log('Creating room with data:', roomData);
        const result = await api.createRoom(roomData);
        console.log('Room created successfully:', result);
        toast.success('Room added successfully!');
      }

      closeModal();
      await loadData();
    } catch (error) {
      console.error('Error saving room:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to save room: ${errorMessage}`);
      // Show more detailed error in console for debugging
      if (error && typeof error === 'object' && 'details' in error) {
        console.error('Error details:', error);
      }
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteRoom(roomId);
      toast.success('Room deleted successfully!');
      await loadData();
    } catch (error) {
      toast.error(`Failed to delete room: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleToggleRoomStatus = async (roomId: number, currentStatus: boolean) => {
    try {
      await api.updateRoom(roomId, { 
        is_active: !currentStatus,
        is_available: !currentStatus 
      });
      toast.success(`Room ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      await loadData(); // Reload the data
    } catch (error) {
      toast.error(`Failed to update room status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const openRoomTypeModal = async (mode: 'edit' | 'add' | 'view', roomType?: Room) => {
    try {
      
      // Set the modal mode first and wait for it to be set
      setRoomTypeModalMode(mode);
      
      // If switching from view to edit mode, we don't need to reload the form data
      if (mode === 'edit' && roomTypeModalMode === 'view' && selectedRoomType) {
        setIsModalOpen(true);
        return;
      }
      
      if (roomType) {
        setSelectedRoomType(roomType);
        
        // Safe conversion function
        const safeToString = (value: any): string => {
          if (value === null || value === undefined) return '';
          if (typeof value === 'number') return value.toString();
          if (typeof value === 'string') return value;
          return '';
        };
        
        setRoomTypeForm({
          name: roomType.name || '',
          description: roomType.description || '',
          price_per_night: safeToString(roomType.price_per_night),
          max_occupancy: safeToString(roomType.max_occupancy),
          amenities: Array.isArray(roomType.amenities) ? roomType.amenities.join('\n') : '',
          is_active: roomType.is_active ?? true,
          extra_guest_price: safeToString(roomType.extra_guest_price),
          accommodation_details: roomType.accommodation_details || '',
          image_url: roomType.image_url || '',
          images: Array.isArray(roomType.images) && roomType.images.length > 0 ? roomType.images : [''],
          floor: safeToString(roomType.floor),
          price_double_occupancy: safeToString(roomType.price_double_occupancy),
          price_triple_occupancy: safeToString(roomType.price_triple_occupancy),
          price_four_occupancy: safeToString(roomType.price_four_occupancy),
          extra_mattress_price: safeToString(roomType.extra_mattress_price) || '200'
        });

        // Load existing room images if editing
        if (roomType.images && roomType.images.length > 0) {
          // Images are now stored directly in the room data
        }
      } else {
        setSelectedRoomType(null);
        setRoomTypeForm({ 
          name: '', 
          description: '', 
          price_per_night: '', 
          max_occupancy: '', 
          amenities: '', 
          is_active: true, 
          extra_guest_price: '', 
          accommodation_details: '',
          image_url: '', 
          images: [''],
          floor: '',
          price_double_occupancy: '',
          price_triple_occupancy: '',
          price_four_occupancy: '',
          extra_mattress_price: '200'
        });
        setImagePreview('');
      }
      
      // Use setTimeout to ensure state updates are processed before opening modal
      setTimeout(() => {
        setIsModalOpen(true);
      }, 0);
      
    } catch (error) {
      toast.error('Error opening room details. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
            <button
              onClick={() => openRoomTypeModal('add')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add New Room
            </button>
          </div>

          {/* Check-in/Check-out Times */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Check-in & Check-out Times</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Time
                </label>
                <input
                  type="text"
                  value={globalTimes.check_in_time}
                  onChange={(e) => setGlobalTimes(prev => ({ ...prev, check_in_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="e.g., 1:00 PM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Time
                </label>
                <input
                  type="text"
                  value={globalTimes.check_out_time}
                  onChange={(e) => setGlobalTimes(prev => ({ ...prev, check_out_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="e.g., 10:00 AM"
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={async () => {
                  try {
                    // Save times to local storage or settings
                    localStorage.setItem('globalCheckInTime', globalTimes.check_in_time);
                    localStorage.setItem('globalCheckOutTime', globalTimes.check_out_time);
                    toast.success('Check-in/out times saved!');
                  } catch (error) {
                    toast.error('Failed to save times');
                  }
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Save Times
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price/Night
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Max Occupancy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Extra Guest Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Images
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roomTypes.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={room.image_url || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80'}
                              alt={room.name}
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{room.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{room.price_per_night?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {room.max_occupancy} guests
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{room.extra_guest_price?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          room.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {room.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {room.images?.length || 1} image{(room.images?.length || 1) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              openRoomTypeModal('view', room);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              openRoomTypeModal('edit', room);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleRoomStatus(room.id, room.is_active)}
                            className={`${
                              room.is_active 
                                ? 'text-red-600 hover:text-red-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {room.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => {
              e.stopPropagation();
            }}
            role="dialog"
            aria-modal="true"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {(() => {
                    let title = 'Room Details'; // Default
                    if (roomTypeModalMode === 'add') {
                      title = 'Add New Room';
                    } else if (roomTypeModalMode === 'edit') {
                      title = 'Edit Room';
                    } else if (roomTypeModalMode === 'view') {
                      title = 'View Room';
                    }
                    return title;
                  })()}
                </h2>
                                 <div className="flex items-center space-x-2">
                   <button
                     onClick={closeModal}
                     className="text-gray-400 hover:text-gray-600"
                   >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                   </button>
                 </div>
              </div>
            </div>

            <form 
              onSubmit={handleAddRoomType} 
              className="p-6 space-y-6"
            >
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={roomTypeForm.name}
                      onChange={handleRoomTypeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Enter room name"
                      required
                                             disabled={roomTypeModalMode === 'view'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={roomTypeForm.description}
                      onChange={handleRoomTypeFormChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Enter room description"
                      disabled={roomTypeModalMode === 'view'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price per Night *
                      </label>
                      <input
                        type="number"
                        name="price_per_night"
                        value={roomTypeForm.price_per_night}
                        onChange={handleRoomTypeFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="0"
                        disabled={roomTypeModalMode === 'view'}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Occupancy *
                      </label>
                      <input
                        type="number"
                        name="max_occupancy"
                        value={roomTypeForm.max_occupancy}
                        onChange={handleRoomTypeFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="2"
                        disabled={roomTypeModalMode === 'view'}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Extra Guest Price (Legacy)
                    </label>
                    <input
                      type="number"
                      name="extra_guest_price"
                      value={roomTypeForm.extra_guest_price}
                      onChange={handleRoomTypeFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="0"
                      disabled={roomTypeModalMode === 'view'}
                      min="0"
                    />
                    <p className="mt-1 text-xs text-gray-500">Deprecated - Use occupancy-based pricing below</p>
                  </div>

                  {/* Occupancy-Based Pricing */}
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Occupancy-Based Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Double Occupancy (2 guests)
                        </label>
                        <input
                          type="number"
                          name="price_double_occupancy"
                          value={roomTypeForm.price_double_occupancy}
                          onChange={handleRoomTypeFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="2500"
                          disabled={roomTypeModalMode === 'view'}
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Triple Occupancy (3 guests)
                        </label>
                        <input
                          type="number"
                          name="price_triple_occupancy"
                          value={roomTypeForm.price_triple_occupancy}
                          onChange={handleRoomTypeFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="2800"
                          disabled={roomTypeModalMode === 'view'}
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Extra Mattress Price (per mattress per night)
                      </label>
                      <input
                        type="number"
                        name="extra_mattress_price"
                        value={roomTypeForm.extra_mattress_price}
                        onChange={handleRoomTypeFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="200"
                        disabled={roomTypeModalMode === 'view'}
                        min="0"
                      />
                      <p className="mt-1 text-xs text-gray-500">Default: ₹200 per mattress per night</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Accommodation Details
                      </label>
                      <textarea
                        name="accommodation_details"
                        value={roomTypeForm.accommodation_details || ''}
                        onChange={handleRoomTypeFormChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="e.g., Accommodation: Extra Mattress for ₹200"
                        disabled={roomTypeModalMode === 'view'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Floor
                      </label>
                      <input
                        type="number"
                        name="floor"
                        value={roomTypeForm.floor}
                        onChange={handleRoomTypeFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="1"
                        disabled={roomTypeModalMode === 'view'}
                      />
                    </div>
                  </div>



                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amenities (one per line)
                    </label>
                    <textarea
                      name="amenities"
                      value={roomTypeForm.amenities}
                      onChange={handleRoomTypeFormChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Wi-Fi&#10;AC&#10;TV&#10;River View"
                      disabled={roomTypeModalMode === 'view'}
                    />
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={roomTypeForm.is_active}
                        onChange={(e) => setRoomTypeForm({ ...roomTypeForm, is_active: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={roomTypeModalMode === 'view'}
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                </div>

                {/* Image Management */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Room Images *
                    </label>
                    {roomTypeModalMode !== 'view' && (
                      <button
                        type="button"
                        onClick={addImageField}
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      >
                        Add Image
                      </button>
                    )}
                  </div>
                  
                  {/* Image URL Fields */}
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 mb-2">
                      {roomTypeForm.images.filter(img => img.trim()).length} valid image(s) ready to save
                    </div>
                    {roomTypeForm.images.map((image, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs text-gray-500">Image {index + 1}</span>
                            {image.trim() && validateImageUrl(image) && (
                              <span className="text-xs text-green-600">✓ Valid</span>
                            )}
                            {roomTypeModalMode !== 'view' && index > 0 && (
                              <button
                                type="button"
                                onClick={() => moveImage(index, index - 1)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                ↑
                              </button>
                            )}
                            {roomTypeModalMode !== 'view' && index < roomTypeForm.images.length - 1 && (
                              <button
                                type="button"
                                onClick={() => moveImage(index, index + 1)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                ↓
                              </button>
                            )}
                          </div>
                          <input
                            type="url"
                            value={image}
                            onChange={(e) => updateImage(index, e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                              image.trim() && !validateImageUrl(image) 
                                ? 'border-red-300 focus:ring-red-500' 
                                : image.trim() && validateImageUrl(image)
                                ? 'border-green-300 focus:ring-green-500'
                                : 'border-gray-300'
                            }`}
                            placeholder="https://example.com/image.jpg"
                            disabled={roomTypeModalMode === 'view'}
                          />
                          {image.trim() && !validateImageUrl(image) && (
                            <p className="text-xs text-red-500 mt-1">Please enter a valid URL</p>
                          )}
                        </div>
                        {roomTypeModalMode !== 'view' && roomTypeForm.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageField(index)}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Primary Image Preview:</label>
                      <div className="w-full bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-auto max-h-64 object-contain cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => window.open(imagePreview, '_blank')}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80';
                          }}
                        />
                        <div className="text-center py-1 text-xs text-gray-500 bg-gray-100">
                          Click to view full size
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* All Images Preview */}
                  {roomTypeForm.images.filter(img => img.trim()).length > 1 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">All Images Preview:</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {roomTypeForm.images.filter(img => img.trim()).map((image, index) => (
                          <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden group">
                            <img
                              src={image}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                              onClick={() => window.open(image, '_blank')}
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80';
                              }}
                            />
                                                       <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center pointer-events-none">
                             <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                               Click to view
                             </span>
                           </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-center mt-2 text-xs text-gray-500">
                        Click any image to view full size
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                {roomTypeModalMode === 'view' && (
                  <button
                    type="button"
                    onClick={() => {
                      setRoomTypeModalMode('edit');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit Room
                  </button>
                )}
                {roomTypeModalMode !== 'view' && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {roomTypeModalMode === 'edit' ? 'Update Room' : 'Add Room'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminRooms; 
