/**
 * 玩家存档缓存接口
 * 缓存玩家数据到db.sqlite，方便网页、全服排行等调用
 */
#ifdef __USE_SQLITE3__
// 初始化数据库
mixed init_db();
// 玩家数据缓存接口
mixed insert(object user, int last_touched);
// 玩家数据更新接口
mixed update(object user);
// 玩家数据删除接口
mixed delete(object user);

nosave object db;

void create()
{
    db = new (DATABASE, "", "/data/db.sqlite", "", __USE_SQLITE3__);
}

mixed init_db()
{
    mixed res;

    db->sql("DROP TABLE IF EXISTS `users`")->exec();
    res = db->sql("CREATE TABLE IF NOT EXISTS `users` (
        `id` VARCHAR(10) PRIMARY KEY NOT NULL,
        `name` VARCHAR(10) NOT NULL,
        `title` VARCHAR(50) DEFAULT NULL,
        `master` VARCHAR(10) DEFAULT NULL,
        `mobile` INTEGER DEFAULT NULL,
        `age` INTEGER DEFAULT NULL,
        `qi` INTEGER DEFAULT NULL,
        `jing` INTEGER DEFAULT NULL,
        `neili` INTEGER DEFAULT NULL,
        `jingli` INTEGER DEFAULT NULL,
        `combat_exp` INTEGER DEFAULT NULL,
        `kill` INTEGER DEFAULT NULL,
        `die` INTEGER DEFAULT NULL,
        `updated_at` INTEGER DEFAULT NULL) ")->exec();

    if (stringp(res))
    {
        env("CACHE_DATA", 0);
    }

    return res;
}

mixed insert(object user, int last_touched)
{
    mixed res;
    mapping my = user->query_entire_dbase();
    string master = mapp(my["family"]) ? my["family"]["master_name"] : "";
    int kill = 0, die = 0;

    if (mapp(my["combat"]))
    {
        kill = my["combat"]["MKS"] + my["combat"]["PKS"];
        die = my["combat"]["dietimes"];
    }

    res = db->table("users")->insert(([
        "id"         : my["id"],
        "name"       : my["name"],
        "title"      : my["title"],
        "mobile"     : my["mobile"],
        "age"        : my["age"],
        "qi"         : my["max_qi"],
        "jing"       : my["max_jing"],
        "neili"      : my["max_neili"],
        "jingli"     : my["max_jingli"],
        "combat_exp" : my["combat_exp"],
        "master"     : master,
        "kill"       : kill,
        "die"        : die,
        "updated_at" : last_touched,
    ]));

    return res;
}

mixed update(object user)
{
    mixed res;
    mapping my = user->query_entire_dbase();
    string master = mapp(my["family"]) ? my["family"]["master_name"] || "" : "";
    int kill = 0, die = 0;

    if (mapp(my["combat"]))
    {
        kill = my["combat"]["MKS"] + my["combat"]["PKS"];
        die = my["combat"]["dietimes"];
    }

    res = db->table("users")->where("id", my["id"])->update(([
        "name"       : my["name"],
        "title"      : my["title"],
        "mobile"     : my["mobile"],
        "age"        : my["age"],
        "qi"         : my["max_qi"],
        "jing"       : my["max_jing"],
        "neili"      : my["max_neili"],
        "jingli"     : my["max_jingli"],
        "combat_exp" : my["combat_exp"],
        "master"     : master,
        "kill"       : kill,
        "die"        : die,
        "updated_at" : time(),
    ]));

    return res;
}

mixed delete(object user)
{
    mixed res;

    res = db->table("users")->where("id", user->query("id"))->delete ();

    return res;
}

varargs mixed get(string column, string order)
{
    mixed res;
    column = column || "combat_exp";
    order = order || "desc";

    res = db->table("users")->orderBy(column, order)->get();

    return res;
}
#endif
