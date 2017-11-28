// 店铺继承
// Create by smallfish.
// Update by jjgod.

inherit ROOM;
inherit F_SAVE;

#include <ansi.h>

string long()
{
        switch (query("shop_type"))
        {
        // 店铺关闭时的描述
        case 0  : return query("long");
        // 店铺开放时的描述
        default : 
                // 默认描述
                if (! stringp(query("open_long")))
                        return @LONG
这里是一间装饰得非常豪华的店铺，铺面宽敞明亮，柜子
上摆满了各式各样、琳琅满目的货物。此时一位伙计正忙里忙
外地招呼着客人。
LONG;
                // 特殊描述
                else return query("open_long");
        }
}

void setup()
{
        object waiter, ob;
        string *props, prop;
        mapping m;

        ::setup();
        if (! restore())
                save();

        ob = this_object();
        waiter = present("huo ji", ob);

        if (waiter)
        {
                if (! mapp(m = ob->query("waiter"))) return;
                props = keys(m);

                if (! props) return;
                foreach (prop in props)
                {
                        if (prop == "name")
                                waiter->set_name(ob->query("waiter/" + prop),
                                                 waiter->parse_command_id_list());
                        waiter->set(prop, ob->query("waiter/" + prop));
                }
        }
}

string query_save_file()
{
        string id;

        sscanf(base_name(this_object()), "/%*s/%*s/%s_shop", id);

        if (! stringp(id)) return 0;

        return sprintf(DATA_DIR "/shop/%s", id);
}

int save()
{
        string file;

        if (stringp(file = this_object()->query_save_file()))
        {
                assure_file(file + __SAVE_EXTENSION__);
                return save_object(file);
        }
        return 0;
}

int restore()
{
        string file;

        if (stringp(file = this_object()->query_save_file()) &&
            file_size(file + __SAVE_EXTENSION__) > 0)
                return restore_object(file);

        return 0;
}
