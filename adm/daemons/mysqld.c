inherit F_DATABASE;
// 调用连接对象更新bbs.mud.ren网站账号
varargs mixed update(object ob, string host, string db, string user)
{
#ifdef __PACKAGE_DB__
    if (objectp(ob) && ob->query("id") && ob->query("password"))
    {
        if (stringp(host) && stringp(db) && stringp(user))
        {
            database::setConnection(([
                "host":host,
                "database":db,
                "user":user,
            ]));
        }

        return database::table("users")->where("username", ob->query("id"))->update(([
            "password":ob->query("password"),
            "phone":ob->query("phone"), ]));
    }
#else
    debug("注意：数据库功能被禁用。");
    return 0;
#endif
}
// 调用玩家连线对象注册bbs.mud.ren网站账号
varargs int register(object ob, string host, string db, string user)
{
#ifdef __PACKAGE_DB__
    if (objectp(ob) && ob->query("id") && ob->query("password"))
    {
        mixed res;

        if (stringp(host) && stringp(db) && stringp(user))
        {
            database::setConnection(([
                "host":host,
                "database":db,
                "user":user,
            ]));
        }

        if (database::table("users")->where("username", ob->query("id"))->count())
        {
            return 0;
        }

        res = database::table("users")->insert(([
            "username":ob->query("id"),
            "name":ob->query("surname") + ob->query("purename"),
            "email":ob->query("id") + "@mud.ren",
            "phone":ob->query("phone"),
            "password":ob->query("password"),
            "activated_at":log_time(),
            "created_at":log_time(),
        ]));
        /* error */
        if (stringp(res))
        {
            debug(res);
            return 0;
        }
        else
        {
            debug("提示：系统已自动在bbs.mud.ren注册账号，你可以使用游戏账号和密码登录社区。");
            return 1;
        }
    }
#else
    debug("注意：数据库功能被禁用，无法注册论坛账号。");
    return 0;
#endif
}
/*
varargs void register(object ob, string host, string db, string user)
{
#ifdef __PACKAGE_DB__
    if (objectp(ob) && ob->query("id") && ob->query("password"))
    {
        mixed handle, rows;
        string values;

        values = "'" + ob->query("id") + "','" + ob->query("surname") + ob->query("purename") + "','" + ob->query("id") + "@mud.ren','" + ob->query("password") + "','" + log_time() + "','" + log_time() + "'";

        if (stringp(host) && stringp(db) && stringp(user))
        {
            handle = db_connect(host, db, user);
        }
        else
        {
            handle = db_connect("127.0.0.1", "mud_ren", "root");
        }

        if (stringp(handle))
            debug_message("数据库连接失败：" + handle);
        else
        {
            db_exec(handle, "set names utf8"); // 防止乱码
            rows = db_exec(handle, "SELECT * FROM users where username='" + ob->query("id") + "'");
            if (!rows)
            {
                db_exec(handle, "insert into users (username, name, email, password, activated_at, created_at) values (" + values + ")");
                debug("提示：系统已自动在bbs.mud.ren注册账号，你可以使用游戏账号和密码登录社区。");
            }

            db_close(handle);
        }
    }
#else
    debug("注意：数据库功能被禁用，无法注册论坛账号。");
#endif
}
*/
