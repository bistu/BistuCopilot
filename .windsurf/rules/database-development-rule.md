---
trigger: always_on
description: 数据库开发规范
globs:
---
# 数据库开发规范 v2.0

本文档规定了项目中数据库相关开发的规范和流程，确保数据库结构的一致性和可维护性。

## 参考文档

- **主要参考文档**: `/docs/DATABASE-DESIGN.md` - 包含完整的数据库设计，表结构，关系和设计原则
- **API密钥管理**: `/README-API-KEY-MANAGEMENT.md` - 专门介绍API密钥管理系统的实现
- **使用示例文档**: `/lib/db/usage-examples.md` - 新数据服务架构的使用示例和最佳实践

## 🏗️ 新架构：统一数据服务

### 核心设计理念

1. **分层架构设计**:
   ```
   UI Components (React)
          ↓
   Custom Hooks (use-*)
          ↓
   Database Functions (lib/db/*)
          ↓
   Data Services (lib/services/*)
          ↓
   Supabase Client
   ```

2. **统一Result类型系统**:
   - 所有数据库操作返回 `Result<T>` 类型
   - 强制错误处理，提升类型安全
   - 消除null/undefined混乱

3. **智能缓存策略**:
   - TTL机制 + 模式匹配清理
   - 自动内存管理和统计监控
   - 缓存键统一命名规范

### 核心服务组件

#### 1. Result类型系统 (`lib/types/result.ts`)
```typescript
type Result<T> = 
  | { success: true; data: T; error?: undefined }
  | { success: false; error: Error; data?: undefined }

// 使用示例
const result = await getUserProfile(userId);
if (result.success) {
  console.log(result.data.full_name); // 类型安全
} else {
  console.error(result.error.message); // 强制错误处理
}
```

#### 2. 缓存服务 (`lib/services/db/cache-service.ts`)
- **TTL缓存管理**: 自动过期清理
- **模式匹配清理**: `clearByPattern('user:*')`
- **内存统计**: 实时监控缓存使用情况
- **批量操作**: 高效的缓存管理

#### 3. 实时订阅服务 (`lib/services/db/realtime-service.ts`)
- **防重复订阅**: 自动去重，避免内存泄漏
- **共享订阅**: 多组件共享同一订阅
- **自动清理**: 组件卸载时自动清理
- **错误恢复**: 网络断开重连机制

#### 4. 统一数据服务 (`lib/services/db/data-service.ts`)
- **通用CRUD**: 标准化的增删改查操作
- **集成缓存**: 自动缓存和失效策略
- **重试机制**: 网络异常时自动重试
- **错误分类**: 智能的错误类型识别

#### 5. 消息服务 (`lib/services/db/message-service.ts`)
- **游标分页**: 高性能的分页实现
- **批量操作**: 减少数据库往返次数
- **智能排序**: 数据库级排序优化
- **重复检测**: 防止重复消息

## 数据库使用规范

### 1. 新版接口使用

**优先使用新版Result类型接口**:
```typescript
// ✅ 推荐：新版接口
const result = await getUserProfileById(userId);
if (result.success) {
  const profile = result.data;
  // 处理成功情况
} else {
  console.error('获取用户资料失败:', result.error);
  // 处理错误情况
}

// ❌ 避免：直接Supabase调用
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

**Legacy兼容接口**:
```typescript
// 兼容旧代码，但建议迁移到新接口
const profile = await getUserProfileByIdLegacy(userId);
if (profile) {
  // 处理数据
}
```

### 2. 缓存使用规范

**统一缓存键命名**:
```typescript
// 使用预定义的缓存键
import { CacheKeys } from '@lib/services/db/cache-service';

// ✅ 正确使用
await cacheService.set(CacheKeys.user(userId), profileData);

// ❌ 避免硬编码
await cacheService.set(`user_${userId}`, profileData);
```

**智能缓存清理**:
```typescript
// 模式匹配清理
await cacheService.clearByPattern('user:*');

