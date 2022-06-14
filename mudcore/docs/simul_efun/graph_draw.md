
绘图处理，用于玩家HP等状态条。

### 核心方法

```c
varargs string graph_draw(int cur, int max, int fc, int bc, int length)
```

> 参数说明

    cur     当前值
    max     最大值
    fc      前景颜色
    bc      背景颜色
    length  图形长度，默认值 40

> 颜色列表

    0 无    1 红    2 绿    3 青    4 蓝    5 黄    6 紫    7 白
