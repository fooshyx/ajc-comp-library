"use client"

import { useState, useEffect } from "react"
import { User } from "@/db/schema"

interface NewUser {
  username: string
  email: string
  password: string
  isAdmin: boolean
}

export default function UsersManager() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<NewUser>({
    username: "",
    email: "",
    password: "",
    isAdmin: false
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingUser ? "/api/users" : "/api/users"
      const method = editingUser ? "PUT" : "POST"
      const body = editingUser 
        ? { ...formData, id: editingUser.id }
        : formData

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        await fetchUsers()
        resetForm()
        alert(editingUser ? "User updated successfully!" : "User created successfully!")
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error saving user:", error)
      alert("Failed to save user")
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      password: "", // Don't pre-fill password
      isAdmin: user.isAdmin
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const response = await fetch(`/api/users?id=${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        await fetchUsers()
        alert("User deleted successfully!")
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Failed to delete user")
    }
  }

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      isAdmin: false
    })
    setEditingUser(null)
    setShowForm(false)
  }

  if (loading) {
    return <div className="p-4">Loading users...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add User
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-medium">
            {editingUser ? "Edit User" : "Add New User"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {editingUser && "(leave blank to keep current)"}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required={!editingUser}
                minLength={6}
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isAdmin}
                  onChange={(e) => setFormData(prev => ({ ...prev, isAdmin: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Admin User</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {editingUser ? "Update User" : "Create User"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.isAdmin 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found. Create your first user above.
          </div>
        )}
      </div>
    </div>
  )
}