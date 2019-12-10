// shop.c

inherit F_CLEAN_UP;

#include <ansi.h>

int help(object me);

int main(object me, string arg)
{
        string name, id;

        if (! arg)
        {
                SHOP_D->list_shop(me);
                return 1;
        }

        if (! SECURITY_D->valid_grant(me, "(wizard)"))
                return notify_fail("你没有权力使用店铺管理指令。\n");

        switch (arg)
        {
        case "open"  : SHOP_D->open_all(me); break;
        case "close" : SHOP_D->close_all(me); break;
        case "reset" : SHOP_D->reset_all(me); break;
        default :
                if (sscanf(arg, "open %s", name))
                {
                        SHOP_D->open_shop(me, name);
                        break;
                }
                if (sscanf(arg, "close %s", name))
                {
                        SHOP_D->close_shop(me, name);
                        break;
                }
                if (sscanf(arg, "reset %s", name))
                {
                        SHOP_D->reset_shop(me, name);
                        break;
                }
                if (sscanf(arg, "owner %s %s", name, id))
                {
                        SHOP_D->change_owner(me, name, id);
                        break;
                }
                else return help(me);
        }

        return 1;
}

int help (object me)
{
	write(@HELP

指令格式：shop [ open [店铺名称] ]  | [ close [店铺名称] ] |
               [ reset [店铺名称] ] | [ owner <店铺名称> <店主ID> ]

查看当前游戏中的店铺经营状况。

巫师可以用于管理店铺。使用 open 参数开放指定的一个店铺或
者所有店铺，使用close 参数将关闭指定的一个店铺或者所有店
铺，reset 参数重新初始化指定的一个店铺或者所有店铺。而使
用owner 参数则是设置店主的 id。

HELP);
        return 1;
}
