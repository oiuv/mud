inherit ITEM;
#include <ansi.h>

void create()
{
        set_name(HIW "极北寒玉" NOR, ({"jibei hanyu", "jibei", "hanyu", "yu"}));
        set_weight(1000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIW "极地万年寒冰凝结而成，散发出雪一般的光泽。\n" NOR);
                set("unit", "块");
                set("value", 15000);
        }
        
        setup();
        move("/d/lingxiao/yudong");
}

int query_autoload()
{
        return 1;
}

