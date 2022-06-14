### CORE_COMBAT_D

`COMBAT_D`战斗守护进程，处理具体的战斗行为方式。

### 核心方法

```c
// 战斗控制
void fight(object me, object victim);
```

战斗守护进程需要开发者自己实现，直接定义自己的 `COMBAT_D` 守护进程并至少实现核心方法 `fight()`。
