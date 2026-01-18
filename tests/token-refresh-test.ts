/**
 * 令牌刷新功能手动测试方案
 * 
 * 作者: 测试助手
 * 日期: 2024年
 * 
 * 这个文件包含了手动测试刷新令牌功能的步骤和脚本
 */

import axios from 'axios'

// 配置
const API_BASE_URL = 'http://localhost:3001/api/v1' // 修改为你的后端端口

/**
 * 测试场景 1: 手动刷新令牌
 */
async function testTokenRefresh() {
  console.log('\n=== 测试场景1: 手动刷新令牌 ===')
  
  try {
    // 1. 先登录获取初始token
    console.log('1. 登录获取初始令牌...')
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com', // 替换为测试账号
      password: 'password'        // 替换为测试密码
    })
    
    console.log('登录成功:', loginResponse.data)
    const { accessToken, refreshToken } = loginResponse.data.data || loginResponse.data
    
    // 2. 使用refresh token手动刷新
    console.log('2. 使用refresh token刷新...')
    const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken: refreshToken
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('刷新令牌成功:', refreshResponse.data)
    
    // 3. 验证新token可以正常使用
    const newAccessToken = refreshResponse.data.data.accessToken || refreshResponse.data.accessToken
    console.log('3. 验证新token...')
    const validateResponse = await axios.get(`${API_BASE_URL}/auth/validate`, {
      headers: {
        'Authorization': `Bearer ${newAccessToken}`
      }
    })
    
    console.log('令牌验证成功:', validateResponse.data)
    
  } catch (error) {
    console.error('测试失败:', (error as any)?.response?.data || (error as any)?.message || error)
  }
}

/**
 * 测试场景 2: 模拟令牌过期并自动刷新
 */
async function testAutoRefresh() {
  console.log('\n=== 测试场景2: 模拟令牌过期的自动刷新 ===')
  
  try {
    // 1. 登录获取token
    console.log('1. 登录获取令牌...')
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password'
    })
    
    const { accessToken, refreshToken } = loginResponse.data.data || loginResponse.data
    console.log('获取到令牌')
    
    // 2. 使用一个无效的token模拟401错误
    console.log('2. 使用无效token请求...')
    try {
      await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      })
    } catch (error) {
      if ((error as any)?.response?.status === 401) {
        console.log('✓ 成功触发401错误')
      }
    }
    
    // 3. 使用有效的refresh token尝试刷新
    console.log('3. 尝试刷新令牌...')
    const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken: refreshToken
    })
    
    console.log('刷新成功:', refreshResponse.data)
    
  } catch (error) {
    console.error('自动刷新测试失败:', (error as any)?.response?.data || (error as any)?.message || error)
  }
}

/**
 * 测试场景 3: 令牌过期时间测试
 */
async function testTokenExpiration() {
  console.log('\n=== 测试场景3: 令牌过期时间 ===')
  
  try {
    // 1. 登录
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password'
    })
    
    const data = loginResponse.data.data || loginResponse.data
    const { accessToken, expiresIn } = data
    
    console.log('Access Token 过期时间:', expiresIn, '秒')
    
    // 解析JWT获取实际的过期时间
    const tokenParts = accessToken.split('.')
    if (tokenParts.length === 3) {
      const payload = JSON.parse(atob(tokenParts[1]))
      const exp = new Date(payload.exp * 1000)
      const iat = new Date(payload.iat * 1000)
      
      console.log('令牌签发时间:', iat.toLocaleString())
      console.log('令牌过期时间:', exp.toLocaleString())
      console.log('有效期:', (payload.exp - payload.iat) / 60, '分钟')
    }
    
  } catch (error) {
    console.error('过期时间测试失败:', (error as any)?.response?.data || (error as any)?.message || error)
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('开始令牌刷新功能测试...')
  
  // await testTokenRefresh()
  // await testAutoRefresh()
  await testTokenExpiration()
  
  console.log('\n所有测试完成！')
}

// 导出供外部使用
export {
  runAllTests,
  testTokenRefresh,
  testAutoRefresh,
  testTokenExpiration
}

// 如果直接运行此文件
if (require.main === module) {
  runAllTests().catch(console.error)
}