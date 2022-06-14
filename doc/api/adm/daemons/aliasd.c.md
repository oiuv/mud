## 说明

    指令别名守护进程

## 继承

    无


## 属性

    mapping global_alias;

## 方法

### process_global_alias

    string process_global_alias(string arg);

### 描述

    此方法由 `process_input` 调用，返回字符串 arg 对应的指令，如果没有别名，返回 arg。
