### CORE_MESSAGE

信息显示处理接口，由生物对象继承使用。

核心方法：

```c
void receive_message(string type, string str)
varargs nomask void more(string arg, int flag)
nomask varargs void more_file(string file, int start_line, int flag, string extra);
```
