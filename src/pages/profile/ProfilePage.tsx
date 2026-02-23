import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { profileApi } from '../../api/profile.api'
import type { ApiError } from '../../types/dto'
import { useAuth } from '../../auth/useAuth'
import PageHeader from '../../components/PageHeader'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import Spinner from '../../components/Spinner'

interface ProfileFormState {
  name: string
  username: string
  fullName: string
  phone: string
  avatarUrl: string
  bio: string
}

const defaultForm: ProfileFormState = {
  name: '',
  username: '',
  fullName: '',
  phone: '',
  avatarUrl: '',
  bio: '',
}

const ProfilePage = () => {
  const { refreshMe } = useAuth()
  const [form, setForm] = useState<ProfileFormState>(defaultForm)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
  })

  useEffect(() => {
    if (!data) return
    setForm({
      name: data.name ?? '',
      username: data.username ?? '',
      fullName: data.fullName ?? '',
      phone: data.phone ?? '',
      avatarUrl: data.avatarUrl ?? '',
      bio: data.bio ?? '',
    })
  }, [data])

  const updateProfileMutation = useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: async () => {
      setProfileMessage('Profile updated successfully.')
      await refreshMe()
      void refetch()
    },
    onError: (mutationError: unknown) => {
      const message = (mutationError as { response?: { data?: ApiError } })?.response
        ?.data?.message
      setProfileMessage(message ?? 'Failed to update profile.')
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: () => {
      setPasswordMessage('Password changed successfully.')
      setPasswordError(null)
      setCurrentPassword('')
      setNewPassword('')
    },
    onError: (mutationError: unknown) => {
      const message = (mutationError as { response?: { data?: ApiError } })?.response
        ?.data?.message
      setPasswordMessage(null)
      setPasswordError(message ?? 'Failed to change password.')
    },
  })

  const errorMessage = (error as { response?: { data?: ApiError } } | null)?.response
    ?.data?.message

  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileMessage(null)

    updateProfileMutation.mutate({
      name: form.name.trim() || undefined,
      username: form.username.trim() || undefined,
      fullName: form.fullName.trim() || undefined,
      phone: form.phone.trim() || undefined,
      avatarUrl: form.avatarUrl.trim() || undefined,
      bio: form.bio.trim() || undefined,
    })
  }

  const submitPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordMessage(null)
    setPasswordError(null)

    if (!currentPassword || !newPassword) {
      setPasswordError('Both current and new password are required.')
      return
    }

    changePasswordMutation.mutate({ currentPassword, newPassword })
  }

  return (
    <div className="space-y-8">
      <PageHeader title="My Profile" subtitle="Manage your profile information." />

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner />
        </div>
      ) : isError ? (
        <div className="space-y-3">
          <Alert message={errorMessage ?? 'Failed to load profile.'} tone="error" />
          <Button variant="secondary" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Profile Details</h2>
            {profileMessage ? <Alert message={profileMessage} tone="info" /> : null}
            <form className="space-y-4" onSubmit={submitProfile}>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
                <Input
                  label="Username"
                  value={form.username}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, username: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Full Name"
                  value={form.fullName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, fullName: event.target.value }))
                  }
                />
                <Input
                  label="Phone"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
              </div>
              <Input label="Email" value={data?.email ?? ''} disabled />
              <Input
                label="Avatar URL"
                value={form.avatarUrl}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, avatarUrl: event.target.value }))
                }
              />
              <label className="block text-sm text-slate-800">
                <span className="mb-1 block font-semibold">Bio</span>
                <textarea
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={form.bio}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, bio: event.target.value }))
                  }
                />
              </label>
              <Button type="submit" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Security</h2>
            {passwordMessage ? <Alert message={passwordMessage} tone="info" /> : null}
            {passwordError ? <Alert message={passwordError} tone="error" /> : null}
            <form className="space-y-4" onSubmit={submitPassword}>
              <Input
                type="password"
                label="Current Password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
              <Input
                type="password"
                label="New Password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
              <Button type="submit" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending ? 'Updating...' : 'Change Password'}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ProfilePage