// 精确清理
await cacheService.delete(CacheKeys.user(userId));
```

### 3. 实时订阅规范

**使用统一订阅管理**:
```typescript
// ✅ 推荐：使用订阅服务
const subscription = await realtimeService.subscribe(
  SubscriptionKeys.conversations(userId),
  SubscriptionConfigs.conversations,
  (payload) => {
    // 处理实时更新
  }
);

// 组件卸载时自动清理
useEffect(() => {
  return () => subscription?.unsubscribe();
}, []);
```

### 4. 错误处理规范

**统一错误处理**:
```typescript
// 使用自定义错误类型
import { DatabaseError, NetworkError, ValidationError } from '@lib/types/result';

try {
  const result = await someDataBaseOperation();
  if (!result.success) {
    if (result.error instanceof ValidationError) {
      // 处理验证错误
    } else if (result.error instanceof NetworkError) {
      // 处理网络错误  
    } else if (result.error instanceof DatabaseError) {
      // 处理数据库错误
    }
  }
} catch (error) {
  // 处理未预期错误
}
```

### 5. 性能优化规范

**分页查询优化**:
```typescript
// ✅ 推荐：游标分页
const messagesPage = await messageService.getMessagePage(
  conversationId,
  cursor,
  limit
);

// ❌ 避免：offset分页（性能差）
const { data } = await supabase
  .from('messages')
  .select('*')
  .range(offset, offset + limit);
```

**批量操作优化**:
```typescript
// ✅ 推荐：批量操作
const result = await messageService.batchCreateMessages(messages);

// ❌ 避免：循环单条操作
for (const message of messages) {
  await createMessage(message);
}
```

## 数据库结构修改流程

### 1. 迁移文件创建
- 迁移文件命名格式: `YYYYMMDDHHMMSS_描述.sql`
- 放置在 `/supabase/migrations/` 目录下
- 每个迁移文件必须是幂等的

### 2. 服务层更新
创建新表后必须更新对应的服务层：

```typescript
// 1. 在 data-service.ts 中添加新表支持
// 2. 在相应的 lib/db/ 文件中添加接口函数
// 3. 更新 lib/db/index.ts 导出
// 4. 添加缓存键定义
// 5. 配置实时订阅（如需要）
```

### 3. 类型定义更新
- 更新 `lib/types/database.ts` 中的类型定义
- 确保前端和后端使用一致的类型
- 不要使用 `any` 类型绕过类型检查

## 安全规范

### 1. 行级安全性(RLS)
- 所有表必须启用RLS
- 按照最小权限原则设计安全策略
- 测试不同角色用户的访问权限

### 2. 敏感数据处理
- API密钥等敏感信息必须加密存储
- 使用 `lib/utils/encryption.ts` 中的加密/解密函数
- 不要在日志中记录敏感信息

### 3. 数据访问控制
```typescript
// ✅ 正确：通过数据服务访问
const result = await dataService.findOne('profiles', { id: userId });

// ❌ 错误：绕过安全层直接访问
const { data } = await supabase.from('profiles').select('*');
```

## 前端组件集成规范

### 1. Hooks使用
**正确的数据获取方式**:
```typescript
// 使用优化后的hooks
const { profile, isLoading, error } = useProfile(userId);

// 在组件中正确处理状态
if (isLoading) return <LoadingSkeleton />;
if (error) return <ErrorMessage error={error} />;
if (!profile) return <NoDataMessage />;

return <ProfileDisplay profile={profile} />;
```

### 2. 缓存策略
**避免UI闪烁**:
```typescript
// ✅ 推荐：智能缓存显示
const [prevData, setPrevData] = useState([]);
const [hasEverLoaded, setHasEverLoaded] = useState(false);

const displayData = useMemo(() => {
  if (isLoading && data.length === 0 && prevData.length > 0) {
    return prevData; // 显示缓存数据，避免闪烁
  }
  return data;
}, [isLoading, data, prevData]);

const showSkeleton = isLoading && 
                   data.length === 0 && 
                   prevData.length === 0 && 
                   !hasEverLoaded;
