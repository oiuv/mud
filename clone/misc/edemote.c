// edemote.c emote编辑器

#include <ansi.h>

inherit ITEM;
inherit F_AUTOLOAD;

void create()
{
        set_name(HIC "表情动词编辑器" NOR, ({"emote editor", "editor"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "架");
                set("long", "这是一架看起来怪怪的仪器，上面贴着说明(help editor)。\n");
                set("value", 1);
                set("no_sell", 1);
        }
        setup();
}

int query_autoload()
{
        return 1;
}

int do_help(string arg)
{
        if (! arg || ! id(arg))
                return notify_fail("你要看什么帮助？\n");
        write (@HELP
关于表情动词编辑器的说明：

可以使用的命令包括 edemote、cpemote、rnemote，具体请参见这
些命令的帮助。

HELP );
        return 1;
}

