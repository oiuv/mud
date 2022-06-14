### CORE_CHINESE_D

中文系统守护进程，根据存档查找中文翻译，数据存档文件为 `/data/e2c_dict.o`。

### 核心方法

```c
// 根据存档字典查找对应中文名称，该方法有同名模拟外部函数，可直接使用。
string chinese(string str);

// 转换数字为中文表述，如：12345转换为一万二千三百四十五，该方法有同名模拟外部函数。
string chinese_number(int i);

// 移除字典中的指定翻译
void remove_translate(string key);

// 增加翻译到字典
void add_translate(string key, string chn);

// 导出字典
void dump_translate();
```

如果不需要框架提供的守护进程，可以自己定以 `CHINESE_D` 继承或覆盖。
