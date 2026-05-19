import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatError(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  if (error?.message) {
    return error.message
  }
  return 'An error occurred'
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString()
}
