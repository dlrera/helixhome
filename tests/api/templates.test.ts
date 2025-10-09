/**
 * API Tests for Template Management Endpoints
 * Tests all template-related API routes for proper functionality
 */

import { describe, it, expect, beforeAll } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

describe('Template API Endpoints', () => {
  let authToken: string

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await fetch(`${BASE_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    })
    const data = await loginResponse.json()
    authToken = data.token
  })

  describe('GET /api/templates', () => {
    it('should return paginated list of templates', async () => {
      const response = await fetch(`${BASE_URL}/api/templates`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.templates).toBeDefined()
      expect(Array.isArray(data.templates)).toBe(true)
      expect(data.templates.length).toBeGreaterThan(0)
      expect(data.templates.length).toBeLessThanOrEqual(20)
    })

    it('should filter templates by category', async () => {
      const response = await fetch(`${BASE_URL}/api/templates?category=HVAC`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      data.templates.forEach((template: any) => {
        expect(template.category).toBe('HVAC')
      })
    })

    it('should filter templates by difficulty', async () => {
      const response = await fetch(`${BASE_URL}/api/templates?difficulty=EASY`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      data.templates.forEach((template: any) => {
        expect(template.difficulty).toBe('EASY')
      })
    })

    it('should search templates by name', async () => {
      const response = await fetch(`${BASE_URL}/api/templates?search=filter`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.templates.length).toBeGreaterThan(0)
      data.templates.forEach((template: any) => {
        expect(template.name.toLowerCase()).toContain('filter')
      })
    })

    it('should return 401 without authentication', async () => {
      const response = await fetch(`${BASE_URL}/api/templates`)
      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/templates/[id]', () => {
    let templateId: string

    beforeAll(async () => {
      const response = await fetch(`${BASE_URL}/api/templates`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      const data = await response.json()
      templateId = data.templates[0].id
    })

    it('should return single template with full details', async () => {
      const response = await fetch(`${BASE_URL}/api/templates/${templateId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })

      expect(response.status).toBe(200)
      const template = await response.json()
      expect(template.id).toBe(templateId)
      expect(template.name).toBeDefined()
      expect(template.description).toBeDefined()
      expect(template.instructions).toBeDefined()
    })

    it('should return 404 for non-existent template', async () => {
      const response = await fetch(`${BASE_URL}/api/templates/non-existent-id`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })

      expect(response.status).toBe(404)
    })
  })

  describe('GET /api/templates/suggestions', () => {
    let assetId: string

    beforeAll(async () => {
      // Fetch an asset to use for suggestions
      const response = await fetch(`${BASE_URL}/api/assets`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      const data = await response.json()
      if (data.assets && data.assets.length > 0) {
        assetId = data.assets[0].id
      }
    })

    it('should return template suggestions for an asset', async () => {
      if (!assetId) {
        console.log('No assets available for testing suggestions')
        return
      }

      const response = await fetch(`${BASE_URL}/api/templates/suggestions?assetId=${assetId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })

      expect(response.status).toBe(200)
      const suggestions = await response.json()
      expect(Array.isArray(suggestions)).toBe(true)
      expect(suggestions.length).toBeLessThanOrEqual(5)
    })

    it('should return 404 for non-existent asset', async () => {
      const response = await fetch(`${BASE_URL}/api/templates/suggestions?assetId=non-existent`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })

      expect(response.status).toBe(404)
    })
  })

  describe('POST /api/templates/apply', () => {
    let templateId: string
    let assetId: string

    beforeAll(async () => {
      // Get a template and asset for testing
      const templatesResponse = await fetch(`${BASE_URL}/api/templates`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      const templatesData = await templatesResponse.json()
      templateId = templatesData.templates[0].id

      const assetsResponse = await fetch(`${BASE_URL}/api/assets`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      const assetsData = await assetsResponse.json()
      if (assetsData.assets && assetsData.assets.length > 0) {
        assetId = assetsData.assets[0].id
      }
    })

    it('should apply template to asset successfully', async () => {
      if (!assetId) {
        console.log('No assets available for testing application')
        return
      }

      const response = await fetch(`${BASE_URL}/api/templates/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId,
          assetId,
          frequency: 'MONTHLY'
        })
      })

      const data = await response.json()

      if (response.status === 409) {
        // Template already applied
        expect(data.error).toContain('already applied')
      } else {
        expect(response.status).toBe(201)
        expect(data.schedule).toBeDefined()
        expect(data.task).toBeDefined()
      }
    })

    it('should reject invalid frequency', async () => {
      if (!assetId) return

      const response = await fetch(`${BASE_URL}/api/templates/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId,
          assetId,
          frequency: 'INVALID'
        })
      })

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/schedules', () => {
    it('should return user schedules', async () => {
      const response = await fetch(`${BASE_URL}/api/schedules`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.schedules).toBeDefined()
      expect(Array.isArray(data.schedules)).toBe(true)
      expect(data.pagination).toBeDefined()
    })

    it('should include inactive schedules when requested', async () => {
      const response = await fetch(`${BASE_URL}/api/schedules?includeInactive=true`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.schedules).toBeDefined()
    })

    it('should filter schedules by asset', async () => {
      const assetsResponse = await fetch(`${BASE_URL}/api/assets`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      const assetsData = await assetsResponse.json()

      if (assetsData.assets && assetsData.assets.length > 0) {
        const assetId = assetsData.assets[0].id
        const response = await fetch(`${BASE_URL}/api/schedules?assetId=${assetId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })

        expect(response.status).toBe(200)
        const data = await response.json()
        data.schedules.forEach((schedule: any) => {
          expect(schedule.assetId).toBe(assetId)
        })
      }
    })
  })

  describe('PUT /api/schedules/[id]', () => {
    let scheduleId: string

    beforeAll(async () => {
      const response = await fetch(`${BASE_URL}/api/schedules?includeInactive=true`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      const data = await response.json()
      if (data.schedules && data.schedules.length > 0) {
        scheduleId = data.schedules[0].id
      }
    })

    it('should update schedule frequency', async () => {
      if (!scheduleId) {
        console.log('No schedules available for testing updates')
        return
      }

      const response = await fetch(`${BASE_URL}/api/schedules/${scheduleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          frequency: 'QUARTERLY'
        })
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.schedule.frequency).toBe('QUARTERLY')
    })

    it('should toggle schedule active status', async () => {
      if (!scheduleId) return

      // Get current status
      const getResponse = await fetch(`${BASE_URL}/api/schedules?includeInactive=true`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      const getData = await getResponse.json()
      const schedule = getData.schedules.find((s: any) => s.id === scheduleId)
      const currentStatus = schedule.isActive

      // Toggle status
      const response = await fetch(`${BASE_URL}/api/schedules/${scheduleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.schedule.isActive).toBe(!currentStatus)
    })
  })

  describe('DELETE /api/schedules/[id]', () => {
    let scheduleId: string

    beforeAll(async () => {
      const response = await fetch(`${BASE_URL}/api/schedules?includeInactive=true`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
      const data = await response.json()
      if (data.schedules && data.schedules.length > 0) {
        scheduleId = data.schedules[0].id
      }
    })

    it('should soft delete schedule', async () => {
      if (!scheduleId) {
        console.log('No schedules available for testing deletion')
        return
      }

      const response = await fetch(`${BASE_URL}/api/schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toContain('deleted')
    })
  })
})