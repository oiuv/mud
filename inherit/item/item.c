// item.c

#include <dbase.h>
#include <move.h>
#include <name.h>

inherit F_CLEAN_UP;
inherit F_DBASE;
inherit F_MOVE;
inherit F_NAME;

STATIC_VAR_TAG string s_name;
STATIC_VAR_TAG string s_id;

void setup()
{
	seteuid(getuid());
}

void set_name(string name, string *id)
{
        ::set_name(name, id);
        s_name = ::query("name");
        s_id = ::query("id");
}

string short()
{
        string colorname;

        if (! stringp(colorname = this_object()->query("colorname"))) 
                return s_name + "(" + s_id + ")";
        else
                return colorname + "(" + s_id + ")";
}


int fire(object me, object ob)
{
        string msg;

        if (this_object()->is_item_make())
                return notify_fail("你累得满头大汗，怎么点也点不着。\n");

        if (stringp(msg = query("no_light")))
                return notify_fail(msg);

        switch (query("material"))
        {
        case "wood":
                msg = "$N把$n放在$f下面点燃了，火光闪动，渐"
                      "渐只剩下了一团碳粉碎渣。\n";
                break;
        case "leather":
        case "feather":
        case "silk":
                msg = "$N用$f把$n点着了，结果散发出一阵令人难闻的臭味。\n";
                break;
        case "paper":
        case "cloth":
                msg = "$N点着了$n，火苗闪了几闪，很快就"
                      "烧了个干干净净，什么都没有剩下来。\n";
                break;
        default:
                return notify_fail("这东西看上去没法点，还是省省力气吧。\n");
        }

        msg = replace_string(msg, "$n", name());
        msg = replace_string(msg, "$f", ob->name());
        message_vision(msg, me);
        destruct(this_object());
        return 1;
}



string type()
{
        if ( this_object()->is_weapon() )
                return "武器";
        if ( this_object()->is_armor() )
                return "防具";
        if ( this_object()->is_food() )
                return "食物";
        if ( this_object()->is_liquid() )
                return "饮具";
        if ( this_object()->is_container() )
                return "容器";
        if ( this_object()->is_book() )
                return "书物";
        if ( this_object()->is_money() )
                return "货币";
        if ( this_object()->is_charm() )
                return "护身符";
        if ( this_object()->is_rune() )
                return "符文";
        if ( this_object()->is_inlaid() )
                return "镶嵌物";
        if ( this_object()->is_task() )
                return "任务物品";
        return "杂物";
}