```

### 3. 错误边界
```typescript
// 在关键组件中添加错误边界
<ErrorBoundary fallback={<ErrorFallback />}>
  <DataComponent />
</ErrorBoundary>
```

## 测试规范

### 1. 单元测试
```typescript
// 测试Result类型返回
test('should return success result', async () => {
  const result = await getUserProfile(validUserId);
  expect(result.success).toBe(true);
  expect(result.data).toBeDefined();
  expect(result.error).toBeUndefined();
});

test('should return error result', async () => {
  const result = await getUserProfile(invalidUserId);
  expect(result.success).toBe(false);
  expect(result.error).toBeInstanceOf(Error);
  expect(result.data).toBeUndefined();
});
```

### 2. 集成测试
- 测试完整的数据流
- 验证缓存行为
- 测试实时订阅功能

## 监控和调试

### 1. 性能监控
```typescript
// 使用内置的性能统计
const stats = cacheService.getStats();
console.log('缓存命中率:', stats.hitRate);
console.log('内存使用:', stats.memoryUsage);
```

### 2. 调试工具
```typescript
// 开发环境调试
if (process.env.NODE_ENV === 'development') {
  console.log('数据服务统计:', dataService.getDebugInfo());
  console.log('实时订阅状态:', realtimeService.getSubscriptions());
}
```

## 迁移指南

### 从旧版本迁移
1. **逐步迁移策略**: 先使用Legacy接口保持兼容，再逐步迁移到新接口
2. **优先级排序**: 先迁移核心功能，再迁移边缘功能  
3. **测试验证**: 每次迁移后进行充分测试

### 常见迁移模式
```typescript
// 迁移前
const profile = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// 迁移后
const result = await getCurrentUserProfile();
if (result.success) {
  const profile = result.data;
}
```

## 最佳实践总结

1. **统一接口**: 始终使用统一的数据服务接口
2. **错误处理**: 强制使用Result类型处理错误
3. **性能优化**: 利用缓存和分页提升性能
4. **类型安全**: 严格的TypeScript类型检查
5. **实时更新**: 合理使用实时订阅功能
6. **安全第一**: 遵循RLS和加密存储规范
7. **用户体验**: 避免UI闪烁，提供流畅体验

## 数据库触发器和自动化功能

### 触发器管理规范

系统使用多个触发器实现自动化功能，开发时需要注意：

1. **用户管理触发器**：
   - `handle_new_user`: 处理用户注册，自动创建profiles
   - `handle_user_deletion_prep`: 处理用户删除前的权限转移
   - 修改用户相关逻辑时需要考虑触发器影响

2. **组织管理触发器**：
   - `handle_org_member_deletion`: 自动清理孤儿组织
   - `validate_org_member_operations`: 验证组织操作合法性
   - 组织相关操作需要遵循触发器逻辑

3. **消息管理触发器**：
   - `set_message_synced_on_update`: 维护消息同步状态
   - `update_conversation_last_message_preview`: 自动更新对话预览
   - 消息操作会自动触发相关更新，无需手动维护

### 数据清理和维护

定期执行数据清理：

```sql
-- 检查孤儿数据（dry run）
SELECT * FROM safe_cleanup_orphan_data(true);

-- 执行实际清理
SELECT * FROM safe_cleanup_orphan_data(false);
```

### RLS 策略更新

最新的RLS策略支持：
- 管理员完全访问权限
- 服务端API路由读取权限
- 普通用户适当的读取权限

开发API路由时可以依赖这些策略进行数据访问。

## 后续发展规划

### 短期目标
- 完善监控和调试工具
- 添加更多性能优化策略
- 扩展缓存策略配置
- 优化触发器性能和错误处理

### 中期目标  
- 实现数据库分区策略
- 添加读写分离支持
- 完善自动故障恢复
- 建立完整的数据审计体系

### 长期目标
- 考虑引入NoSQL存储
- 实现智能数据预加载
- 建设完整的数据治理体系
- 实现自动化的数据库优化
