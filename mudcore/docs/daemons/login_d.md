### CORE_LOGIN_D

`LOGIN_D` 玩家登陆守护进程。

### 核心方法

```c
protected void welcome(object ob);
protected void get_encoding(string arg, object ob);
protected void get_id(string arg, object ob);
protected void get_passwd(string pass, object ob);
protected void check_ok(object ob);
protected void confirm_id(string yn, object ob);
protected void get_name(string arg, object ob);
protected void new_password(string pass, object ob);
protected void confirm_password(string pass, object ob);
protected void get_gender(string gender, object ob);
protected void init_new_player(object user);
object make_body(object ob);
void login(object ob);
void enter_world(object ob, object user);
void reconnect(object ob, object user);
```

开发者可以继承并重写相应模块。
